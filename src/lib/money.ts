/** Format integer cents as the shop's house style: "€ 69,95". */
export function money(cents: number): string {
  const sign = cents < 0 ? "-" : "";
  const abs = Math.abs(cents);
  const euros = Math.floor(abs / 100);
  const rest = (abs % 100).toString().padStart(2, "0");
  return `${sign}€ ${euros.toLocaleString("nl-NL")},${rest}`;
}

/** Parse "69,95" / "69.95" / "€ 69,95" into cents. Returns null when invalid. */
export function parseMoney(input: string): number | null {
  const cleaned = input.replace(/[€\s]/g, "").replace(",", ".");
  if (cleaned === "") return null;
  const n = Number(cleaned);
  if (!Number.isFinite(n) || n < 0) return null;
  return Math.round(n * 100);
}

export function centsToInput(cents: number | null | undefined): string {
  if (cents == null) return "";
  return (cents / 100).toFixed(2).replace(".", ",");
}

/** VAT portion included in a gross amount (prices are VAT-inclusive). */
export function vatIncluded(grossCents: number, ratePercent: number): number {
  return Math.round(grossCents - grossCents / (1 + ratePercent / 100));
}
