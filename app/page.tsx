import { stages, type Field, type StageStatus } from "@/content/roadmap";

const statusLabel: Record<StageStatus, string> = {
  concluido: "Concluído",
  "em-andamento": "Em andamento",
  planejado: "Planejado",
};

function FieldValue({ value }: { value: Field["value"] }) {
  if (typeof value === "string") return <p>{value}</p>;
  return (
    <ul>
      {value.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}

export default function Home() {
  return (
    <main>
      <header className="hero">
        <span className="eyebrow">Statum · Roadmap</span>
        <h1>Ko-op</h1>
        <p className="lede">
          O servidor do seu grupo pronto em um clique. Pague só as horas
          jogadas, divida a conta por PIX e encontre gente pra jogar junto.
        </p>
      </header>

      <nav className="toc" aria-label="Etapas do roadmap">
        <ol>
          {stages.map((stage, i) => (
            <li key={stage.id}>
              <a href={`#${stage.id}`}>
                <span className="num">{String(i + 1).padStart(2, "0")}</span>
                {stage.title}
              </a>
            </li>
          ))}
        </ol>
      </nav>

      <ol className="timeline">
        {stages.map((stage, i) => (
          <li key={stage.id} id={stage.id} className="stage">
            <div className="marker" data-status={stage.status} />
            <div className="stage-head">
              <span className="num">{String(i + 1).padStart(2, "0")}</span>
              <h2>{stage.title}</h2>
              <span className="badge" data-status={stage.status}>
                {statusLabel[stage.status]}
              </span>
            </div>
            {stage.summary && <p className="summary">{stage.summary}</p>}
            <dl className="fields">
              {stage.fields.map((field) => (
                <div key={field.label} className="field">
                  <dt>{field.label}</dt>
                  <dd>
                    <FieldValue value={field.value} />
                  </dd>
                </div>
              ))}
            </dl>
          </li>
        ))}
        <li className="stage stage-next">
          <div className="marker" data-status="planejado" />
          <p>Próximas etapas em construção.</p>
        </li>
      </ol>

      <footer className="footer">© {new Date().getFullYear()} Statum</footer>
    </main>
  );
}
