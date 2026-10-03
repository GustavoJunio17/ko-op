// Estrutura das fichas do roadmap (o "formulário"). Os valores preenchidos
// ficam em content/data/<id>.json e são editados pelo site.
// Para adicionar uma ficha nova, acrescente um item em `sheets`.

export type TextField = {
  type: "text";
  key: string;
  label: string;
  hint?: string;
};

export type ListField = {
  type: "list";
  key: string;
  label: string;
  hint?: string;
  items: number;
};

export type TableField = {
  type: "table";
  key: string;
  label: string;
  hint?: string;
  columns: { key: string; label: string }[];
  rows: number;
};

export type OptionsField = {
  type: "options";
  key: string;
  label: string;
  hint?: string;
  options: { key: string; label: string; description?: string }[];
  // Quando definido, cada opção ganha um campo de texto com esse rótulo.
  noteLabel?: string;
};

export type Field = TextField | ListField | TableField | OptionsField;

export type Sheet = {
  id: string;
  block: string;
  title: string;
  description: string;
  fields: Field[];
};

// Valores salvos de uma ficha, indexados pela `key` de cada campo.
export type TextValue = string;
export type ListValue = string[];
export type TableValue = Record<string, string>[];
export type OptionsValue = { checked: string[]; notes: Record<string, string> };
export type FieldValue = TextValue | ListValue | TableValue | OptionsValue;
export type SheetData = Record<string, FieldValue>;

// Cada salvamento gera uma versão com o conteúdo completo da ficha naquele
// momento; o diff é calculado comparando uma versão com a anterior.
export type SheetVersion = {
  id: string;
  at: string;
  author: string;
  note: string;
  // Contexto opcional da versão (ex.: o que motivou a mudança).
  detail?: string;
  data: SheetData;
};

// Formato de content/data/<id>.json.
export type SheetDoc = {
  data: SheetData;
  versions: SheetVersion[];
};

