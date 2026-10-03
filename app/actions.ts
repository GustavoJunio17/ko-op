"use server";

import { randomUUID } from "node:crypto";
import { updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { diffSheet } from "@/content/diff";
import { getSheet, valueFor, type SheetData, type SheetVersion } from "@/content/sheets";
import { isAdmin, signIn, signOut } from "@/lib/auth";
import { readSheet, SHEETS_TAG, writeSheet } from "@/lib/storage";

export type SaveResult = { ok: true; changed: boolean } | { ok: false; error: string };

export async function saveSheet(
  id: string,
  input: SheetData,
  meta: { author: string; note: string },
): Promise<SaveResult> {
  if (!(await isAdmin())) return { ok: false, error: "Sem permissão para editar." };
  const sheet = getSheet(id);
  if (!sheet) return { ok: false, error: "Ficha não encontrada." };

  // Só persiste campos conhecidos, já no formato do schema.
  const data: SheetData = Object.fromEntries(
    sheet.fields.map((f) => [f.key, valueFor(f, input)]),
  );

  try {
    const doc = await readSheet(id, { fresh: true });
    if (diffSheet(sheet, doc.data, data).length === 0) return { ok: true, changed: false };

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

// Versões da mais recente para a mais antiga.
export async function getVersions(id: string): Promise<SheetVersion[]> {
  if (!getSheet(id)) return [];
  const doc = await readSheet(id);
  return [...doc.versions].reverse();
}

export type LoginState = { error?: string };

export async function login(_: LoginState, formData: FormData): Promise<LoginState> {
  const ok = await signIn(String(formData.get("password") ?? ""));
  if (!ok) return { error: "Senha incorreta." };
  redirect("/");
}

export async function logout() {
  await signOut();
  redirect("/");
}
