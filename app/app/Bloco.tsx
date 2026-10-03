import QRCode from "qrcode";
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
      {jogo === "gta" && (
        <span className={s.marcaJogo}>
          <EmblemaGta />
        </span>
      )}
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

// QR de verdade (dá pra escanear), desenhado com as cores do app.
export function Qr({ texto, tamanho = 148 }: { texto: string; tamanho?: number }) {
  const { size: n, data } = QRCode.create(texto, { errorCorrectionLevel: "M" }).modules;
  const cells: React.ReactNode[] = [];
  for (let y = 0; y < n; y++)
    for (let x = 0; x < n; x++) if (data[y * n + x]) cells.push(<rect key={`${x}-${y}`} x={x} y={y} width="1.02" height="1.02" />);
  return (
    <svg viewBox={`-2 -2 ${n + 4} ${n + 4}`} width={tamanho} height={tamanho} className={s.qr} role="img" aria-label="QR code">
      <rect x="-2" y="-2" width={n + 4} height={n + 4} fill="#fff" />
      <g fill="#172036">{cells}</g>
    </svg>
  );
}

// Selo do GTA V: o "V" grande sobre o fundo escuro, no espírito da capa do jogo.
export function EmblemaGta({ tamanho = 40 }: { tamanho?: number }) {
  return (
    <svg viewBox="0 0 40 40" width={tamanho} height={tamanho} className={s.emblema} role="img" aria-label="GTA V">
      <rect width="40" height="40" rx="9" fill="#0d1220" />
      <text x="20" y="11.5" textAnchor="middle" fontSize="6.4" fontWeight="800" fill="#fff" letterSpacing="0.6" fontFamily="var(--font-display), system-ui, sans-serif">
        GTA
      </text>
      <path d="M7.5 14 H15 L20 28.5 L25 14 H32.5 L23.5 35 H16.5 Z" fill="#7fd36b" stroke="#2f7a35" strokeWidth="1.2" strokeLinejoin="round" />
    </svg>
  );
}
