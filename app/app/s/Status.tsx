"use client";

import { useState } from "react";
import { Bloco, type Estado } from "../Bloco";
import { tamanho, type Jogo, type Plano } from "../precos";
import s from "../app.module.css";

export type DadosStatus = {
  nome: string;
  jogo: Jogo;
  estado: "dormindo" | "ligado";
  membros: number;
  online: number;
  tamanhoId: string;
  detalhe: string;
  plano: Plano;
};

const nomeJogo: Record<Jogo, string> = { minecraft: "Minecraft", gta: "GTA V RP" };
const dias = ["dom", "seg", "ter", "qua", "qui", "sex", "sáb"];

// Histórico simulado, mas estável para o mesmo servidor: horas ligado em cada um dos últimos 14 dias.
function historico(nome: string, plano: Plano) {
  let h = 7;
  for (const ch of nome) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  const hoje = new Date();
  return Array.from({ length: 14 }, (_, i) => {
    const d = new Date(hoje);
    d.setDate(hoje.getDate() - (13 - i));
    h = (h * 1103515245 + 12345) >>> 0;
    const fimDeSemana = d.getDay() === 0 || d.getDay() === 6;
    const sorte = (h >>> 16) % 10;
    const horas = plano === "mensal" ? 24 : sorte < 3 ? 0 : fimDeSemana ? 3 + (sorte % 4) : 1 + (sorte % 3) * 0.5;
    return { rotulo: `${dias[d.getDay()]} ${d.getDate()}/${d.getMonth() + 1}`, horas };
  });
}

const hm = (h: number) => (h === 0 ? "desligado o dia todo" : `${Math.floor(h)}h${h % 1 ? "30" : ""} ligado`);

export function Status(d: DadosStatus) {
  const [estado, setEstado] = useState<Estado>(d.plano === "mensal" ? "ligado" : d.estado);
  const [online, setOnline] = useState(d.online);
  const [entrou, setEntrou] = useState(false);
  const [foco, setFoco] = useState<number | null>(null);
  const t = tamanho(d.tamanhoId);
  const hist = historico(d.nome, d.plano);
  const total = hist.reduce((a, x) => a + x.horas, 0);
  const escala = d.plano === "mensal" ? 24 : 8;

  const entrar = () => {
    if (estado === "ligado") {
      setOnline((n) => n + 1);
      setEntrou(true);
      return;
    }
    setEstado("acordando");
    setTimeout(() => {
      setEstado("ligado");
      setOnline((n) => n + 1);
      setEntrou(true);
    }, 2600);
  };

  return (
    <main className={s.paginaStatus}>
      <p className={s.marca}>
        <span className={s.marcaBloco} aria-hidden />
        Ko-op
      </p>

      <section className={s.servidor} data-estado={estado}>
        <Bloco jogo={d.jogo} estado={estado} />
        <h1 className={s.titulo}>{d.nome}</h1>
        <p className={s.sub}>
          {nomeJogo[d.jogo]}, {t.nome.toLowerCase()}
        </p>
        <p className={s.estado}>
          {estado === "dormindo" ? "Dormindo" : estado === "acordando" ? "Acordando" : d.plano === "mensal" ? "Sempre ligado" : "Ligado"}
          {estado === "ligado" && online > 0 && <span className={s.online}>{online} jogando</span>}
        </p>
        <p className={s.texto}>
          {estado === "dormindo"
            ? "Ninguém está jogando agora. Ele acorda sozinho em uns 30 segundos quando alguém entra."
            : estado === "acordando"
              ? "Ligando o servidor. O mundo está exatamente como vocês deixaram."
              : entrou
                ? `Pronto. No app de verdade, o ${nomeJogo[d.jogo]} abriria aqui já conectado, com a versão e os mods certos.`
                : "Pode entrar, o servidor está no ar."}
        </p>
        {!entrou && estado !== "acordando" && (
          <button className={s.botao} onClick={entrar}>
            {estado === "dormindo" ? "Acordar e entrar" : "Entrar no servidor"}
          </button>
        )}
      </section>

      <dl className={s.painel}>
        <div>
          <dt>Jogando agora</dt>
          <dd>
            {estado === "ligado" ? online : 0} de {t.jogadores}
          </dd>
        </div>
        <div>
          <dt>Ping de São Paulo</dt>
          <dd>{estado === "ligado" ? "14 ms" : "—"}</dd>
        </div>
        <div>
          <dt>No grupo</dt>
          <dd>{d.membros} amigos</dd>
        </div>
        <div>
          <dt>Plano</dt>
          <dd>{d.plano === "mensal" ? "Mensal" : "Por horas"}</dd>
        </div>
      </dl>

      <section className={s.bloquinho}>
        <h2 className={s.h3}>Últimos 14 dias</h2>
        <p className={s.texto}>
          {d.plano === "mensal"
            ? "No plano mensal o servidor fica no ar o tempo todo."
            : `Ficou ligado ${Math.round(total)}h de 336h. No resto do tempo dormiu e não cobrou nada.`}
        </p>
        <div className={s.uptime} role="img" aria-label={`Horas ligado por dia nos últimos 14 dias, total de ${Math.round(total)} horas`} onMouseLeave={() => setFoco(null)}>
          {hist.map((x, i) => (
            <button
              key={i}
              className={s.uptimeDia}
              data-foco={foco === i}
              onMouseEnter={() => setFoco(i)}
              onFocus={() => setFoco(i)}
              onClick={() => setFoco(i)}
              aria-label={`${x.rotulo}: ${hm(x.horas)}`}
            >
              <span style={{ height: `${x.horas ? Math.max(6, (x.horas / escala) * 100) : 0}%` }} />
            </button>
          ))}
        </div>
        <p className={s.uptimeLegenda}>
          {foco === null ? (
            <>
              <span>{hist[0].rotulo}</span>
              <span>hoje</span>
            </>
          ) : (
            <strong>
              {hist[foco].rotulo}: {hm(hist[foco].horas)}
            </strong>
          )}
        </p>
      </section>

      <p className={s.detalhe}>{d.detalhe}</p>

      <a className={s.botaoSec} href="/app">
        Quero um servidor assim
      </a>
      <p className={s.dica}>Protótipo do Ko-op. Os dados desta página são simulados.</p>
    </main>
  );
}
