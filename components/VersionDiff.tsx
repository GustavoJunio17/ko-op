import type { FieldDiff } from "@/content/diff";

export function VersionDiff({ diffs }: { diffs: FieldDiff[] }) {
  if (diffs.length === 0) return <p className="muted">Nenhuma mudança nos campos.</p>;

  return (
    <div className="diff">
      {diffs.map(({ field, changes }) => (
        <section key={field.key}>
          <h4>{field.label}</h4>
          {changes.map((change, i) =>
            change.kind === "lines" ? (
              <ul key={i} className="diff-lines">
                {change.lines.map((line, j) => (
                  <li key={j} data-op={line.op}>
                    <span aria-hidden>{line.op === "add" ? "+" : line.op === "del" ? "−" : " "}</span>
                    {line.text}
                  </li>
                ))}
              </ul>
            ) : (
              <div key={i} className="diff-item">
                <span className="diff-label">{change.label}</span>
                {change.before.trim() && <del>{change.before}</del>}
                {change.after.trim() ? <ins>{change.after}</ins> : <em className="muted">(apagado)</em>}
              </div>
            ),
          )}
        </section>
      ))}
    </div>
  );
}
