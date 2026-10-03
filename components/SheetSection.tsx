"use client";

import { useState, useTransition } from "react";
import { saveSheet } from "@/app/actions";
import { valueFor, type FieldValue, type Sheet, type SheetData } from "@/content/sheets";
import { FieldInput, FieldView } from "./fields";

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

type Editing = { draft: SheetData; author: string; note: string; password: string };

export function SheetSection({
  sheet,
  data,
  status,
  changedHere,
  canEdit,
  needsPassword,
}: {
  sheet: Sheet;
  data: SheetData;
  status: string;
  changedHere: boolean;
  canEdit: boolean;
  needsPassword: boolean;
}) {
  const [editing, setEditing] = useState<Editing | null>(null);
  const [message, setMessage] = useState<{ tone: "error" | "info"; text: string } | null>(null);
  const [pending, startTransition] = useTransition();

  function startEdit() {
    setMessage(null);
    setEditing({
      draft: Object.fromEntries(sheet.fields.map((f) => [f.key, valueFor(f, data)])),
      author: loadAuthor(),
      note: "",
      password: "",
    });
  }

  function setField(key: string, value: FieldValue) {
    setEditing((e) => (e ? { ...e, draft: { ...e.draft, [key]: value } } : e));
  }

  function save() {
    if (!editing) return;
    const { draft, author, note, password } = editing;
    if (needsPassword && !password) {
      setMessage({ tone: "error", text: "Digite a senha para confirmar." });
      return;
    }
    storeAuthor(author);
    startTransition(async () => {
      const res = await saveSheet(sheet.id, draft, { author, note, password });
      if (!res.ok) {
        setMessage({ tone: "error", text: res.error });
        return;
      }
      setEditing(null);
      setMessage(
        res.changed
          ? { tone: "info", text: "Salvo. Uma nova versão do roadmap foi criada." }
          : { tone: "info", text: "Nada mudou, então nenhuma versão nova foi criada." },
      );
    });
  }

  return (
    <section id={sheet.id} className="sheet" data-editing={!!editing}>
      <header className="sheet-head">
        <div>
          <p className="sheet-block">
            {sheet.block} <span className="sheet-status">· {status}</span>
            {changedHere && <span className="changed-tag">Alterada nesta versão</span>}
          </p>
          <h2>{sheet.title}</h2>
          <p className="sheet-desc">{sheet.description}</p>
        </div>
        {canEdit && !editing && (
          <button type="button" className="text-button" onClick={startEdit}>
            Editar
          </button>
        )}
      </header>

      {message && !editing && (
        <p className={message.tone === "error" ? "alert" : "note"}>{message.text}</p>
      )}

      <dl className="form">
        {sheet.fields.map((field) => (
          <div key={field.key} className="form-row">
            <dt>
              {field.label}
              {field.hint && <small>{field.hint}</small>}
            </dt>
            <dd>
              {editing ? (
                <FieldInput
                  field={field}
                  value={valueFor(field, editing.draft)}
                  onChange={(v) => setField(field.key, v)}
                />
              ) : (
                <FieldView field={field} value={valueFor(field, data)} />
              )}
            </dd>
          </div>
        ))}
      </dl>

      {editing && (
        <div className="save-bar">
          {message && <p className="alert save-bar-message">{message.text}</p>}
          <input
            value={editing.author}
            onChange={(e) => setEditing({ ...editing, author: e.target.value })}
            placeholder="Seu nome"
            aria-label="Seu nome"
          />
          <input
            value={editing.note}
            onChange={(e) => setEditing({ ...editing, note: e.target.value })}
            placeholder="O que mudou? (aparece no seletor de versões)"
            aria-label="Descrição da mudança"
          />
          {needsPassword && (
            <input
              type="password"
              value={editing.password}
              onChange={(e) => setEditing({ ...editing, password: e.target.value })}
              onKeyDown={(e) => e.key === "Enter" && save()}
              placeholder="Senha"
              aria-label="Senha de edição"
              autoComplete="current-password"
            />
          )}
          <div className="save-actions">
            <button
              type="button"
              className="button-secondary"
              onClick={() => setEditing(null)}
              disabled={pending}
            >
              Cancelar
            </button>
            <button type="button" className="button" onClick={save} disabled={pending}>
              {pending ? "Salvando…" : "Salvar"}
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
