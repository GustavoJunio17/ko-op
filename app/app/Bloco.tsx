import type { Jogo } from "./precos";
import s from "./app.module.css";

export type Estado = "dormindo" | "acordando" | "ligado";

// O servidor desenhado como um bloco isométrico. A cor diz o estado:
// cinza dormindo, pulsando ao acordar, com as cores do jogo quando ligado.
const cores: Record<Jogo, { topo: string; esq: string; dir: string }> = {
  minecraft: { topo: "#4fbf6f", esq: "#8a5a3b", dir: "#6e4529" },
  gta: { topo: "#3366e8", esq: "#24324f", dir: "#172036" },
};
const dormindo = { topo: "#c9d3df", esq: "#a9b5c4", dir: "#94a1b2" };

export function Bloco({ jogo, estado }: { jogo: Jogo; estado: Estado }) {
  const c = estado === "dormindo" ? dormindo : cores[jogo];
  return (
    <div className={s.bloco} data-estado={estado} aria-hidden>
      <svg viewBox="0 0 120 120" width="132" height="132">
        <polygon points="60,10 108,36 60,62 12,36" fill={c.topo} />
        <polygon points="12,36 60,62 60,112 12,86" fill={c.esq} />
        <polygon points="108,36 60,62 60,112 108,86" fill={c.dir} />
        {jogo === "minecraft" && estado !== "dormindo" && (
          <path d="M12 36 L60 62 L108 36 L108 46 L96 52 L84 46 L72 58 L60 70 L48 58 L36 50 L24 52 L12 46 Z" fill="#3fa85d" />
        )}
        {jogo === "gta" && estado !== "dormindo" && (
          <g fill="#e9a21f" opacity="0.9">
            <rect x="22" y="56" width="7" height="9" transform="skewY(28)" />
            <rect x="36" y="44" width="7" height="9" transform="skewY(28)" />
            <rect x="22" y="74" width="7" height="9" transform="skewY(28)" />
            <rect x="73" y="102" width="7" height="9" transform="skewY(-28)" />
            <rect x="88" y="110" width="7" height="9" transform="skewY(-28)" />
          </g>
        )}
      </svg>
      {estado === "dormindo" && (
        <span className={s.zz}>
          <span>z</span>
          <span>z</span>
          <span>Z</span>
        </span>
      )}
    </div>
  );
}

// QR "de mentira", mas com cara de QR: os três quadrados de canto e um miolo determinístico.
export function Qr({ texto, tamanho = 148 }: { texto: string; tamanho?: number }) {
  const n = 25;
  let h = 0;
  for (const ch of texto) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  const canto = (x: number, y: number) => x < 8 && y < 8 || x >= n - 8 && y < 8 || x < 8 && y >= n - 8;
  const cells: React.ReactNode[] = [];
  for (let y = 0; y < n; y++)
    for (let x = 0; x < n; x++) {
      if (canto(x, y)) continue;
      h = (h * 1103515245 + 12345) >>> 0;
      if ((h >>> 16) % 2) cells.push(<rect key={`${x}-${y}`} x={x} y={y} width="1" height="1" />);
    }
  const finder = (x: number, y: number) => (
    <g key={`f${x}${y}`}>
      <rect x={x} y={y} width="7" height="7" />
      <rect x={x + 1} y={y + 1} width="5" height="5" fill="#fff" />
      <rect x={x + 2} y={y + 2} width="3" height="3" />
    </g>
  );
  return (
    <svg viewBox={`-1 -1 ${n + 2} ${n + 2}`} width={tamanho} height={tamanho} className={s.qr} role="img" aria-label="QR code">
      <rect x="-1" y="-1" width={n + 2} height={n + 2} fill="#fff" />
      <g fill="#172036">
        {cells}
        {finder(0, 0)}
        {finder(n - 7, 0)}
        {finder(0, n - 7)}
      </g>
    </svg>
  );
}
