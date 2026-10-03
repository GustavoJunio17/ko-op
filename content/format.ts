const tz = "America/Sao_Paulo";

const dateTime = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: tz,
});

const dayMonth = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "short",
  timeZone: tz,
});

export const formatDateTime = (iso: string) => dateTime.format(new Date(iso));
export const formatDay = (iso: string) => dayMonth.format(new Date(iso)).replace(".", "");
