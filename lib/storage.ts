import "server-only";
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import type { SheetDoc } from "@/content/sheets";

// Cada ficha vive em content/data/<id>.json com o valor atual e o histórico
// de versões (ver SheetDoc). Onde o arquivo é gravado depende do ambiente:
//
// - "github":   GITHUB_TOKEN definido. Lê e grava pela API do GitHub (produção).
// - "local":    sem token, em desenvolvimento. Lê e grava no disco.
// - "readonly": sem token, em produção. Só leitura dos arquivos do deploy.

export type StorageMode = "github" | "local" | "readonly";

const DATA_DIR = "content/data";
export const SHEETS_TAG = "sheets";

export function storageMode(): StorageMode {
  if (process.env.GITHUB_TOKEN) return "github";
  return process.env.NODE_ENV === "development" ? "local" : "readonly";
}

function repo() {
  const [envOwner, envName] = (process.env.GITHUB_REPO ?? "").split("/");
  const owner = envOwner || process.env.VERCEL_GIT_REPO_OWNER;
  const name = envName || process.env.VERCEL_GIT_REPO_SLUG;
  const branch = process.env.GITHUB_BRANCH || process.env.VERCEL_GIT_COMMIT_REF || "main";
  if (!owner || !name) {
    throw new Error("Defina GITHUB_REPO (dono/repositorio) para usar o GitHub como storage.");
  }
  return { owner, name, branch };
}

function filePath(id: string) {
  return `${DATA_DIR}/${id}.json`;
}

function parse(text: string | null | undefined): SheetDoc {
  if (!text) return { data: {}, versions: [] };
  try {
    const doc = JSON.parse(text);
    return {
      data: doc?.data && typeof doc.data === "object" ? doc.data : {},
      versions: Array.isArray(doc?.versions) ? doc.versions : [],
    };
  } catch {
    return { data: {}, versions: [] };
  }
}

async function github(endpoint: string, init?: RequestInit & { next?: NextFetchRequestConfig }) {
  const res = await fetch(`https://api.github.com${endpoint}`, {
    ...init,
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
      "X-GitHub-Api-Version": "2022-11-28",
      ...init?.headers,
    },
  });
  if (res.status === 404) return null;
  if (!res.ok) {
    throw new Error(`GitHub ${res.status}: ${await res.text()}`);
  }
  return res.json();
}

type ContentsResponse = { content: string; sha: string };

async function githubContents(id: string, fresh: boolean) {
  const { owner, name, branch } = repo();
  const content: ContentsResponse | null = await github(
    `/repos/${owner}/${name}/contents/${filePath(id)}?ref=${encodeURIComponent(branch)}`,
    fresh ? { cache: "no-store" } : { cache: "force-cache", next: { tags: [SHEETS_TAG] } },
  );
  return content;
}

// `fresh` ignora o cache; usado antes de gravar para não perder versões.
export async function readSheet(id: string, { fresh = false } = {}): Promise<SheetDoc> {
  if (storageMode() === "github") {
    const content = await githubContents(id, fresh);
    return parse(content ? Buffer.from(content.content, "base64").toString("utf8") : null);
  }
  try {
    return parse(await readFile(path.join(process.cwd(), filePath(id)), "utf8"));
  } catch {
    return { data: {}, versions: [] };
  }
}

export async function writeSheet(id: string, doc: SheetDoc, message: string) {
  const body = JSON.stringify(doc, null, 2) + "\n";
  const mode = storageMode();

  if (mode === "readonly") {
    throw new Error("Edição desativada: configure GITHUB_TOKEN no ambiente.");
  }

  if (mode === "local") {
    await writeFile(path.join(process.cwd(), filePath(id)), body, "utf8");
    return;
  }

  const { owner, name, branch } = repo();
  const current = await githubContents(id, true);
  await github(`/repos/${owner}/${name}/contents/${filePath(id)}`, {
    method: "PUT",
    cache: "no-store",
    body: JSON.stringify({
      message,
      branch,
      content: Buffer.from(body, "utf8").toString("base64"),
      ...(current ? { sha: current.sha } : {}),
    }),
  });
}
