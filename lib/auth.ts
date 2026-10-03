import "server-only";
import { timingSafeEqual } from "node:crypto";

// A edição é confirmada com a senha de ADMIN_PASSWORD na hora de salvar.
// Sem a variável: liberado em desenvolvimento, bloqueado em produção.
export function checkPassword(attempt: string) {
  const password = process.env.ADMIN_PASSWORD;
  if (!password) return process.env.NODE_ENV === "development";
  const a = Buffer.from(attempt);
  const b = Buffer.from(password);
  return a.length === b.length && timingSafeEqual(a, b);
}
