"use server";

import { randomUUID } from "node:crypto";
import { updateTag } from "next/cache";
import { getSheet, valueFor, type SheetData, type SheetVersion } from "@/content/sheets";
import { checkPassword } from "@/lib/auth";
import { readSheet, SHEETS_TAG, writeSheet } from "@/lib/storage";

export type SaveResult = { ok: true; changed: boolean } | { ok: false; error: string };

export async function saveSheet(
  id: string,
  input: SheetData,
  meta: { author: string; note: string; password: string },
): Promise<SaveResult> {
  if (!checkPassword(meta.password)) return { ok: false, error: "Senha incorreta." };
  const sheet = getSheet(id);
  if (!sheet) return { ok: false, error: "Ficha não encontrada." };

  // Só persiste campos conhecidos, já no formato do schema.
  const normalize = (d: SheetData): SheetData =>
    Object.fromEntries(sheet.fields.map((f) => [f.key, valueFor(f, d)]));
  const data = normalize(input);

  try {
    const doc = await readSheet(id, { fresh: true });
    if (JSON.stringify(normalize(doc.data)) === JSON.stringify(data)) {
      return { ok: true, changed: false };
    }

    const version: SheetVersion = {
      id: randomUUID(),
      at: new Date().toISOString(),
      author: meta.author.trim().slice(0, 80) || "Anônimo",
      note: meta.note.trim().slice(0, 280),
      data,
    };
    await writeSheet(
      id,
      { data, versions: [...doc.versions, version] },
      `docs(roadmap): ${sheet.title} — ${version.note || "atualização"} (${version.author})`,
    );
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Falha ao salvar." };
  }
  updateTag(SHEETS_TAG);
  return { ok: true, changed: true };
}
