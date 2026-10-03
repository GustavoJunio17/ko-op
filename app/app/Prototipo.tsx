"use client";

import { useEffect, useRef, useState } from "react";
import { Bloco, Qr, type Estado } from "./Bloco";
import { reais, tamanho, tamanhos, type Jogo, type Plano } from "./precos";
import s from "./app.module.css";

// Tudo aqui é simulado no navegador: não há servidor, Pix nem conta de verdade.
// 1 segundo de servidor ligado = 6 minutos de jogo, pra dar pra ver a pool descendo.

type Membro = { id: string; nome: string; cor: string; voce?: boolean; online: boolean; pagou: boolean; convite?: boolean };
type Sessao = { quando: string; minutos: number; custo: number };
type Grupo = {
  id: string;
  nome: string;
  jogo: Jogo;
  tamanhoId: string;
  auto: boolean;
  plano: Plano;
  detalhe: string;
  membros: Membro[];
  pool: number;
  recarga: number;
  estado: Estado;
  sessaoMin: number;
  sessoes: Sessao[];
};

type Tela = "entrada" | "jogo" | "tamanho" | "ajustes" | "plano" | "criando" | "grupo" | "comunidade";
type Folha = null | { tipo: "recarga" } | { tipo: "convite" } | { tipo: "pix"; valor: number; motivo: string } | { tipo: "entrar"; id: string };

const nomeJogo: Record<Jogo, string> = { minecraft: "Minecraft", gta: "GTA V RP" };
const cores = ["#3366e8", "#e9a21f", "#2e9e5b", "#b4261a", "#7a4fd6", "#1f8a9e", "#c2457a"];
const amigos = ["Bia", "Caio", "Duda", "Leo", "Nina", "Rafa", "Teo", "Lu", "Gabi"];

const demo = (): Grupo => ({
  id: "demo",
  nome: "Os Cria do Bloco",
  jogo: "minecraft",
  tamanhoId: "mc-5",
  auto: true,
  plano: "horas",
  detalhe: "Sobrevivência com o modpack Create, Java 1.21.4",
  membros: [
    { id: "eu", nome: "Você", cor: cores[0], voce: true, online: false, pagou: true },
    ...amigos.slice(0, 4).map((nome, i) => ({ id: nome, nome, cor: cores[i + 1], online: false, pagou: i !== 2 })),
  ],
  pool: 18.4,
  recarga: 25,
  estado: "dormindo",
  sessaoMin: 0,
  sessoes: [
    { quando: "Sábado, 27 de set, das 20h10 à 0h40", minutos: 270, custo: 2.25 },
    { quando: "Quarta, 24 de set, das 21h00 às 22h30", minutos: 90, custo: 0.75 },
    { quando: "Domingo, 21 de set, das 15h20 às 19h50", minutos: 270, custo: 2.25 },
  ],
});

type Aberto = { id: string; nome: string; jogo: Jogo; estilo: string; quando: string; membros: number; vagas: number; totalMes: number };
const abertos: Aberto[] = [
  { id: "vila", nome: "Vila dos Construtores", jogo: "minecraft", estilo: "Com mods, foco em construir", quando: "Noites de semana", membros: 4, vagas: 6, totalMes: 48 },
  { id: "cidade-alta", nome: "Cidade Alta RP", jogo: "gta", estilo: "Roleplay sério, polícia e empresas", quando: "Todo dia, à noite", membros: 18, vagas: 32, totalMes: 249 },
  { id: "hardcore", nome: "Hardcore de sexta", jogo: "minecraft", estilo: "Sobrevivência no difícil, uma vida só", quando: "Sextas, depois das 21h", membros: 3, vagas: 5, totalMes: 24 },
  { id: "corridas", nome: "Los Santos Corridas", jogo: "gta", estilo: "Corridas e oficinas", quando: "Fins de semana", membros: 9, vagas: 32, totalMes: 249 },
];

const horas = (min: number) => {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return h ? `${h}h${m ? String(m).padStart(2, "0") : ""}` : `${m} min`;
};

type Rascunho = {
  jogo: Jogo;
  tamanhoId: string;
  auto: boolean;
  nome: string;
  modo: "Sobrevivência" | "Criativo" | "Com mods";
  modpack: string;
  edicao: "Java" | "Bedrock";
  versao: string;
  dificuldade: string;
  soConvidados: boolean;
  backup: boolean;
  pacotes: string[];
  discord: boolean;
  plano: Plano;
  pessoas: number;
  recarga: number;
};

const rascunhoPara = (jogo: Jogo): Rascunho => ({
  jogo,
  tamanhoId: jogo === "minecraft" ? "mc-5" : "gta-32",
  auto: false,
  nome: jogo === "minecraft" ? "Survival da Firma" : "Cidade Nova RP",
  modo: "Sobrevivência",
  modpack: "Create",
  edicao: "Java",
  versao: "1.21.4",
  dificuldade: "Normal",
  soConvidados: true,
  backup: true,
  pacotes: ["Polícia e crime", "Empresas"],
  discord: true,
  plano: jogo === "minecraft" ? "horas" : "mensal",
  pessoas: 5,
  recarga: 50,
});

