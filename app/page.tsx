import Link from "next/link";
import { sheets } from "@/content/sheets";
import { SheetCard } from "@/components/SheetCard";
import { isAdmin } from "@/lib/auth";
import { readSheet, storageMode } from "@/lib/storage";
import { logout } from "./actions";

export default async function Home() {
  const [admin, data] = await Promise.all([
    isAdmin(),
    Promise.all(sheets.map((s) => readSheet(s.id))),
  ]);
  const mode = storageMode();
  const canEdit = admin && mode !== "readonly";

  return (
    <main>
      <header className="hero">
        <span className="eyebrow">Statum · Roadmap</span>
        <h1>Ko-oP</h1>
        <p className="lede">
          O servidor do seu grupo pronto em um clique. Pague só as horas
          jogadas, divida a conta por PIX e encontre gente pra jogar junto.
        </p>
      </header>

      <nav className="toc" aria-label="Etapas do roadmap">
        <ol>
          {sheets.map((sheet, i) => (
            <li key={sheet.id}>
              <a href={`#${sheet.id}`}>
                <span className="num">{String(i + 1).padStart(2, "0")}</span>
                {sheet.title}
              </a>
            </li>
          ))}
        </ol>
      </nav>

      {admin && mode === "readonly" && (
        <p className="error">
          Edição desativada: configure GITHUB_TOKEN no ambiente para salvar versões.
        </p>
      )}

      <ol className="timeline">
        {sheets.map((sheet, i) => (
          <SheetCard key={sheet.id} sheet={sheet} data={data[i].data} index={i} canEdit={canEdit} />
        ))}
      </ol>

      <footer className="footer">
        <span>© {new Date().getFullYear()} Statum</span>
        {admin && process.env.ADMIN_PASSWORD ? (
          <form action={logout}>
            <button type="submit" className="link">
              Sair do modo edição
            </button>
          </form>
        ) : !admin ? (
          <Link href="/login" className="link">
            Editar
          </Link>
        ) : null}
      </footer>
    </main>
  );
}
