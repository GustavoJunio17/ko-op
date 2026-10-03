import { useId } from "react";
import QRCode from "qrcode";
import type { Jogo } from "./precos";
import s from "./app.module.css";

export type Estado = "dormindo" | "acordando" | "ligado";

// O servidor desenhado como o símbolo do jogo: o bloco de grama no Minecraft, o "V" no GTA.
// A cor diz o estado: cinza dormindo, pulsando ao acordar, com as cores do jogo quando ligado.
export function Bloco({ jogo, estado }: { jogo: Jogo; estado: Estado }) {
  return (
    <div className={s.bloco} data-estado={estado} aria-hidden>
      {jogo === "gta" ? <SimboloV apagado={estado === "dormindo"} /> : <BlocoGrama apagado={estado === "dormindo"} />}
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

function BlocoGrama({ apagado }: { apagado: boolean }) {
  const c = apagado ? { topo: "#c9d3df", esq: "#a9b5c4", dir: "#94a1b2" } : { topo: "#4fbf6f", esq: "#8a5a3b", dir: "#6e4529" };
  return (
    <svg viewBox="0 0 120 120" width="132" height="132">
      <polygon points="60,10 108,36 60,62 12,36" fill={c.topo} />
      <polygon points="12,36 60,62 60,112 12,86" fill={c.esq} />
      <polygon points="108,36 60,62 60,112 108,86" fill={c.dir} />
      {!apagado && <path d="M12 36 L60 62 L108 36 L108 46 L96 52 L84 46 L72 58 L60 70 L48 58 L36 50 L24 52 L12 46 Z" fill="#3fa85d" />}
    </svg>
  );
}

// O "V" do GTA V, sem letras: contorno preto, filete branco e miolo verde com trama de nota de dinheiro.
const formaV = "M8 16 H50 V28 H43 L60 78 L77 28 H70 V16 H112 V28 H103 L66 108 H54 L17 28 H8 Z";

function SimboloV({ apagado }: { apagado: boolean }) {
  const trama = `trama${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const c = apagado
    ? { contorno: "#8a96ab", filete: "#eef2f6", miolo: "#c9d3df", linha: "#b6c3d4" }
    : { contorno: "#0d1220", filete: "#ffffff", miolo: "#4f8f3a", linha: "#7fbf5a" };
  return (
    <svg viewBox="0 0 120 120" width="132" height="132">
      <defs>
        <pattern id={trama} width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(35)">
          <rect width="6" height="6" fill={c.miolo} />
          <path d="M0 0 L6 6 M6 0 L0 6" stroke={c.linha} strokeWidth="0.9" />
        </pattern>
      </defs>
      <g transform="translate(11 8) scale(0.82)">
      <path d={formaV} fill={c.contorno} stroke={c.contorno} strokeWidth="12" strokeLinejoin="miter" />
      <path d={formaV} fill={c.filete} stroke={c.filete} strokeWidth="6" strokeLinejoin="miter" />
      <path d={formaV} fill={`url(#${trama})`} />
      <path d={formaV} fill="none" stroke={c.contorno} strokeWidth="1.6" strokeLinejoin="miter" />
      </g>
    </svg>
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
