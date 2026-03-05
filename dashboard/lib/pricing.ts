/**
 * Chave do select: valor do <option> (1 a 7 dias ou "mais").
 * Valor em reais (number) para cálculo e exibição.
 */
export type DaysOption = "1" | "2" | "3" | "4" | "5" | "6" | "7" | "mais";

export const PRICE_BY_DAYS: Record<DaysOption, number> = {
  "1": 39.9,
  "2": 49.9,
  "3": 59.9,
  "4": 69.9,
  "5": 79.9,
  "6": 89.9,
  "7": 99.9,
  mais: 129.9,
};

export const DEFAULT_PRICE = PRICE_BY_DAYS["1"];

export function getPriceByDays(days: DaysOption | ""): number {
  if (!days || !(days in PRICE_BY_DAYS)) return DEFAULT_PRICE;
  return PRICE_BY_DAYS[days as DaysOption];
}
