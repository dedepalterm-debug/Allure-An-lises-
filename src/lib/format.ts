// Helpers de formatação para a UI (pt-BR).

export function brl(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  }).format(Number.isFinite(value) ? value : 0);
}

export function brlCents(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(Number.isFinite(value) ? value : 0);
}

export function pct(value: number, casas = 1): string {
  if (!Number.isFinite(value)) return "0%";
  return `${value.toFixed(casas).replace(".", ",")}%`;
}

export function num(value: number, casas = 1): string {
  if (!Number.isFinite(value)) return "0";
  return value.toFixed(casas).replace(".", ",");
}

export function dateBR(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}
