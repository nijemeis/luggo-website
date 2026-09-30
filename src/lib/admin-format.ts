import { STATUS_COLOR, STATUS_LABEL, type OrderStatus } from "./orders";

export const fmtDateTime = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", timeZone: "Europe/Amsterdam" });
export const fmtDate = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "Europe/Amsterdam" });

export function statusStyle(s: string): React.CSSProperties {
  const c = STATUS_COLOR[s as OrderStatus] ?? { bg: "#efe7da", fg: "#6e6559" };
  return { background: c.bg, color: c.fg };
}
export function statusText(s: string): string {
  return STATUS_LABEL[s as OrderStatus] ?? s;
}
