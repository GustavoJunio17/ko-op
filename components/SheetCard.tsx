"use client";

import { useState, useTransition } from "react";
import { getVersions, saveSheet } from "@/app/actions";
import { diffSheet } from "@/content/diff";
import {
  sheetStatus,
  valueFor,
  type FieldValue,
  type Sheet,
  type SheetData,
  type SheetStatus,
  type SheetVersion,
} from "@/content/sheets";
import { FieldInput, FieldView } from "./fields";
import { VersionDiff } from "./VersionDiff";

const statusLabel: Record<SheetStatus, string> = {
  vazio: "A preencher",
  "em-andamento": "Em andamento",
  concluido: "Preenchido",
};

const dateFmt = new Intl.DateTimeFormat("pt-BR", {
  dateStyle: "short",
  timeStyle: "short",
  timeZone: "America/Sao_Paulo",
});

const AUTHOR_KEY = "koop:author";

function loadAuthor() {
  try {
    return localStorage.getItem(AUTHOR_KEY) ?? "";
  } catch {
    return "";
  }
}

function storeAuthor(author: string) {
  try {
    localStorage.setItem(AUTHOR_KEY, author);
  } catch {}
}

type Mode =
  | { kind: "view" }
  | { kind: "edit"; draft: SheetData; author: string; note: string }
  | { kind: "history"; versions: SheetVersion[] | null; selected?: number };

