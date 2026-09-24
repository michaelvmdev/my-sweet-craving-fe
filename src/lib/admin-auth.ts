import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { UUID_RE } from "@/lib/admin-products";

export const ADMIN_COOKIE = "admin_session";
export const ADMIN_SESSION_SECONDS = 60 * 60 * 8;

// Clave para firmar la cookie de sesión. Sin ninguna configurada el panel queda bloqueado.
function secret(): string | null {
  return process.env.ADMIN_SESSION_SECRET || process.env.DATABASE_URL || null;
}

function sign(value: string, key: string) {
  return createHmac("sha256", key).update(value).digest("hex");
}

// Valida contra public.users (hash bcrypt verificado con pgcrypto). Devuelve el user_id o null.
export async function verifyCredentials(username: string, password: string): Promise<string | null> {
  if (!username || !password || username.length > 100 || password.length > 200) return null;
  const { rows } = await pool.query<{ user_id: string }>(
    `SELECT user_id FROM users
     WHERE username = $1 AND user_active = TRUE
       AND password_hash = extensions.crypt($2, password_hash)`,
    [username, password]
  );
  return rows[0]?.user_id ?? null;
}

export function createSessionToken(userId: string): string {
  const key = secret();
  if (!key) throw new Error("Falta ADMIN_SESSION_SECRET o DATABASE_URL");
  const exp = Math.floor(Date.now() / 1000) + ADMIN_SESSION_SECONDS;
  const payload = `${userId}.${exp}`;
  return `${payload}.${sign(payload, key)}`;
}

export async function isAdmin(): Promise<boolean> {
  const key = secret();
  if (!key) return false;
  const token = (await cookies()).get(ADMIN_COOKIE)?.value;
  if (!token) return false;

  const parts = token.split(".");
  if (parts.length !== 3) return false;
  const [userId, exp, sig] = parts;
  if (!UUID_RE.test(userId) || Number(exp) < Date.now() / 1000) return false;

  const expected = Buffer.from(sign(`${userId}.${exp}`, key));
  const received = Buffer.from(sig);
  if (expected.length !== received.length || !timingSafeEqual(expected, received)) return false;

  // Si el usuario se desactiva o se borra, su sesión deja de valer de inmediato.
  const { rowCount } = await pool.query(
    "SELECT 1 FROM users WHERE user_id = $1 AND user_active = TRUE",
    [userId]
  );
  return (rowCount ?? 0) > 0;
}

export function unauthorized() {
  return NextResponse.json({ error: "No autorizado" }, { status: 401 });
}
