// Conteúdo do roadmap. Para adicionar uma etapa nova, acrescente um item em `stages`.

export type StageStatus = "concluido" | "em-andamento" | "planejado";

export type Field = {
  label: string;
  value: string | string[];
};

export type Stage = {
  id: string;
  title: string;
  summary?: string;
  status: StageStatus;
  fields: Field[];
};

export const stages: Stage[] = [
  {
    id: "declaracao-do-problema",
    title: "Declaração do Problema",
    summary:
      "O que estamos construindo, para quem, e como vamos saber se deu certo.",
    status: "concluido",
    fields: [
      {
        label: "Produto",
        value:
          "Aplicativo, no computador, na web e mobile, em que uma pessoa ou um grupo paga e joga no seu próprio servidor, possuindo funcionalidades exclusivas do mercado.",
      },
      {
        label: "Usuário",
        value:
          "Grupos de amigos ou pessoas que buscam jogar em grupo no PC jogos cooperativos e de sobrevivência ou de RolePlaying, como Minecraft ou GTA VI.",
      },
      {
        label: "Ação específica",
        value: [
          "Criar o servidor do grupo, entrar e configurar (mods, backup, segurança e outras configurações técnicas) no jogo com um clique, com o servidor ligado e tudo configurado.",
          "Pagar só as horas jogadas e dividir a conta por PIX.",
          "Acesso a comunidades para encontrar outros entusiastas para jogar juntos.",
          "Suporte e atendimento nível Statum.",
        ],
      },
      {
        label: "Quem é afetado",
        value: [
          "Quem organiza o grupo: hoje configura tudo sozinho, paga o servidor inteiro e cobra os amigos.",
          "Os amigos que desistem de jogar junto porque entrar é complicado.",
          "Pessoas que ainda não têm o grupo de amigos para jogar juntos.",
        ],
      },
      {
        label: "Benefício real",
        value: [
          "Menos tempo entre decidir jogar e estar jogando.",
          "Fim do mês pago por um servidor vazio.",
          "Fim da cobrança entre amigos.",
          "Facilidade na configuração e para jogar.",
          "Comunidade para encontrar pessoas com vontade de jogar.",
        ],
      },
      {
        label: "Métrica de sucesso",
        value: [
          "Tempo entre criar o servidor e a primeira partida com três ou mais amigos.",
          "Número de pagantes por grupo.",
          "Grupos que voltam a jogar no mês seguinte.",
          "Crescimento da comunidade.",
        ],
      },
    ],
  },
];