export function Prototipo() {
  const [tela, setTela] = useState<Tela>("entrada");
  const [grupos, setGrupos] = useState<Grupo[]>([demo()]);
  const [ativo, setAtivo] = useState("demo");
  const [r, setR] = useState<Rascunho>(rascunhoPara("minecraft"));
  const [folha, setFolha] = useState<Folha>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [entrei, setEntrei] = useState<string[]>([]);
  const [filtro, setFiltro] = useState<Jogo | "todos">("todos");
  const telaRef = useRef<HTMLDivElement>(null);

  const g = grupos.find((x) => x.id === ativo) ?? grupos[0];
  const t = tamanho(g.tamanhoId);

  const avisar = (msg: string) => setToast(msg);
  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(null), 3200);
    return () => clearTimeout(id);
  }, [toast]);

  useEffect(() => {
    telaRef.current?.scrollTo({ top: 0 });
  }, [tela]);

  const mudar = (id: string, f: (g: Grupo) => Grupo) => setGrupos((gs) => gs.map((x) => (x.id === id ? f(x) : x)));

  // Servidor ligado no plano por horas: consome a pool minuto a minuto.
  useEffect(() => {
    if (g.estado !== "ligado" || g.plano !== "horas") return;
    const id = setInterval(() => {
      mudar(g.id, (x) => {
        const pool = Math.max(0, x.pool - tamanho(x.tamanhoId).hora / 10);
        return { ...x, pool, sessaoMin: x.sessaoMin + 6 };
      });
    }, 1000);
    return () => clearInterval(id);
  }, [g.id, g.estado, g.plano]);

  useEffect(() => {
    if (g.estado === "ligado" && g.plano === "horas" && g.pool <= 0) {
      dormir("A pool acabou e o servidor dormiu. Recarreguem pra voltar a jogar.");
    }
  });

  const acordar = () => {
    if (g.plano === "horas" && g.pool < t.hora / 4) {
      avisar("Sem crédito na pool, o servidor não acorda. Recarreguem primeiro.");
      setFolha({ tipo: "recarga" });
      return;
    }
    mudar(g.id, (x) => ({ ...x, estado: "acordando" }));
    setTimeout(() => {
      mudar(g.id, (x) => ({
        ...x,
        estado: "ligado",
        sessaoMin: 0,
        membros: x.membros.map((m, i) => ({ ...m, online: !m.convite && (m.voce || i % 2 === 1) })),
      }));
    }, 2600);
  };

  function dormir(msg?: string) {
    const custo = g.sessaoMin * (t.hora / 60);
    mudar(g.id, (x) => ({
      ...x,
      estado: "dormindo",
      membros: x.membros.map((m) => ({ ...m, online: false })),
      sessoes: x.sessaoMin ? [{ quando: "Hoje, agora há pouco", minutos: x.sessaoMin, custo }, ...x.sessoes] : x.sessoes,
      sessaoMin: 0,
    }));
    avisar(msg ?? `Todo mundo saiu, o servidor dormiu. A sessão de ${horas(g.sessaoMin)} custou ${reais(custo)} da pool.`);
  }

  const criar = () => {
    const tm = tamanho(r.tamanhoId);
    const total = r.plano === "horas" ? r.recarga : tm.mes;
    const parte = total / r.pessoas;
    const id = `g${Date.now()}`;
    const detalhe =
      r.jogo === "minecraft"
        ? `${r.modo === "Com mods" ? `Com o modpack ${r.modpack}` : r.modo}, ${r.edicao} ${r.versao}, ${r.dificuldade.toLowerCase()}`
        : `Cidade completa com ${r.pacotes.join(", ").toLowerCase() || "o básico"}`;
    const novo: Grupo = {
      id,
      nome: r.nome.trim() || rascunhoPara(r.jogo).nome,
      jogo: r.jogo,
      tamanhoId: r.tamanhoId,
      auto: r.auto,
      plano: r.plano,
      detalhe,
      membros: [
        { id: "eu", nome: "Você", cor: cores[0], voce: true, online: false, pagou: true },
        ...Array.from({ length: r.pessoas - 1 }, (_, i) => ({
          id: `c${i}`,
          nome: "Convite enviado",
          cor: "#b6c3d4",
          online: false,
          pagou: false,
          convite: true,
        })),
      ],
      pool: r.plano === "horas" ? parte : 0,
      recarga: total,
      estado: r.plano === "mensal" ? "ligado" : "dormindo",
      sessaoMin: 0,
      sessoes: [],
    };
    setTela("criando");
    setTimeout(() => {
      setGrupos((gs) => [novo, ...gs]);
      setAtivo(id);
      setTela("grupo");
      setFolha({ tipo: "convite" });
    }, 4200);
  };

  const amigosEntrando = () => {
    mudar(g.id, (x) => {
      let k = 0;
      const membros = x.membros.map((m) => (m.convite ? { ...m, nome: amigos[k], cor: cores[1 + (k++ % 6)], convite: false } : m));
      return { ...x, membros };
    });
    setFolha(null);
    avisar("Os amigos entraram pelo link e já receberam o Pix da parte deles.");
  };

  // Link da página do servidor: é o que o QR do convite abre na câmera do celular.
  const linkStatus = (x: Grupo) => {
    const q = new URLSearchParams({
      g: x.nome,
      j: x.jogo,
      e: x.estado === "ligado" ? "ligado" : "dormindo",
      n: String(x.membros.length),
      on: String(x.membros.filter((m) => m.online).length),
      t: x.tamanhoId,
      d: x.detalhe,
      p: x.plano,
    });
    return `${window.location.origin}/app/s?${q}`;
  };

  const parteDe = (x: Grupo) => (x.plano === "horas" ? x.recarga : tamanho(x.tamanhoId).mes) / x.membros.length;

  const pagarAmigos = () => {
    mudar(g.id, (x) => {
      const devendo = x.membros.filter((m) => !m.pagou && !m.convite).length;
      return {
        ...x,
        pool: x.plano === "horas" ? x.pool + devendo * parteDe(x) : x.pool,
        membros: x.membros.map((m) => (m.convite ? m : { ...m, pagou: true })),
      };
    });
    avisar("Pix dos amigos recebidos. Ninguém precisou cobrar ninguém.");
  };

  const recarregar = (valor: number) => {
    mudar(g.id, (x) => ({
      ...x,
      recarga: valor,
      pool: x.pool + valor / x.membros.length,
      membros: x.membros.map((m) => ({ ...m, pagou: !!m.voce })),
    }));
    setFolha(null);
    avisar(`Sua parte entrou na pool. O Ko-op mandou o Pix de ${reais(valor / g.membros.length)} pra cada amigo.`);
  };

  const recomecar = () => {
    setGrupos([demo()]);
    setAtivo("demo");
    setEntrei([]);
    setFolha(null);
    setTela("entrada");
  };

  const passo = { jogo: 1, tamanho: 2, ajustes: 3, plano: 4 } as Partial<Record<Tela, number>>;
  const voltar: Partial<Record<Tela, Tela>> = { jogo: "entrada", tamanho: "jogo", ajustes: "tamanho", plano: "ajustes" };
  const comAbas = tela === "grupo" || tela === "comunidade";

  return (
    <div className={s.palco}>
      <aside className={s.lado}>
        <p className={s.ladoMarca}>Ko-op</p>
        <p>Protótipo de média fidelidade. Navegue à vontade: servidores, Pix e amigos são simulados.</p>
        <p className={s.ladoPrecos}>Preços provisórios.</p>
        <button className={s.link} onClick={recomecar}>
          Recomeçar do início
        </button>
      </aside>

      <div className={s.celular}>
        {passo[tela] && (
          <header className={s.topo}>
            <button className={s.voltar} onClick={() => setTela(voltar[tela]!)} aria-label="Voltar">
              <Icone nome="voltar" />
            </button>
            <div className={s.passos}>
              <span>Passo {passo[tela]} de 4</span>
              <span className={s.trilho}>
                <span style={{ width: `${(passo[tela]! / 4) * 100}%` }} />
              </span>
            </div>
          </header>
        )}

        <div className={s.tela} ref={telaRef} data-abas={comAbas}>
          {tela === "entrada" && (
            <section className={s.entrada}>
              <p className={s.marca}>
                <span className={s.marcaBloco} aria-hidden />
                Ko-op
              </p>
              <h1 className={s.manchete}>Do “bora jogar?” ao servidor ligado.</h1>
              <p className={s.lede}>
                Servidor de Minecraft ou GTA RP pronto em um clique. Vocês pagam só as horas jogadas e racham a conta no Pix.
              </p>
              <div className={s.portas}>
                <button
                  className={s.porta}
                  data-tipo="principal"
                  onClick={() => {
                    setR(rascunhoPara("minecraft"));
                    setTela("jogo");
                  }}
                >
                  <strong>Criar um servidor</strong>
                  <span>Leva um minuto e não precisa saber nada técnico.</span>
                </button>
                <button
                  className={s.porta}
                  onClick={() => {
                    setAtivo("demo");
                    setTela("grupo");
                  }}
                >
                  <strong>Ver um grupo jogando</strong>
                  <span>Os Cria do Bloco, cinco amigos num servidor de Minecraft.</span>
                </button>
              </div>
              <p className={s.rodape}>Infraestrutura Statum, servidores em São Paulo e Vinhedo.</p>
            </section>
          )}

          {tela === "jogo" && (
            <section className={s.secao}>
              <h2 className={s.titulo}>Qual jogo vocês querem?</h2>
              <div className={s.lista}>
                {(["minecraft", "gta"] as Jogo[]).map((j) => (
                  <button
                    key={j}
                    className={s.opcao}
                    data-marcado={r.jogo === j}
                    onClick={() => {
                      setR(rascunhoPara(j));
                      setTela("tamanho");
                    }}
                  >
                    <Bloco jogo={j} estado="ligado" />
                    <span>
                      <strong>{nomeJogo[j]}</strong>
                      <span className={s.sub}>
                        {j === "minecraft"
                          ? "Sobrevivência, criativo ou com mods. Java ou Bedrock."
                          : "Sua própria cidade de roleplay, já com empregos, polícia e concessionária."}
                      </span>
                    </span>
                  </button>
                ))}
              </div>
            </section>
          )}

          {tela === "tamanho" && (
            <section className={s.secao}>
              <h2 className={s.titulo}>Quantos vão jogar juntos?</h2>
              <p className={s.texto}>Escolha pelo tamanho do grupo. A gente cuida do resto.</p>
              <div className={s.lista} role="radiogroup">
                {tamanhos
                  .filter((x) => x.jogo === r.jogo)
                  .map((x) => (
                    <button
                      key={x.id}
                      role="radio"
                      aria-checked={r.tamanhoId === x.id}
                      className={s.linhaOpcao}
                      data-marcado={r.tamanhoId === x.id}
                      onClick={() => setR({ ...r, tamanhoId: x.id, pessoas: Math.min(r.pessoas, x.jogadores) })}
                    >
                      <span className={s.radio} />
                      <span className={s.cresce}>
                        <strong>{x.nome}</strong>
                      </span>
                      <span className={s.preco}>{reais(x.hora)}/h</span>
                    </button>
                  ))}
              </div>
              <Interruptor
                ligado={r.auto}
                onChange={(auto) => setR({ ...r, auto })}
                titulo="Ajustar sozinho quando lotar"
                texto="Se entrar mais gente ou o jogo pesar, o servidor ganha fôlego e volta ao normal depois. Sem travar."
              />
              <details className={s.tecnico}>
                <summary>Ver detalhes técnicos</summary>
                <p>{tamanho(r.tamanhoId).tecnico}, na Oracle Cloud em São Paulo. Você não precisa mexer em nada disso.</p>
              </details>
              <Avancar onClick={() => setTela("ajustes")}>Continuar</Avancar>
            </section>
          )}

          {tela === "ajustes" && (
            <section className={s.secao}>
              <h2 className={s.titulo}>Já deixamos tudo pronto</h2>
              <p className={s.texto}>Mude só o que quiser. Dá pra criar direto com o padrão.</p>

              <label className={s.campo}>
                <span>{r.jogo === "minecraft" ? "Nome do servidor" : "Nome da cidade"}</span>
                <input value={r.nome} onChange={(e) => setR({ ...r, nome: e.target.value })} />
              </label>

              {r.jogo === "minecraft" ? (
                <>
                  <Campo rotulo="Modo">
                    <Segmentos valores={["Sobrevivência", "Criativo", "Com mods"]} valor={r.modo} onChange={(modo) => setR({ ...r, modo: modo as Rascunho["modo"] })} />
                  </Campo>
                  {r.modo === "Com mods" && (
                    <Campo rotulo="Modpack" ajuda="Instalamos os mesmos mods no servidor e no jogo de cada amigo.">
                      <Fichas valores={["Create", "RLCraft", "Pixelmon", "Better MC"]} marcados={[r.modpack]} onToggle={(modpack) => setR({ ...r, modpack })} />
                    </Campo>
                  )}
                  <Campo rotulo="Edição">
                    <Segmentos valores={["Java", "Bedrock"]} valor={r.edicao} onChange={(edicao) => setR({ ...r, edicao: edicao as Rascunho["edicao"] })} />
                  </Campo>
                  <div className={s.duasColunas}>
                    <label className={s.campo}>
                      <span>Versão</span>
                      <select value={r.versao} onChange={(e) => setR({ ...r, versao: e.target.value })}>
                        <option>1.21.4</option>
                        <option>1.20.1</option>
                        <option>1.19.2</option>
                      </select>
                    </label>
                    <label className={s.campo}>
                      <span>Dificuldade</span>
                      <select value={r.dificuldade} onChange={(e) => setR({ ...r, dificuldade: e.target.value })}>
                        <option>Pacífico</option>
                        <option>Fácil</option>
                        <option>Normal</option>
                        <option>Difícil</option>
                      </select>
                    </label>
                  </div>
                  <Interruptor ligado={r.soConvidados} onChange={(v) => setR({ ...r, soConvidados: v })} titulo="Só entra quem for convidado" />
                </>
              ) : (
                <>
                  <div className={s.cidadePronta}>
                    <strong>Cidade completa, pronta pra jogar</strong>
                    <span>Empregos, polícia, hospital, concessionária e casas. A parte que hoje leva dias pra montar.</span>
                  </div>
                  <Campo rotulo="Pacotes extras">
                    <Fichas
                      valores={["Polícia e crime", "Corridas", "Empresas", "Facções"]}
                      marcados={r.pacotes}
                      onToggle={(p) => setR({ ...r, pacotes: r.pacotes.includes(p) ? r.pacotes.filter((x) => x !== p) : [...r.pacotes, p] })}
                    />
                  </Campo>
                  <Interruptor ligado={r.discord} onChange={(v) => setR({ ...r, discord: v })} titulo="Só entra quem está no Discord da cidade" />
                </>
              )}
              <Interruptor ligado={r.backup} onChange={(v) => setR({ ...r, backup: v })} titulo="Backup antes de cada sessão" texto="Se algo der errado, o mundo volta com um toque." />
              <Avancar onClick={() => setTela("plano")}>Continuar</Avancar>
            </section>
          )}

          {tela === "plano" && <TelaPlano r={r} setR={setR} criar={criar} />}

          {tela === "criando" && <Criando r={r} />}

          {tela === "grupo" && (
            <section className={s.secao}>
              {grupos.length > 1 && (
                <div className={s.trocaGrupo} role="tablist">
                  {grupos.map((x) => (
                    <button key={x.id} role="tab" aria-selected={x.id === g.id} onClick={() => setAtivo(x.id)}>
                      {x.nome}
                    </button>
                  ))}
                </div>
              )}

              <div className={s.cabecaGrupo}>
                <div>
                  <h2 className={s.titulo}>{g.nome}</h2>
                  <p className={s.sub}>
                    {nomeJogo[g.jogo]}, {t.nome.toLowerCase()}
                  </p>
                </div>
                <Avatares membros={g.membros} />
              </div>

              <div className={s.servidor} data-estado={g.estado}>
                <Bloco jogo={g.jogo} estado={g.estado} />
                {g.estado === "dormindo" && (
                  <>
                    <p className={s.estado}>Dormindo</p>
                    <p className={s.texto}>Ninguém está jogando, então não está cobrando nada.</p>
                    <button className={s.botao} onClick={acordar}>
                      Acordar servidor
                    </button>
                    <p className={s.dica}>Também acorda sozinho quando alguém entra pelo jogo.</p>
                  </>
                )}
                {g.estado === "acordando" && (
                  <>
                    <p className={s.estado}>Acordando</p>
                    <p className={s.texto}>Leva uns 30 segundos. O mundo de vocês está exatamente como ficou.</p>
                  </>
                )}
                {g.estado === "ligado" && (
                  <>
                    <p className={s.estado}>
                      {g.plano === "mensal" ? "Sempre ligado" : "Ligado"}
                      {g.membros.some((m) => m.online) && <span className={s.online}>{g.membros.filter((m) => m.online).length} jogando</span>}
                    </p>
                    {g.plano === "horas" ? (
                      <>
                        <p className={s.texto}>
                          Esta sessão: <strong>{horas(g.sessaoMin)}</strong>, {reais(g.sessaoMin * (t.hora / 60))} da pool.
                        </p>
                        <button className={s.botaoSec} onClick={() => dormir()}>
                          Simular: todo mundo saiu
                        </button>
                        <p className={s.dica}>Sem ninguém online por 10 minutos, ele dorme e para de cobrar.</p>
                      </>
                    ) : (
                      <p className={s.texto}>Plano mensal: o servidor fica no ar o tempo todo, com preço fechado.</p>
                    )}
                  </>
                )}
                {g.auto && <p className={s.selo}>Ajusta sozinho quando lota</p>}
              </div>

              {g.plano === "horas" ? (
                <div className={s.pool}>
                  <div className={s.poolTopo}>
                    <span>Pool do grupo</span>
                    <strong>{reais(g.pool)}</strong>
                  </div>
                  <p>Dá umas {Math.floor(g.pool / t.hora)} horas de servidor ligado.</p>
                  <button className={s.botaoDinheiro} onClick={() => setFolha({ tipo: "recarga" })}>
                    Recarregar e rachar
                  </button>
                </div>
              ) : (
                <div className={s.pool}>
                  <div className={s.poolTopo}>
                    <span>Mensalidade</span>
                    <strong>{reais(t.mes)}</strong>
                  </div>
                  <p>
                    {g.membros.filter((m) => m.pagou).length} de {g.membros.length} pagaram {reais(parteDe(g))}. Quem não pagou a parte não entra até pagar.
                  </p>
                </div>
              )}

              <div className={s.bloquinho}>
                <div className={s.linhaTitulo}>
                  <h3>Quem está no grupo</h3>
                  <button className={s.link} onClick={() => setFolha({ tipo: "convite" })}>
                    Convidar
                  </button>
                </div>
                <ul className={s.membros}>
                  {g.membros.map((m) => (
                    <li key={m.id}>
                      <span className={s.avatar} style={{ background: m.cor }}>
                        {m.convite ? "?" : m.nome[0]}
                      </span>
                      <span className={s.cresce}>
                        <strong>{m.nome}</strong>
                        <span className={s.sub}>{m.convite ? "Ainda não entrou pelo link" : m.online ? "Jogando agora" : "Offline"}</span>
                      </span>
                      {!m.convite && (
                        <span className={s.status} data-ok={m.pagou}>
                          {m.pagou ? "Parte paga" : g.plano === "mensal" ? "Não entra até pagar" : "Pix pendente"}
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
                {g.membros.some((m) => !m.pagou && !m.convite) && (
                  <button className={s.link} onClick={pagarAmigos}>
                    Simular: os amigos pagaram o Pix
                  </button>
                )}
                <p className={s.dica}>O Ko-op manda o Pix e lembra quem falta. Ninguém precisa cobrar ninguém.</p>
              </div>

              {g.plano === "horas" && (
                <div className={s.bloquinho}>
                  <h3>Quanto vocês economizaram</h3>
                  {g.sessoes.length ? (
                    <>
                      <Economia sessoes={g.sessoes} hora={t.hora} pessoas={g.membros.length} />
                      <ul className={s.extrato}>
                        {g.sessoes.map((x, i) => (
                          <li key={i}>
                            <span className={s.cresce}>
                              {x.quando}
                              <span className={s.sub}>{horas(x.minutos)} ligado</span>
                            </span>
                            <strong>{reais(x.custo)}</strong>
                          </li>
                        ))}
                      </ul>
                    </>
                  ) : (
                    <p className={s.texto}>Acordem o servidor e joguem uma vez. Cada sessão aparece aqui com o quanto custou.</p>
                  )}
                </div>
              )}
              <p className={s.detalhe}>{g.detalhe}</p>
              <a className={s.link} href={linkStatus(g)} target="_blank" rel="noreferrer" style={{ justifySelf: "center" }}>
                Abrir a página do servidor
              </a>
            </section>
          )}

          {tela === "comunidade" && (
            <section className={s.secao}>
              <h2 className={s.titulo}>Comunidade</h2>
              <p className={s.texto}>Grupos com vaga procurando gente. Quanto mais gente no grupo, menor a parte de cada um.</p>
              <Segmentos
                valores={["Todos", "Minecraft", "GTA V RP"]}
                valor={filtro === "todos" ? "Todos" : nomeJogo[filtro]}
                onChange={(v) => setFiltro(v === "Todos" ? "todos" : v === "Minecraft" ? "minecraft" : "gta")}
              />
              <div className={s.lista}>
                {abertos
                  .filter((a) => filtro === "todos" || a.jogo === filtro)
                  .map((a) => {
                    const dentro = entrei.includes(a.id);
                    const n = a.membros + (dentro ? 1 : 0);
                    return (
                      <article key={a.id} className={s.aberto}>
                        <div className={s.abertoTopo}>
                          <Bloco jogo={a.jogo} estado="ligado" />
                          <div>
                            <h3>{a.nome}</h3>
                            <p className={s.sub}>
                              {nomeJogo[a.jogo]}. {a.estilo}.
                            </p>
                          </div>
                        </div>
                        <dl className={s.fatos}>
                          <div>
                            <dt>Joga</dt>
                            <dd>{a.quando}</dd>
                          </div>
                          <div>
                            <dt>Gente</dt>
                            <dd>
                              {n} de {a.vagas}
                            </dd>
                          </div>
                          <div>
                            <dt>Parte de cada um</dt>
                            <dd className={s.dinheiro}>{reais(a.totalMes / n)}/mês</dd>
                          </div>
                        </dl>
                        {dentro ? (
                          <p className={s.entrou}>Você está no grupo</p>
                        ) : (
                          <button className={s.botaoSec} onClick={() => setFolha({ tipo: "entrar", id: a.id })}>
                            Entrar no grupo
                          </button>
                        )}
                      </article>
                    );
                  })}
              </div>
            </section>
          )}
        </div>

        {comAbas && (
          <nav className={s.abas} aria-label="Navegação">
            <button aria-current={tela === "grupo"} onClick={() => setTela("grupo")}>
              <Icone nome="grupo" />
              Meu grupo
            </button>
            <button aria-current={tela === "comunidade"} onClick={() => setTela("comunidade")}>
              <Icone nome="comunidade" />
              Comunidade
            </button>
            <button
              onClick={() => {
                setR(rascunhoPara("minecraft"));
                setTela("jogo");
              }}
            >
              <Icone nome="mais" />
              Novo servidor
            </button>
          </nav>
        )}

        {folha && (
          <div className={s.veu} onClick={() => setFolha(null)}>
            <div className={s.folha} role="dialog" aria-modal onClick={(e) => e.stopPropagation()}>
              <span className={s.alca} aria-hidden />
              {folha.tipo === "convite" && (
                <>
                  <h3 className={s.folhaTitulo}>Chame a galera</h3>
                  <p className={s.texto}>Quem entrar pelo link cai direto no servidor, com a versão e os mods certos. Sem digitar IP.</p>
                  <div className={s.convite}>
                    <Qr texto={linkStatus(g)} tamanho={176} />
                    <span className={s.dica}>Aponte a câmera do celular: abre a página do servidor.</span>
                  </div>
                  <button
                    className={s.botao}
                    onClick={() => {
                      navigator.clipboard?.writeText(linkStatus(g)).catch(() => {});
                      avisar("Link copiado. Mande no grupo de vocês.");
                    }}
                  >
                    Copiar link
                  </button>
                  {g.membros.some((m) => m.convite) ? (
                    <button className={s.link} onClick={amigosEntrando}>
                      Simular: os amigos entraram pelo link
                    </button>
                  ) : (
                    <button className={s.link} onClick={() => setFolha(null)}>
                      Fechar
                    </button>
                  )}
                </>
              )}

              {folha.tipo === "recarga" && <Recarga g={g} recarregar={(v) => setFolha({ tipo: "pix", valor: v, motivo: "recarga" })} />}

              {folha.tipo === "pix" && (
                <>
                  <h3 className={s.folhaTitulo}>Pague sua parte no Pix</h3>
                  <p className={s.texto}>
                    {reais(folha.valor / g.membros.length)} é a sua parte da recarga de {reais(folha.valor)}. Cada amigo recebe o Pix dele.
                  </p>
                  <div className={s.convite}>
                    <Qr texto="Ko-op (protótipo): este Pix é simulado, nenhum valor é cobrado." />
                  </div>
                  <button className={s.botaoDinheiro} onClick={() => recarregar(folha.valor)}>
                    Simular: paguei {reais(folha.valor / g.membros.length)}
                  </button>
                </>
              )}

              {folha.tipo === "entrar" &&
                (() => {
                  const a = abertos.find((x) => x.id === folha.id)!;
                  return (
                    <>
                      <h3 className={s.folhaTitulo}>Entrar em {a.nome}</h3>
                      <div className={s.antesDepois}>
                        <div>
                          <span>Hoje, cada um paga</span>
                          <strong className={s.riscado}>{reais(a.totalMes / a.membros)}</strong>
                        </div>
                        <div>
                          <span>Com você no grupo</span>
                          <strong>{reais(a.totalMes / (a.membros + 1))}</strong>
                        </div>
                      </div>
                      <p className={s.texto}>Todo mundo paga menos, inclusive quem já estava. Você paga sua parte no Pix ao entrar.</p>
                      <button
                        className={s.botao}
                        onClick={() => {
                          setEntrei([...entrei, a.id]);
                          setFolha(null);
                          avisar(`Você entrou em ${a.nome}. A parte de todo mundo ficou mais barata.`);
                        }}
                      >
                        Entrar e pagar {reais(a.totalMes / (a.membros + 1))}
                      </button>
                    </>
                  );
                })()}
            </div>
          </div>
        )}

        {toast && (
          <p className={s.toast} role="status">
            {toast}
          </p>
        )}
      </div>
    </div>
  );
}

function TelaPlano({ r, setR, criar }: { r: Rascunho; setR: (r: Rascunho) => void; criar: () => void }) {
  const tm = tamanho(r.tamanhoId);
  const total = r.plano === "horas" ? r.recarga : tm.mes;
  const parte = total / r.pessoas;
  const recomendado: Plano = r.jogo === "minecraft" ? "horas" : "mensal";
  return (
    <section className={s.secao}>
      <h2 className={s.titulo}>Como vocês vão pagar?</h2>

      <div className={s.contador}>
        <span>
          <strong>Quantos no grupo</strong>
          <span className={s.sub}>Contando com você</span>
        </span>
        <div>
          <button aria-label="Menos uma pessoa" onClick={() => setR({ ...r, pessoas: Math.max(2, r.pessoas - 1) })}>
            −
          </button>
          <output>{r.pessoas}</output>
          <button aria-label="Mais uma pessoa" onClick={() => setR({ ...r, pessoas: Math.min(tm.jogadores, r.pessoas + 1) })}>
            +
          </button>
        </div>
      </div>

      <div className={s.lista} role="radiogroup">
        {(["horas", "mensal"] as Plano[]).map((p) => (
          <button key={p} role="radio" aria-checked={r.plano === p} className={s.plano} data-marcado={r.plano === p} onClick={() => setR({ ...r, plano: p })}>
            <span className={s.planoTopo}>
              <strong>{p === "horas" ? "Por horas" : "Mensal"}</strong>
              {p === recomendado && <span className={s.recomendado}>{r.jogo === "minecraft" ? "Bom pra quem joga às vezes" : "Bom pra cidade de RP"}</span>}
            </span>
            <span className={s.sub}>
              {p === "horas"
                ? "Vocês põem créditos numa pool e ela só é usada enquanto alguém joga. Vazio, o servidor dorme e não cobra."
                : "Sempre ligado, com preço fechado. Quem não pagou a parte do mês não entra."}
            </span>
            <span className={s.preco}>{p === "horas" ? `${reais(tm.hora)} por hora ligado` : `${reais(tm.mes)} por mês`}</span>
          </button>
        ))}
      </div>

      {r.plano === "horas" && (
        <Campo rotulo="Primeira recarga da pool">
          <Fichas valores={["25", "50", "100"].map((v) => reais(+v))} marcados={[reais(r.recarga)]} onToggle={(v) => setR({ ...r, recarga: [25, 50, 100].find((x) => reais(x) === v)! })} />
        </Campo>
      )}

      <div className={s.racha}>
        <span>Racha entre {r.pessoas}</span>
        <strong>{reais(parte)} cada</strong>
        <p>
          {r.plano === "horas"
            ? `Dá umas ${Math.floor(r.recarga / tm.hora)} horas de jogo pro grupo. Jogando 4h por dia, o mês sai ${reais(tm.hora * 120)}; ligado 24h, seriam ${reais(tm.hora * 720)}.`
            : `Todo mês o Ko-op manda o Pix de ${reais(parte)} pra cada um e avisa quem falta.`}
        </p>
      </div>

      <Avancar onClick={criar}>Criar servidor e pagar {reais(parte)}</Avancar>
      <p className={s.dica}>Você paga sua parte no Pix agora. Os amigos recebem o Pix deles junto com o convite.</p>
    </section>
  );
}

function Criando({ r }: { r: Rascunho }) {
  const etapas = [
    "Reservando máquina em São Paulo",
    r.jogo === "minecraft" ? `Instalando Minecraft ${r.edicao} ${r.versao}` : "Montando a cidade",
    r.jogo === "minecraft" ? (r.modo === "Com mods" ? `Aplicando o modpack ${r.modpack}` : "Gerando o mundo") : "Instalando os pacotes de scripts",
    "Ligando backup e lista de convidados",
  ];
  const [feito, setFeito] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setFeito((f) => Math.min(f + 1, etapas.length)), 950);
    return () => clearInterval(id);
  }, [etapas.length]);
  return (
    <section className={s.criando}>
      <Bloco jogo={r.jogo} estado={feito >= etapas.length ? "ligado" : "acordando"} />
      <h2 className={s.titulo}>{feito >= etapas.length ? "Pronto!" : "Criando o servidor"}</h2>
      <ul className={s.etapas}>
        {etapas.map((e, i) => (
          <li key={e} data-feito={i < feito}>
            {e}
          </li>
        ))}
      </ul>
    </section>
  );
}

function Recarga({ g, recarregar }: { g: Grupo; recarregar: (v: number) => void }) {
  const [valor, setValor] = useState(50);
  const n = g.membros.length;
  return (
    <>
      <h3 className={s.folhaTitulo}>Recarregar a pool</h3>
      <p className={s.texto}>O valor é rachado por igual entre os {n} do grupo. Cada um paga a parte dele no Pix.</p>
      <Fichas valores={[25, 50, 100].map(reais)} marcados={[reais(valor)]} onToggle={(v) => setValor([25, 50, 100].find((x) => reais(x) === v)!)} />
      <div className={s.racha}>
        <span>Parte de cada um</span>
        <strong>{reais(valor / n)}</strong>
        <p>Enquanto houver crédito, todo mundo joga. Se a pool zerar, o servidor só acorda depois da próxima recarga.</p>
      </div>
      <button className={s.botaoDinheiro} onClick={() => recarregar(valor)}>
        Recarregar {reais(valor)}
      </button>
    </>
  );
}

function Economia({ sessoes, hora, pessoas }: { sessoes: Sessao[]; hora: number; pessoas: number }) {
  const min = sessoes.reduce((a, x) => a + x.minutos, 0);
  const pago = sessoes.reduce((a, x) => a + x.custo, 0);
  const cheio = hora * 24 * 7;
  return (
    <div className={s.economia}>
      <p>
        Nos últimos 7 dias o servidor ficou ligado <strong>{horas(min)}</strong> de 168h. Vocês pagaram <strong>{reais(pago)}</strong> ({reais(pago / pessoas)} cada), em vez de{" "}
        {reais(cheio)} com ele ligado direto.
      </p>
      <span className={s.barra}>
        <span style={{ width: `${Math.max(2, (min / (168 * 60)) * 100)}%` }} />
      </span>
    </div>
  );
}

function Avatares({ membros }: { membros: Membro[] }) {
  return (
    <span className={s.avatares}>
      {membros.map((m) => (
        <span key={m.id} className={s.avatar} style={{ background: m.cor }} data-online={m.online} title={m.nome}>
          {m.convite ? "?" : m.nome[0]}
        </span>
      ))}
    </span>
  );
}

function Campo({ rotulo, ajuda, children }: { rotulo: string; ajuda?: string; children: React.ReactNode }) {
  return (
    <div className={s.grupoCampo}>
      <span className={s.rotulo}>{rotulo}</span>
      {children}
      {ajuda && <span className={s.dica}>{ajuda}</span>}
    </div>
  );
}

function Segmentos({ valores, valor, onChange }: { valores: string[]; valor: string; onChange: (v: string) => void }) {
  return (
    <div className={s.segmentos} role="radiogroup">
      {valores.map((v) => (
        <button key={v} role="radio" aria-checked={v === valor} onClick={() => onChange(v)}>
          {v}
        </button>
      ))}
    </div>
  );
}

function Fichas({ valores, marcados, onToggle }: { valores: string[]; marcados: string[]; onToggle: (v: string) => void }) {
  return (
    <div className={s.fichas}>
      {valores.map((v) => (
        <button key={v} aria-pressed={marcados.includes(v)} onClick={() => onToggle(v)}>
          {v}
        </button>
      ))}
    </div>
  );
}

function Interruptor({ ligado, onChange, titulo, texto }: { ligado: boolean; onChange: (v: boolean) => void; titulo: string; texto?: string }) {
  return (
    <button className={s.interruptor} role="switch" aria-checked={ligado} onClick={() => onChange(!ligado)}>
      <span className={s.cresce}>
        <strong>{titulo}</strong>
        {texto && <span className={s.sub}>{texto}</span>}
      </span>
      <span className={s.chave} />
    </button>
  );
}

function Avancar({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <div className={s.avancar}>
      <button className={s.botao} onClick={onClick}>
        {children}
      </button>
    </div>
  );
}

function Icone({ nome }: { nome: "voltar" | "grupo" | "comunidade" | "mais" }) {
  const d = {
    voltar: "M15 5l-7 7 7 7",
    grupo: "M4 9l8-5 8 5v10H4z M9 19v-5h6v5",
    comunidade: "M8 11a3 3 0 100-6 3 3 0 000 6z M16 11a3 3 0 100-6 3 3 0 000 6z M2 20c0-3 3-5 6-5s6 2 6 5 M14 15.5c3 0 8 1 8 4.5",
    mais: "M12 5v14 M5 12h14",
  }[nome];
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d={d} />
    </svg>
  );
}
