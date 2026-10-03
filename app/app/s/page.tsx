import type { Metadata } from "next";
import { Status, type DadosStatus } from "./Status";

export const metadata: Metadata = {
  title: "Ko-op — Página do servidor",
  description: "Status do servidor do grupo: se está ligado, quem está jogando e quanto tempo ficou ligado.",
};

// Os dados vêm na própria URL (é o que o QR do convite carrega), então a página não precisa de banco.
export default async function StatusPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const q = await searchParams;
  const um = (k: string) => (Array.isArray(q[k]) ? q[k][0] : q[k]) ?? "";
  const dados: DadosStatus = {
    nome: um("g") || "Os Cria do Bloco",
    jogo: um("j") === "gta" ? "gta" : "minecraft",
    estado: um("e") === "ligado" ? "ligado" : "dormindo",
    membros: Math.max(1, Number(um("n")) || 5),
    online: Math.max(0, Number(um("on")) || 0),
    tamanhoId: um("t") || "mc-5",
    detalhe: um("d") || "Sobrevivência com o modpack Create, Java 1.21.4",
    plano: um("p") === "mensal" ? "mensal" : "horas",
  };
  return <Status {...dados} />;
}
