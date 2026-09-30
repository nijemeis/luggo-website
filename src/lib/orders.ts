import { db } from "./db";

/** The order state machine; the tracking timeline shows the fulfilment part of it. */
export const ORDER_STATUSES = ["pending_payment", "paid", "packed", "shipped", "delivered", "cancelled", "refunded"] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const STATUS_LABEL: Record<OrderStatus, string> = {
  pending_payment: "Awaiting payment",
  paid: "Paid",
  packed: "Packed",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
  refunded: "Refunded",
};

/** Timeline steps shown to customers, in order. */
export const TIMELINE: OrderStatus[] = ["paid", "packed", "shipped", "delivered"];

/** Tag colours in the admin (Luggo palette). */
export const STATUS_COLOR: Record<OrderStatus, { bg: string; fg: string }> = {
  pending_payment: { bg: "#f4ecdf", fg: "#8a6d3b" },
  paid: { bg: "#f7e6dd", fg: "#b4583a" },
  packed: { bg: "#f6ead3", fg: "#a8772f" },
  shipped: { bg: "#e3edf5", fg: "#4f7797" },
  delivered: { bg: "#eef4ee", fg: "#4d8a5d" },
  cancelled: { bg: "#efe7da", fg: "#6e6559" },
  refunded: { bg: "#efe7da", fg: "#6e6559" },
};

/** Allowed status changes in the admin. */
export const NEXT_STATUS: Record<OrderStatus, OrderStatus[]> = {
  pending_payment: ["paid", "cancelled"],
  paid: ["packed", "shipped", "cancelled", "refunded"],
  packed: ["shipped", "cancelled", "refunded"],
  shipped: ["delivered", "refunded"],
  delivered: ["refunded"],
  cancelled: ["refunded"],
  refunded: [],
};

/** Orders that still need work from the shop. */
export const OPEN_STATUSES: OrderStatus[] = ["paid", "packed"];

export function isOrderStatus(s: string): s is OrderStatus {
  return (ORDER_STATUSES as readonly string[]).includes(s);
}

export const ORDER_PREFIX = "LUG";

/** Order numbers are LUG-#### and strictly increasing. */
export async function nextOrderNumber(): Promise<string> {
  const c = await db.counter.upsert({
    where: { name: "order" },
    create: { name: "order", value: 1001 },
    update: { value: { increment: 1 } },
  });
  return `${ORDER_PREFIX}-${c.value}`;
}

export function normaliseOrderNumber(input: string): string {
  const digits = input.toUpperCase().replace(/[^0-9]/g, "");
  if (!digits) return "";
  return `${ORDER_PREFIX}-${digits}`;
}

export function beaconWord(n: number): string {
  return `${n} Luggo beacon${n === 1 ? "" : "s"}`;
}
