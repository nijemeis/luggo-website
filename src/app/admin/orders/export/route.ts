import { db } from "@/lib/db";
import { isAdmin } from "@/lib/auth";
import { orderWhere } from "@/lib/admin-orders";

const cents = (n: number) => (n / 100).toFixed(2).replace(".", ",");
const cell = (v: unknown) => {
  const s = String(v ?? "");
  return /[";\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

/** CSV of the orders matching the admin filters. Semicolon-separated with decimal commas, so Dutch Excel opens it as-is. */
export async function GET(req: Request) {
  if (!(await isAdmin())) return new Response("Not authorised", { status: 401 });
  const sp = new URL(req.url).searchParams;
  const orders = await db.order.findMany({
    where: orderWhere({ status: sp.get("status") ?? undefined, q: sp.get("q") ?? undefined, from: sp.get("from") ?? undefined, to: sp.get("to") ?? undefined }),
    orderBy: { createdAt: "asc" },
    include: { items: true },
  });
  const head = ["number", "created", "paid", "status", "email", "phone", "first_name", "last_name", "street", "house_no", "postcode", "city", "country", "packs", "beacons", "subtotal_eur", "shipping_eur", "vat_eur", "total_eur", "payment_method", "carrier", "tracking_code"];
  const rows = orders.map((o) => [
    o.number, o.createdAt.toISOString(), o.paidAt?.toISOString() ?? "", o.status, o.email, o.phone, o.firstName, o.lastName, o.street, o.houseNo, o.postcode, o.city, o.country,
    o.items.map((i) => `${i.qty}x ${i.name}`).join(", "), o.items.reduce((s, i) => s + i.units * i.qty, 0),
    cents(o.subtotalCents), cents(o.shippingCents), cents(o.vatCents), cents(o.totalCents), o.paymentMethod, o.carrier, o.trackingCode,
  ]);
  const csv = "﻿" + [head, ...rows].map((r) => r.map(cell).join(";")).join("\r\n");
  const stamp = new Date().toISOString().slice(0, 10);
  return new Response(csv, { headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": `attachment; filename="luggo-orders-${stamp}.csv"` } });
}