export const sheets: Sheet[] = [
  {
    id: "mapa-da-empatia",
    block: "Bloco 1 · Empatia",
    title: "Mapa da Empatia",
    description:
      "Pensem numa pessoa real (ou numa das entrevistas). Preencham como se estivessem descrevendo ela, não vocês.",
    fields: [
      { type: "text", key: "diz", label: "O que ela diz?" },
      { type: "text", key: "pensa", label: "O que ela pensa?" },
      { type: "text", key: "faz", label: "O que ela faz?" },
      { type: "text", key: "sente", label: "O que ela sente?" },
      { type: "text", key: "dores", label: "Dores" },
      { type: "text", key: "ganhos", label: "Ganhos desejados" },
    ],
  },
  {
    id: "declaracao-do-problema",
    block: "Bloco 1 · Definição",
    title: "Declaração do Problema",
    description:
      "Preencham cada campo separadamente primeiro. Depois montem a frase completa no quadro final — ela vira a base de tudo que vem depois, inclusive do pitch.",
    fields: [
      { type: "text", key: "produto", label: "Produto" },
      { type: "text", key: "usuario", label: "Usuário" },
      { type: "text", key: "acao", label: "Ação específica" },
      { type: "text", key: "afetados", label: "Quem é afetado" },
      { type: "text", key: "beneficio", label: "Benefício real" },
      { type: "text", key: "metrica", label: "Métrica de sucesso" },
      {
        type: "text",
        key: "frase",
        label: "Frase completa",
        hint: "Junte os campos acima em uma única frase.",
      },
    ],
  },
  {
    id: "teste-da-mae",
    block: "Bloco 1 e 2 · Validação",
    title: "Teste da Mãe",
    description:
      "As 3 regras: não fale da sua ideia, pergunte sobre o passado, desconfie de elogio genérico.",
    fields: [
      { type: "text", key: "ultima-vez", label: "1. Quando foi a última vez que jogou em grupo num servidor?" },
      { type: "text", key: "como-foi-criado", label: "2. Como o servidor foi criado e quem cuidou disso?" },
      { type: "text", key: "dificuldade", label: "3. Foi complicado criar o servidor?" },
      { type: "text", key: "custo", label: "4. Quanto custou?" },
      { type: "text", key: "uso", label: "5. Quanto tempo o servidor ficava ligado e quanto vocês jogavam?" },
      { type: "text", key: "desistencia", label: "6. Já parou de jogar no servidor por algum problema?" },
      { type: "text", key: "outras-experiencias", label: "7. Teve outras experiências? O que mudaria?" },
    ],
  },
  {
    id: "gerar-e-escolher-a-ideia",
    block: "Bloco 2 · Ideação",
    title: "Gerar e escolher a ideia",
    description:
      "Primeiro quantidade, depois qualidade. Anotem toda ideia que surgir, mesmo as estranhas — filtrar vem depois.",
    fields: [
      {
        type: "list",
        key: "brainstorming",
        label: "Brainstorming",
        hint: "Até 12 ideias.",
        items: 12,
      },
      {
        type: "table",
        key: "finalistas",
        label: "Seleção — as 3 finalistas",
        rows: 3,
        columns: [
          { key: "ideia", label: "Ideia" },
          { key: "resolve", label: "Resolve o problema?" },
          { key: "viavel", label: "É viável em um dia?" },
          { key: "diferente", label: "É diferente do que já existe?" },
        ],
      },
    ],
  },
  {
    id: "canvas-da-proposta-de-valor",
    block: "Bloco 3 · Mercado e público-alvo",
    title: "Canvas da Proposta de Valor",
    description:
      "Conecta as dores e os ganhos do usuário diretamente aos benefícios da solução.",
    fields: [
      { type: "text", key: "dores", label: "Dores" },
      { type: "text", key: "ganhos", label: "Ganhos desejados" },
      { type: "text", key: "solucao", label: "Como a solução ajuda" },
    ],
  },
  {
    id: "canvas-do-modelo-de-negocios",
    block: "Bloco 3 · Modelo de monetização",
    title: "Canvas do Modelo de Negócios",
    description:
      "Não precisa preencher os 9 blocos com rigor de curso. Foquem em receita, canal e custo principal.",
    fields: [
      { type: "text", key: "segmentos", label: "Segmentos de cliente" },
      { type: "text", key: "proposta", label: "Proposta de valor" },
      { type: "text", key: "canais", label: "Canais" },
      { type: "text", key: "relacionamento", label: "Relacionamento" },
      { type: "text", key: "receita", label: "Fontes de receita" },
      { type: "text", key: "recursos", label: "Recursos-chave" },
      { type: "text", key: "atividades", label: "Atividades-chave" },
      { type: "text", key: "parcerias", label: "Parcerias-chave" },
      { type: "text", key: "custos", label: "Estrutura de custos" },
    ],
  },
  {
    id: "tipos-de-monetizacao",
    block: "Bloco 3 · Modelo de monetização",
    title: "Tipos de monetização",
    description: "Marquem o(s) modelo(s) que fazem sentido pra ideia.",
    fields: [
      {
        type: "options",
        key: "modelos",
        label: "Modelos",
        options: [
          { key: "assinatura", label: "Assinatura", description: "Pagamento recorrente por acesso contínuo" },
          { key: "freemium", label: "Freemium", description: "Acesso grátis com limite, upgrade pago" },
          { key: "marketplace", label: "Marketplace / comissão", description: "Receita por intermediar oferta e demanda" },
          { key: "publicidade", label: "Publicidade", description: "Receita pela atenção do usuário" },
          { key: "pay-per-use", label: "Pay-per-use", description: "Pagamento proporcional ao uso" },
          { key: "venda-direta", label: "Venda direta", description: "Cliente paga por unidade ou entrega pontual" },
        ],
      },
      { type: "text", key: "na-pratica", label: "Como isso vira receita, na prática" },
    ],
  },
  {
    id: "fidelidade-de-prototipo",
    block: "Bloco 4 · Viabilidade técnica",
    title: "Fidelidade de protótipo",
    description: "Marquem o nível que vão usar — baixa ou média já basta.",
    fields: [
      {
        type: "options",
        key: "nivel",
        label: "Nível",
        options: [
          { key: "baixa", label: "Baixa — Explorar", description: "Papel, rascunho, storyboard" },
          { key: "media", label: "Média — Definir", description: "Wireframes navegáveis, fluxo da ideia" },
          { key: "alta", label: "Alta — Validar", description: "Quase o produto real" },
        ],
      },
      { type: "text", key: "primeira-tela", label: "Primeira tela ou fluxo da solução" },
    ],
  },
  {
    id: "estrutura-do-pitch",
    block: "Bloco 4 · Qualidade da apresentação",
    title: "Estrutura do Pitch",
    description:
      "7 minutos, 5 passos. Escrevam o rascunho de cada bloco — no palco, falem, não leiam.",
    fields: [
      { type: "text", key: "problema", label: "1. Problema", hint: "A dor real e específica." },
      { type: "text", key: "solucao", label: "2. Solução", hint: "O momento em que faz sentido." },
      { type: "text", key: "mercado", label: "3. Mercado", hint: "Quem sente essa dor, e quantos." },
      { type: "text", key: "modelo", label: "4. Modelo e diferencial", hint: "Como gera receita e por que vocês." },
      { type: "text", key: "pedido", label: "5. Pedido", hint: "O próximo passo se a ideia seguir adiante." },
    ],
  },
  {
    id: "checklist-final",
    block: "Antes de subir no palco",
    title: "Checklist final",
    description:
      "Revisem juntos, rapidamente, se cada critério está coberto na apresentação.",
    fields: [
      {
        type: "options",
        key: "criterios",
        label: "Critérios",
        noteLabel: "Onde aparece no pitch",
        options: [
          { key: "inovacao", label: "Inovação e originalidade" },
          { key: "viabilidade", label: "Viabilidade técnica e operacional" },
          { key: "monetizacao", label: "Modelo de monetização" },
          { key: "mercado", label: "Análise de mercado e público-alvo" },
          { key: "apresentacao", label: "Qualidade da apresentação (pitch)" },
          { key: "impacto", label: "Potencial de impacto para o usuário B2C" },
        ],
      },
    ],
  },
];