export function SheetCard({
  sheet,
  data,
  index,
  canEdit,
}: {
  sheet: Sheet;
  data: SheetData;
  index: number;
  canEdit: boolean;
}) {
  const [mode, setMode] = useState<Mode>({ kind: "view" });
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const status = sheetStatus(sheet, data);

  // Versão selecionada no histórico e a imediatamente anterior a ela.
  const versions = mode.kind === "history" ? mode.versions : null;
  const selected =
    mode.kind === "history" && versions && mode.selected !== undefined
      ? versions[mode.selected]
      : undefined;
  const previous =
    selected && mode.kind === "history" && versions ? versions[mode.selected! + 1] : undefined;

  const shown = selected ? selected.data : data;

  function edit(from: SheetData, note = "") {
    setError(null);
    setNotice(null);
    setMode({
      kind: "edit",
      draft: Object.fromEntries(sheet.fields.map((f) => [f.key, valueFor(f, from)])),
      author: loadAuthor(),
      note,
    });
  }

  function setField(key: string, value: FieldValue) {
    setMode((m) => (m.kind === "edit" ? { ...m, draft: { ...m.draft, [key]: value } } : m));
  }

  function save() {
    if (mode.kind !== "edit") return;
    const { draft, author, note } = mode;
    storeAuthor(author);
    startTransition(async () => {
      const res = await saveSheet(sheet.id, draft, { author, note });
      if (res.ok) {
        setError(null);
        setNotice(res.changed ? null : "Nada mudou — nenhuma versão nova criada.");
        setMode({ kind: "view" });
      } else {
        setError(res.error);
      }
    });
  }

  function openHistory() {
    setError(null);
    setNotice(null);
    setMode({ kind: "history", versions: null });
    startTransition(async () => {
      const list = await getVersions(sheet.id);
      setMode((m) =>
        m.kind === "history" ? { ...m, versions: list, selected: list.length ? 0 : undefined } : m,
      );
    });
  }

  return (
    <li id={sheet.id} className="stage">
      <div className="marker" data-status={status} />
      <span className="block-label">{sheet.block}</span>
      <div className="stage-head">
        <span className="num">{String(index + 1).padStart(2, "0")}</span>
        <h2>{sheet.title}</h2>
        <span className="badge" data-status={status}>
          {statusLabel[status]}
        </span>
        <div className="actions">
          {mode.kind === "view" && (
            <>
              <button type="button" className="btn-ghost" onClick={openHistory}>
                Histórico
              </button>
              {canEdit && (
                <button type="button" className="btn" onClick={() => edit(data)}>
                  Editar
                </button>
              )}
            </>
          )}
          {mode.kind === "history" && (
            <button type="button" className="btn-ghost" onClick={() => setMode({ kind: "view" })}>
              Fechar histórico
            </button>
          )}
        </div>
      </div>
      <p className="summary">{sheet.description}</p>

      {error && <p className="error">{error}</p>}
      {notice && <p className="muted notice">{notice}</p>}

      {mode.kind === "history" && (
        <div className="history">
          {versions === null ? (
            <p className="muted">Carregando versões…</p>
          ) : versions.length === 0 ? (
            <p className="muted">Nenhuma versão salva ainda.</p>
          ) : (
            <>
              <ol className="version-list">
                {versions.map((v, i) => (
                  <li key={v.id} data-active={mode.selected === i}>
                    <button
                      type="button"
                      onClick={() => setMode((m) => (m.kind === "history" ? { ...m, selected: i } : m))}
                    >
                      <span className="num">v{versions.length - i}</span>
                      <span className="version-meta">
                        <span>{v.note || "Sem descrição"}</span>
                        <small>
                          {v.author} · {dateFmt.format(new Date(v.at))}
                        </small>
                      </span>
                    </button>
                  </li>
                ))}
              </ol>

              {selected && (
                <div className="version-detail">
                  <div className="version-head">
                    <div>
                      <strong>
                        v{versions.length - mode.selected!} — {selected.note || "Sem descrição"}
                      </strong>
                      <small>
                        {selected.author} · {dateFmt.format(new Date(selected.at))}
                        {previous ? ` · comparado com v${versions.length - mode.selected! - 1}` : " · primeira versão"}
                      </small>
                    </div>
                    {canEdit && mode.selected !== 0 && (
                      <button
                        type="button"
                        className="btn-ghost"
                        onClick={() =>
                          edit(
                            selected.data,
                            `Restaura v${versions.length - mode.selected!} (${dateFmt.format(new Date(selected.at))})`,
                          )
                        }
                      >
                        Restaurar esta versão
                      </button>
                    )}
                  </div>
                  {selected.detail && <p className="version-detail-text">{selected.detail}</p>}
                  <VersionDiff diffs={diffSheet(sheet, previous?.data ?? {}, selected.data)} />
                  <p className="muted version-foot">Abaixo: conteúdo completo desta versão.</p>
                </div>
              )}
            </>
          )}
        </div>
      )}

      <dl className="fields" data-preview={!!selected}>
        {sheet.fields.map((field) => (
          <div key={field.key} className="field">
            <dt>
              {field.label}
              {field.hint && <small>{field.hint}</small>}
            </dt>
            <dd>
              {mode.kind === "edit" ? (
                <FieldInput
                  field={field}
                  value={valueFor(field, mode.draft)}
                  onChange={(v) => setField(field.key, v)}
                />
              ) : (
                <FieldView field={field} value={valueFor(field, shown)} />
              )}
            </dd>
          </div>
        ))}
      </dl>

      {mode.kind === "edit" && (
        <div className="save-bar">
          <input
            value={mode.author}
            onChange={(e) => setMode({ ...mode, author: e.target.value })}
            placeholder="Seu nome"
            aria-label="Seu nome"
          />
          <input
            value={mode.note}
            onChange={(e) => setMode({ ...mode, note: e.target.value })}
            placeholder="O que mudou? (opcional)"
            aria-label="Descrição da mudança"
          />
          <button
            type="button"
            className="btn-ghost"
            onClick={() => setMode({ kind: "view" })}
            disabled={pending}
          >
            Cancelar
          </button>
          <button type="button" className="btn" onClick={save} disabled={pending}>
            {pending ? "Salvando…" : "Salvar versão"}
          </button>
        </div>
      )}
    </li>
  );
}
