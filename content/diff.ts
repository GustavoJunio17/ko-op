// Calcula o que mudou entre duas versões de uma ficha, campo a campo.

import {
  valueFor,
  type Field,
  type ListValue,
  type OptionsValue,
  type Sheet,
  type SheetData,
  type TableValue,
  type TextValue,
} from "./sheets";

export type LineOp = { op: "same" | "add" | "del"; text: string };

export type Change =
  | { kind: "lines"; lines: LineOp[] }
  | { kind: "item"; label: string; before: string; after: string };

export type FieldDiff = { field: Field; changes: Change[] };

function splitLines(text: string) {
  return text.split("\n").map((l) => l.trimEnd()).filter((l) => l.trim() !== "");
}

// Diff de linhas por LCS. As fichas são pequenas, então O(n·m) basta.
export function diffLines(before: string, after: string): LineOp[] {
  const a = splitLines(before);
  const b = splitLines(after);
  const lcs = Array.from({ length: a.length + 1 }, () => new Array<number>(b.length + 1).fill(0));
  for (let i = a.length - 1; i >= 0; i--) {
    for (let j = b.length - 1; j >= 0; j--) {
      lcs[i][j] = a[i] === b[j] ? lcs[i + 1][j + 1] + 1 : Math.max(lcs[i + 1][j], lcs[i][j + 1]);
    }
  }
  const ops: LineOp[] = [];
  let i = 0;
  let j = 0;
  while (i < a.length && j < b.length) {
    if (a[i] === b[j]) {
      ops.push({ op: "same", text: a[i] });
      i++;
      j++;
    } else if (lcs[i + 1][j] >= lcs[i][j + 1]) {
      ops.push({ op: "del", text: a[i++] });
    } else {
      ops.push({ op: "add", text: b[j++] });
    }
  }
  while (i < a.length) ops.push({ op: "del", text: a[i++] });
  while (j < b.length) ops.push({ op: "add", text: b[j++] });
  return ops;
}

function diffField(field: Field, before: SheetData, after: SheetData): Change[] {
  const a = valueFor(field, before);
  const b = valueFor(field, after);

  switch (field.type) {
    case "text": {
      const lines = diffLines(a as TextValue, b as TextValue);
      return lines.some((l) => l.op !== "same") ? [{ kind: "lines", lines }] : [];
    }

    case "list":
      return (b as ListValue).flatMap((after, i) => {
        const before = (a as ListValue)[i];
        return before.trim() === after.trim()
          ? []
          : [{ kind: "item" as const, label: `${i + 1}.`, before, after }];
      });

    case "table":
      return (b as TableValue).flatMap((row, i) =>
        field.columns.flatMap((c) => {
          const before = (a as TableValue)[i][c.key];
          const after = row[c.key];
          return before.trim() === after.trim()
            ? []
            : [{ kind: "item" as const, label: `Linha ${i + 1} · ${c.label}`, before, after }];
        }),
      );

    case "options": {
      const va = a as OptionsValue;
      const vb = b as OptionsValue;
      return field.options.flatMap((o) => {
        const out: Change[] = [];
        const was = va.checked.includes(o.key);
        const is = vb.checked.includes(o.key);
        if (was !== is) {
          out.push({
            kind: "item",
            label: o.label,
            before: was ? "Marcado" : "Desmarcado",
            after: is ? "Marcado" : "Desmarcado",
          });
        }
        const na = va.notes[o.key] ?? "";
        const nb = vb.notes[o.key] ?? "";
        if (field.noteLabel && na.trim() !== nb.trim()) {
          out.push({ kind: "item", label: `${o.label} · ${field.noteLabel}`, before: na, after: nb });
        }
        return out;
      });
    }
  }
}

export function diffSheet(sheet: Sheet, before: SheetData, after: SheetData): FieldDiff[] {
  return sheet.fields
    .map((field) => ({ field, changes: diffField(field, before, after) }))
    .filter((d) => d.changes.length > 0);
}
