import Link from "next/link";
import { sheets, sheetStatus, type SheetStatus } from "@/content/sheets";
import { roadmapVersions, snapshotAt } from "@/content/versions";
import { formatDateTime } from "@/content/format";
import { SheetSection } from "@/components/SheetSection";
import { VersionPicker } from "@/components/VersionPicker";
import { readSheet } from "@/lib/storage";

const statusText: Record<SheetStatus, string> = {
  vazio: "A preencher",
  "em-andamento": "Em andamento",
  concluido: "Preenchida",
};

// "Bloco 1 · Empatia" → grupo "Bloco 1", tema "Empatia".
function splitBlock(block: string) {
  const [group, ...rest] = block.split(" · ");
  return { group, topic: rest.join(" · ") };
}

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ v?: string }>;
}) {
  const [{ v }, docs] = await Promise.all([
    searchParams,
    Promise.all(sheets.map((s) => readSheet(s.id))),
  ]);

  const versions = roadmapVersions(docs);
  const viewing = v ? versions.find((x) => x.id === v) : undefined;
  const latest = versions[versions.length - 1];
  const data = viewing ? snapshotAt(docs, viewing.at) : docs.map((d) => d.data);

  // Qualquer um vê o botão Editar; a senha (ADMIN_PASSWORD) é pedida ao salvar.
  // Se faltar configuração em produção, o salvar explica o que falta em vez de esconder o botão.
  const canEdit = !viewing;
  const needsPassword = !!process.env.ADMIN_PASSWORD;
  const statuses = sheets.map((s, i) => sheetStatus(s, data[i]));
  const filled = statuses.filter((s) => s === "concluido").length;

  const groups = sheets.reduce<{ group: string; items: number[] }[]>((acc, s, i) => {
    const { group } = splitBlock(s.block);
    const last = acc[acc.length - 1];
    if (last?.group === group) last.items.push(i);
    else acc.push({ group, items: [i] });
    return acc;
  }, []);

  return (
    <>
      <header className="topbar">
        <Link href="/" className="brand">
          Ko-op
        </Link>
        <VersionPicker versions={versions} current={viewing?.id} />
      </header>

      {viewing && (
        <div className="old-version" role="status">
          <div className="old-version-inner">
            <p>
              Você está vendo a <strong>versão {viewing.number}</strong> de {versions.length}, salva em{" "}
              {formatDateTime(viewing.at)}
              {viewing.note && <>: {viewing.note}</>}.
            </p>
            {viewing.detail && <p className="old-version-detail">{viewing.detail}</p>}
            <Link href="/">Voltar para a versão atual</Link>
          </div>
        </div>
      )}

      <section className="hero">
        <h1>Do “bora jogar?” ao servidor ligado.</h1>
        <p className="lede">
          Ko-op cria o servidor do seu grupo em um clique: vocês pagam só as horas
          jogadas, dividem a conta por PIX e encontram gente pra jogar junto. Este é o
          caminho do projeto, da primeira ideia até o pitch.
        </p>

        <div className="map" aria-label="Etapas do roadmap">
          {groups.map((g) => (
            <div key={g.group} className="map-group">
              <p className="map-group-name">{g.group}</p>
              <ol className="map-tiles">
                {g.items.map((i) => (
                  <li key={sheets[i].id}>
                    <a
                      href={`#${sheets[i].id}`}
                      className="tile"
                      data-status={statuses[i]}
                      style={{ "--i": i } as React.CSSProperties}
                    >
                      <span className="tile-num">{i + 1}</span>
                      <span className="tile-title">{sheets[i].title}</span>
                      <span className="sr-only">: {statusText[statuses[i]]}</span>
                    </a>
                  </li>
                ))}
              </ol>
            </div>
          ))}
        </div>

        <div className="map-foot">
          <p className="progress">
            <strong>{filled}</strong> de {sheets.length} etapas preenchidas
            {latest && !viewing && <>, atualizado em {formatDateTime(latest.at)}</>}
          </p>
          <ul className="legend" aria-hidden>
            <li data-status="concluido">Preenchida</li>
            <li data-status="em-andamento">Em andamento</li>
            <li data-status="vazio">A preencher</li>
          </ul>
        </div>
      </section>

      <main className="content">
        {groups.map((g) => (
          <section key={g.group} className="group">
            <h2 className="group-name">{g.group}</h2>
            {g.items.map((i) => (
              <SheetSection
                key={`${sheets[i].id}-${viewing?.id ?? "atual"}`}
                number={i + 1}
                sheet={sheets[i]}
                topic={splitBlock(sheets[i].block).topic}
                data={data[i]}
                status={statuses[i]}
                statusLabel={statusText[statuses[i]]}
                changedHere={viewing?.sheetId === sheets[i].id}
                canEdit={canEdit}
                needsPassword={needsPassword}
              />
            ))}
          </section>
        ))}
      </main>

      <footer className="footer">
        <p>Ko-op, um projeto Statum. {new Date().getFullYear()}</p>
      </footer>
    </>
  );
}
