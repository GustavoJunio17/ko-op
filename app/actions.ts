"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { getSheet, valueFor, type SheetData } from "@/content/sheets";
import { checkPassword } from "@/lib/auth";
import { updateSheet } from "@/lib/storage";

export type SaveResult = { ok: true; changed: boolean } | { ok: false; error: string };

export async function saveSheet(
  id: string,
  input: SheetData,
  meta: { author: string; note: string; password: string },
): Promise<SaveResult> {
  if (!process.env.ADMIN_PASSWORD && process.env.NODE_ENV !== "development") {
    return { ok: false, error: "Edição indisponível: a variável ADMIN_PASSWORD não está configurada no servidor." };
  }
  if (!checkPassword(meta.password)) return { ok: false, error: "Senha incorreta." };
  const sheet = getSheet(id);
  if (!sheet) return { ok: false, error: "Ficha não encontrada." };

  // Só persiste campos conhecidos, já no formato do schema.
  const normalize = (d: SheetData): SheetData =>
    Object.fromEntries(sheet.fields.map((f) => [f.key, valueFor(f, d)]));
  const data = normalize(input);

  let changed: boolean;
  try {
    changed = await updateSheet(id, (doc) => {
      if (JSON.stringify(normalize(doc.data)) === JSON.stringify(data)) return null;
      return {
        data,
        versions: [
          ...doc.versions,
          {
            id: randomUUID(),
            at: new Date().toISOString(),
            author: meta.author.trim().slice(0, 80) || "Anônimo",
            note: meta.note.trim().slice(0, 280),
            data,
          },
        ],
      };
    });
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Falha ao salvar." };
  }
  if (changed) revalidatePath("/");
  return { ok: true, changed };
}
