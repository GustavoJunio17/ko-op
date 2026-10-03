// Versões do roadmap: cada salvamento de qualquer ficha gera uma versão nova
// do roadmap inteiro. Para ver o roadmap numa versão, cada ficha usa a sua
// última versão salva até aquele momento.

import { sheets, type SheetData, type SheetDoc } from "./sheets";

export type RoadmapVersion = {
  id: string;
  number: number;
  at: string;
  author: string;
  note: string;
  detail?: string;
  sheetId: string;
  sheetTitle: string;
};

// `docs` na mesma ordem de `sheets`. Retorna da mais antiga para a mais nova.
export function roadmapVersions(docs: SheetDoc[]): RoadmapVersion[] {
  return sheets
    .flatMap((sheet, i) =>
      docs[i].versions.map((v) => ({
        id: v.id,
        at: v.at,
        author: v.author,
        note: v.note,
        detail: v.detail,
        sheetId: sheet.id,
        sheetTitle: sheet.title,
      })),
    )
    .sort((a, b) => a.at.localeCompare(b.at))
    .map((v, i) => ({ ...v, number: i + 1 }));
}

// Conteúdo de cada ficha no momento `at`.
export function snapshotAt(docs: SheetDoc[], at: string): SheetData[] {
  return docs.map((doc) => {
    const past = doc.versions.filter((v) => v.at <= at);
    return past.length ? past[past.length - 1].data : {};
  });
}
