import type { Prisma } from "@prisma/client";
import { isOrderStatus } from "./orders";

export type OrderFilters = { status?: string; q?: string; from?: string; to?: string };

/** Shared by the admin order list and the CSV export, so both show the same rows. */
export function orderWhere(f: OrderFilters): Prisma.OrderWhereInput {
  const where: Prisma.OrderWhereInput = {};
  if (f.status === "all") {
    // everything, including unpaid checkouts
  } else if (f.status && isOrderStatus(f.status)) where.status = f.status;
  else where.status = { not: "pending_payment" };
  const created: Prisma.DateTimeFilter = {};
  if (f.from && /^\d{4}-\d{2}-\d{2}$/.test(f.from)) created.gte = new Date(`${f.from}T00:00:00`);
  if (f.to && /^\d{4}-\d{2}-\d{2}$/.test(f.to)) created.lt = new Date(new Date(`${f.to}T00:00:00`).getTime() + 86400_000);
  if (created.gte || created.lt) where.createdAt = created;
  const q = f.q?.trim();
  if (q) where.OR = [{ number: { contains: q.toUpperCase() } }, { email: { contains: q, mode: "insensitive" } }, { lastName: { contains: q, mode: "insensitive" } }, { trackingCode: { contains: q, mode: "insensitive" } }];
  return where;
}

export function filterQuery(f: OrderFilters, override: Partial<OrderFilters> = {}): string {
  const merged = { ...f, ...override };
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(merged)) if (v) sp.set(k, v);
  const s = sp.toString();
  return s ? `?${s}` : "";
}
