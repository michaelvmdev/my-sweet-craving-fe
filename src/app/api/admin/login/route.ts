import { NextResponse } from "next/server";
import {
  ADMIN_COOKIE,
  ADMIN_SESSION_SECONDS,
  createSessionToken,
  verifyCredentials,
} from "@/lib/admin-auth";

export async function POST(request: Request) {
  if (!process.env.ADMIN_SESSION_SECRET && !process.env.DATABASE_URL) {
    return NextResponse.json({ error: "El panel no está configurado" }, { status: 503 });
  }

  const body = await request.json().catch(() => null);
  const username = typeof body?.username === "string" ? body.username.trim() : "";
  const password = typeof body?.password === "string" ? body.password : "";

  const userId = await verifyCredentials(username, password).catch((err) => {
    console.error(err);
    return null;
  });

  if (!userId) {
    await new Promise((r) => setTimeout(r, 600)); // frena la fuerza bruta
    return NextResponse.json({ error: "Usuario o contraseña incorrectos" }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE, createSessionToken(userId), {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: ADMIN_SESSION_SECONDS,
  });
  return res;
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.delete(ADMIN_COOKIE);
  return res;
}
