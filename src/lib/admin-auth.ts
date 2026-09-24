import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export const ADMIN_COOKIE = "admin_session";
export const ADMIN_SESSION_SECONDS = 60 * 60 * 8;

// Sin ADMIN_PASSWORD configurada el panel queda bloqueado (fail closed).
function secret(): string | null {
  return process.env.ADMIN_PASSWORD || null;
}

function sign(value: string, key: string) {
  return createHmac("sha256", key).update(value).digest("hex");
}

export function checkPassword(input: string): boolean {
  const key = secret();
  if (!key) return false;
  const a = createHmac("sha256", "pw-check").update(input).digest();
  const b = createHmac("sha256", "pw-check").update(key).digest();
  return timingSafeEqual(a, b);
}

export function createSessionToken(): string {
  const key = secret();
  if (!key) throw new Error("ADMIN_PASSWORD no está configurada");
  const exp = Math.floor(Date.now() / 1000) + ADMIN_SESSION_SECONDS;
  return `${exp}.${sign(String(exp), key)}`;
}

export async function isAdmin(): Promise<boolean> {
  const key = secret();
  if (!key) return false;
  const token = (await cookies()).get(ADMIN_COOKIE)?.value;
  if (!token) return false;

  const [exp, sig] = token.split(".");
  if (!exp || !sig || Number(exp) < Date.now() / 1000) return false;

  const expected = Buffer.from(sign(exp, key));
  const received = Buffer.from(sig);
  return expected.length === received.length && timingSafeEqual(expected, received);
}

export function unauthorized() {
  return NextResponse.json({ error: "No autorizado" }, { status: 401 });
}
