import "server-only";
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { BlobPreconditionFailedError, get, put } from "@vercel/blob";
import type { SheetDoc } from "@/content/sheets";

// Cada ficha é um JSON com o valor atual e o histórico de versões (SheetDoc).
// Onde ele é gravado depende do ambiente:
//
// - "blob":     um Blob store da Vercel está conectado ao projeto (BLOB_STORE_ID,
//               com autenticação automática, ou BLOB_READ_WRITE_TOKEN). Produção.
// - "local":    sem Blob, em desenvolvimento. Lê e grava em content/data/ no disco.
// - "readonly": sem Blob, em produção. Só leitura dos arquivos do deploy.
//
// No modo "blob", uma ficha que ainda não foi salva no Blob usa o arquivo de
// content/data/ do repositório como ponto de partida.

export type StorageMode = "blob" | "local" | "readonly";

const DATA_DIR = "content/data";
const BLOB_PREFIX = "roadmap";

const empty = (): SheetDoc => ({ data: {}, versions: [] });

export function storageMode(): StorageMode {
  if (process.env.BLOB_STORE_ID || process.env.BLOB_READ_WRITE_TOKEN) return "blob";
  return process.env.NODE_ENV === "development" ? "local" : "readonly";
}

function parse(text: string | null | undefined): SheetDoc {
  if (!text) return empty();
  try {
    const doc = JSON.parse(text);
    return {
      data: doc?.data && typeof doc.data === "object" ? doc.data : {},
      versions: Array.isArray(doc?.versions) ? doc.versions : [],
    };
  } catch {
    return empty();
  }
}

async function readRepoFile(id: string): Promise<SheetDoc> {
  try {
    return parse(await readFile(path.join(process.cwd(), DATA_DIR, `${id}.json`), "utf8"));
  } catch {
    return empty();
  }
}

// Lê do Blob sem cache (as edições precisam aparecer na hora) e devolve o
// etag para a gravação detectar se alguém salvou a mesma ficha no meio tempo.
async function readBlob(id: string): Promise<{ doc: SheetDoc; etag?: string }> {
  const res = await get(`${BLOB_PREFIX}/${id}.json`, { access: "private", useCache: false });
  if (!res || res.statusCode !== 200) return { doc: await readRepoFile(id) };
  return { doc: parse(await new Response(res.stream).text()), etag: res.blob.etag };
}

export async function readSheet(id: string): Promise<SheetDoc> {
  if (storageMode() === "blob") return (await readBlob(id)).doc;
  return readRepoFile(id);
}

// Lê a ficha, aplica `update` e grava. Se outra pessoa salvou a mesma ficha
// entre a leitura e a gravação, tenta de novo sobre a versão mais nova.
// `update` devolve null quando não há nada para gravar.
export async function updateSheet(
  id: string,
  update: (doc: SheetDoc) => SheetDoc | null,
): Promise<boolean> {
  const mode = storageMode();

  if (mode === "readonly") {
    throw new Error(
      "Edição indisponível: conecte um Blob store ao projeto na Vercel (Storage → Create → Blob).",
    );
  }

  if (mode === "local") {
    const next = update(await readRepoFile(id));
    if (!next) return false;
    await writeFile(
      path.join(process.cwd(), DATA_DIR, `${id}.json`),
      JSON.stringify(next, null, 2) + "\n",
      "utf8",
    );
    return true;
  }

  for (let attempt = 0; attempt < 3; attempt++) {
    const { doc, etag } = await readBlob(id);
    const next = update(doc);
    if (!next) return false;
    try {
      await put(`${BLOB_PREFIX}/${id}.json`, JSON.stringify(next), {
        access: "private",
        contentType: "application/json",
        addRandomSuffix: false,
        allowOverwrite: true,
        ...(etag ? { ifMatch: etag } : {}),
      });
      return true;
    } catch (e) {
      if (e instanceof BlobPreconditionFailedError) continue;
      throw e;
    }
  }
  throw new Error("Outra pessoa está salvando esta ficha agora. Tente de novo.");
}