export function getSheet(id: string) {
  return sheets.find((s) => s.id === id);
}

// Normaliza o valor salvo para o formato esperado pelo campo, tolerando
// dados ausentes ou de uma versão antiga do schema.
export function valueFor(field: Field, data: SheetData): FieldValue {
  const raw = data[field.key];
  switch (field.type) {
    case "text":
      return typeof raw === "string" ? raw : "";
    case "list": {
      const arr = Array.isArray(raw) ? (raw as unknown[]) : [];
      return Array.from({ length: field.items }, (_, i) =>
        typeof arr[i] === "string" ? (arr[i] as string) : "",
      );
    }
    case "table": {
      const arr = Array.isArray(raw) ? (raw as unknown[]) : [];
      return Array.from({ length: field.rows }, (_, i) => {
        const row = (arr[i] ?? {}) as Record<string, unknown>;
        return Object.fromEntries(
          field.columns.map((c) => [c.key, typeof row[c.key] === "string" ? (row[c.key] as string) : ""]),
        );
      });
    }
    case "options": {
      const v = (raw ?? {}) as Partial<OptionsValue>;
      return {
        checked: Array.isArray(v.checked) ? v.checked : [],
        notes: v.notes && typeof v.notes === "object" ? v.notes : {},
      };
    }
  }
}

export function isFilled(field: Field, value: FieldValue): boolean {
  switch (field.type) {
    case "text":
      return (value as TextValue).trim() !== "";
    case "list":
      return (value as ListValue).some((v) => v.trim() !== "");
    case "table":
      return (value as TableValue).some((r) => Object.values(r).some((c) => c.trim() !== ""));
    case "options":
      return (value as OptionsValue).checked.length > 0;
  }
}

export type SheetStatus = "vazio" | "em-andamento" | "concluido";

export function sheetStatus(sheet: Sheet, data: SheetData): SheetStatus {
  const filled = sheet.fields.filter((f) => isFilled(f, valueFor(f, data))).length;
  if (filled === 0) return "vazio";
  return filled === sheet.fields.length ? "concluido" : "em-andamento";
}
