// Preços PROVISÓRIOS do protótipo. Troque aqui quando a tabela final chegar:
// cada tamanho tem o preço por hora (plano por horas) e o preço fechado do mês (plano mensal).

export type Jogo = "minecraft" | "gta";
export type Plano = "horas" | "mensal";

export type Tamanho = {
  id: string;
  jogo: Jogo;
  nome: string;
  jogadores: number;
  hora: number;
  mes: number;
  tecnico: string;
};

export const tamanhos: Tamanho[] = [
  { id: "mc-5", jogo: "minecraft", nome: "Até 5 amigos", jogadores: 5, hora: 0.5, mes: 89, tecnico: "2 vCPU Arm, 4 GB de RAM" },
  { id: "mc-10", jogo: "minecraft", nome: "Até 10 amigos", jogadores: 10, hora: 0.9, mes: 159, tecnico: "4 vCPU Arm, 8 GB de RAM" },
  { id: "mc-20", jogo: "minecraft", nome: "Até 20 amigos", jogadores: 20, hora: 1.6, mes: 279, tecnico: "6 vCPU Arm, 16 GB de RAM" },
  { id: "gta-32", jogo: "gta", nome: "Cidade até 32 jogadores", jogadores: 32, hora: 1.4, mes: 249, tecnico: "4 vCPU x86, 16 GB de RAM" },
  { id: "gta-64", jogo: "gta", nome: "Cidade até 64 jogadores", jogadores: 64, hora: 2.6, mes: 449, tecnico: "8 vCPU x86, 32 GB de RAM" },
];

export const tamanho = (id: string) => tamanhos.find((t) => t.id === id) ?? tamanhos[0];

const brl = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
export const reais = (v: number) => brl.format(v);
