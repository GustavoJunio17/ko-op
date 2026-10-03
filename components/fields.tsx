import type {
  Field,
  FieldValue,
  ListValue,
  OptionsValue,
  TableValue,
  TextValue,
} from "@/content/sheets";

const empty = <span className="empty">—</span>;

function Lines({ text }: { text: string }) {
  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
  if (lines.length === 0) return empty;
  if (lines.length === 1) return <p>{lines[0]}</p>;
  return (
    <ul className="bullets">
      {lines.map((line, i) => (
        <li key={i}>{line}</li>
      ))}
    </ul>
  );
}

export function FieldView({ field, value }: { field: Field; value: FieldValue }) {
  switch (field.type) {
    case "text":
      return <Lines text={value as TextValue} />;

    case "list": {
      const items = (value as ListValue).map((v, i) => ({ v: v.trim(), i })).filter((x) => x.v);
      if (items.length === 0) return empty;
      return (
        <ol className="numbered">
          {items.map(({ v, i }) => (
            <li key={i} value={i + 1}>
              {v}
            </li>
          ))}
        </ol>
      );
    }

    case "table": {
      const rows = (value as TableValue).filter((r) => Object.values(r).some((c) => c.trim()));
      if (rows.length === 0) return empty;
      return (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                {field.columns.map((c) => (
                  <th key={c.key}>{c.label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr key={i}>
                  {field.columns.map((c) => (
                    <td key={c.key}>{row[c.key]}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }

    case "options": {
      const v = value as OptionsValue;
      return (
        <ul className="options">
          {field.options.map((o) => {
            const checked = v.checked.includes(o.key);
            const note = v.notes[o.key]?.trim();
            return (
              <li key={o.key} data-checked={checked}>
                <span className="check" aria-hidden>
                  {checked ? "✓" : ""}
                </span>
                <span>
                  <strong>{o.label}</strong>
                  {o.description && <small>{o.description}</small>}
                  {field.noteLabel && note && (
                    <small className="note">
                      {field.noteLabel}: {note}
                    </small>
                  )}
                </span>
              </li>
            );
          })}
        </ul>
      );
    }
  }
}

export function FieldInput({
  field,
  value,
  onChange,
}: {
  field: Field;
  value: FieldValue;
  onChange: (value: FieldValue) => void;
}) {
  switch (field.type) {
    case "text":
      return (
        <textarea
          value={value as TextValue}
          onChange={(e) => onChange(e.target.value)}
          rows={Math.max(3, (value as TextValue).split("\n").length + 1)}
          placeholder="Uma ideia por linha vira lista."
        />
      );

    case "list": {
      const items = value as ListValue;
      return (
        <ol className="list-input">
          {items.map((item, i) => (
            <li key={i}>
              <input
                value={item}
                placeholder={`Ideia ${i + 1}`}
                onChange={(e) => onChange(items.map((v, j) => (j === i ? e.target.value : v)))}
              />
            </li>
          ))}
        </ol>
      );
    }

    case "table": {
      const rows = value as TableValue;
      return (
        <div className="table-wrap">
          <table className="table-input">
            <thead>
              <tr>
                {field.columns.map((c) => (
                  <th key={c.key}>{c.label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr key={i}>
                  {field.columns.map((c) => (
                    <td key={c.key}>
                      <textarea
                        rows={2}
                        aria-label={`${c.label} — linha ${i + 1}`}
                        value={row[c.key]}
                        onChange={(e) =>
                          onChange(
                            rows.map((r, j) => (j === i ? { ...r, [c.key]: e.target.value } : r)),
                          )
                        }
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }

    case "options": {
      const v = value as OptionsValue;
      return (
        <ul className="options options-input">
          {field.options.map((o) => {
            const checked = v.checked.includes(o.key);
            return (
              <li key={o.key} data-checked={checked}>
                <label>
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={(e) =>
                      onChange({
                        ...v,
                        checked: e.target.checked
                          ? [...v.checked, o.key]
                          : v.checked.filter((k) => k !== o.key),
                      })
                    }
                  />
                  <span>
                    <strong>{o.label}</strong>
                    {o.description && <small>{o.description}</small>}
                  </span>
                </label>
                {field.noteLabel && (
                  <input
                    className="note-input"
                    placeholder={field.noteLabel}
                    value={v.notes[o.key] ?? ""}
                    onChange={(e) => onChange({ ...v, notes: { ...v.notes, [o.key]: e.target.value } })}
                  />
                )}
              </li>
            );
          })}
        </ul>
      );
    }
  }
}
