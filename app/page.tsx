import Link from "next/link";
import { sheets, sheetStatus, type SheetStatus } from "@/content/sheets";
import { roadmapVersions, snapshotAt } from "@/content/versions";
import { formatDateTime } from "@/content/format";
import { SheetSection } from "@/components/SheetSection";
import { VersionPicker } from "@/components/VersionPicker";
import { readSheet, storageMode } from "@/lib/storage";

const statusText: Record<SheetStatus, string> = {
  vazio: "A preencher",
  "em-andamento": "Em andamento",
  concluido: "Preenchida",
};

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

  const mode = storageMode();
  // Qualquer um vê o botão Editar; a senha (ADMIN_PASSWORD) é pedida ao salvar.
  const canEdit = mode !== "readonly" && !viewing;
  const needsPassword = !!process.env.ADMIN_PASSWORD;
  const statuses = sheets.map((s, i) => sheetStatus(s, data[i]));
  const filled = statuses.filter((s) => s === "concluido").length;

  // Agrupa as fichas por bloco para o índice lateral.
  const groups = sheets.reduce<{ block: string; items: number[] }[]>((acc, s, i) => {
    const last = acc[acc.length - 1];
    if (last?.block === s.block) last.items.push(i);
    else acc.push({ block: s.block, items: [i] });
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
        <div className="old-version">
          <div className="old-version-inner">
            <p>
              Você está vendo a <strong>versão {viewing.number}</strong> de {versions.length}, de{" "}
              {formatDateTime(viewing.at)}
              {viewing.note && <> — {viewing.note}</>}.
            </p>
            {viewing.detail && <p className="old-version-detail">{viewing.detail}</p>}
            <Link href="/">Voltar para a versão atual</Link>
          </div>
        </div>
      )}

      <section className="intro">
        <p className="kicker">Ko-oP · Roadmap do projeto</p>
        <h1>O servidor do seu grupo, pronto em um clique.</h1>
        <p className="lede">
          Pague só as horas jogadas, divida a conta por PIX e encontre gente pra
          jogar junto. Aqui fica o caminho da ideia até o pitch, etapa por etapa.
        </p>
        <p className="meta">
          {filled} de {sheets.length} etapas preenchidas
          {latest && !viewing && <> · atualizado em {formatDateTime(latest.at)}</>}
        </p>
      </section>

      <div className="layout">
        <nav className="index" aria-label="Etapas">
          {groups.map((g) => (
            <div key={g.block}>
              <p className="index-block">{g.block}</p>
              <ol>
                {g.items.map((i) => (
                  <li key={sheets[i].id}>
                    <a href={`#${sheets[i].id}`} title={statusText[statuses[i]]}>
                      <span className="dot" data-status={statuses[i]} aria-hidden />
                      {sheets[i].title}
                    </a>
                  </li>
                ))}
              </ol>
            </div>
          ))}
        </nav>

        <main className="sheets">
          {sheets.map((sheet, i) => (
            <SheetSection
              key={`${sheet.id}-${viewing?.id ?? "atual"}`}
              sheet={sheet}
              data={data[i]}
              status={statusText[statuses[i]]}
              changedHere={viewing?.sheetId === sheet.id}
              canEdit={canEdit}
              needsPassword={needsPassword}
            />
          ))}
        </main>
      </div>

      <footer className="footer">
        <span>Ko-oP · Statum · {new Date().getFullYear()}</span>
      </footer>
    </>
  );
}
