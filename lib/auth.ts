import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

// Modo de edição protegido por uma senha única (ADMIN_PASSWORD).
// Sem a variável: liberado em desenvolvimento, bloqueado em produção.

const COOKIE = "koop_admin";

function token(password: string) {
  return createHmac("sha256", password).update("ko-op:admin").digest("hex");
}

function safeEqual(a: string, b: string) {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  return ab.length === bb.length && timingSafeEqual(ab, bb);
}

export async function isAdmin() {
  // Ler cookies antes de tudo mantém a página dinâmica em qualquer cenário.
  const value = (await cookies()).get(COOKIE)?.value;
  const password = process.env.ADMIN_PASSWORD;
  if (!password) return process.env.NODE_ENV === "development";
  return !!value && safeEqual(value, token(password));
}

export async function signIn(attempt: string) {
  const password = process.env.ADMIN_PASSWORD;
  if (!password || !safeEqual(attempt, password)) return false;
  (await cookies()).set(COOKIE, token(password), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  return true;
}

export async function signOut() {
  (await cookies()).delete(COOKIE);
}
