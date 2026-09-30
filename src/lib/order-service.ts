import { db } from "./db";
import { getContent, fill, addressLine } from "./content";
import { sendMail, layout, p, button, table, esc } from "./email";
import { money } from "./money";
import { beaconWord, STATUS_LABEL, type OrderStatus } from "./orders";
import { STOCK_COUNTER } from "./catalog";
import { carrierLabel, trackingUrl } from "./shipping";
import { siteUrl } from "./stripe";

type Line = { name: string; units: number; qty: number; unitPriceCents: number };

function unitsOf(items: Line[]): number {
  return items.reduce((s, i) => s + i.units * i.qty, 0);
}

function orderRows(o: { items: Line[]; shippingCents: number; zoneName: string; totalCents: number; vatCents: number }): [string, string][] {
  const rows: [string, string][] = o.items.map((i) => [`${i.qty} × ${esc(i.name)} <span style="color:#8a8175">(${i.units * i.qty} beacon${i.units * i.qty === 1 ? "" : "s"})</span>`, money(i.unitPriceCents * i.qty)]);
  rows.push([`Shipping — ${esc(o.zoneName)}`, o.shippingCents ? money(o.shippingCents) : "free"]);
  rows.push([`Total <span style="color:#8a8175">(incl. ${money(o.vatCents)} VAT)</span>`, money(o.totalCents)]);
  return rows;
}

/**
 * Mark an order paid, exactly once. The status flip is a conditional update, so the
 * webhook and the confirmation page can race without sending two emails.
 */
export async function markOrderPaid(orderId: string, opts: { paymentMethod?: string; paymentIntentId?: string } = {}): Promise<void> {
  const flipped = await db.order.updateMany({
    where: { id: orderId, status: "pending_payment" },
    data: {
      status: "paid",
      paidAt: new Date(),
      ...(opts.paymentMethod ? { paymentMethod: opts.paymentMethod } : {}),
      ...(opts.paymentIntentId ? { pspPaymentId: opts.paymentIntentId } : {}),
    },
  });
  if (flipped.count === 0) return; // already processed (or cancelled)

  const order = await db.order.findUniqueOrThrow({ where: { id: orderId }, include: { items: true } });
  await db.orderEvent.create({ data: { orderId, status: "paid", note: opts.paymentMethod ? `Paid via ${opts.paymentMethod}` : "Paid" } });

  // Deduct beacon stock when it is tracked.
  const units = unitsOf(order.items);
  const stock = await db.counter.findUnique({ where: { name: STOCK_COUNTER } });
  if (stock) {
    await db.counter.update({ where: { name: STOCK_COUNTER }, data: { value: { decrement: units } } });
    await db.order.update({ where: { id: orderId }, data: { stockDeducted: true } });
  }

  const content = await getContent();
  const base = siteUrl();
  const vars = { units: beaconWord(units), shipTimes: content.shipping.times };
  await sendMail({
    to: order.email,
    replyTo: content.business.email || undefined,
    subject: `${order.number} — your Luggo beacons are on their way soon`,
    html: layout(
      "Thanks for your order!",
      p(`Hi ${esc(order.firstName)}, ${esc(fill(content.confirmation.text, vars))}`) +
        table(orderRows(order)) +
        p(`Shipping to: ${esc(order.firstName)} ${esc(order.lastName)}, ${esc(order.street)} ${esc(order.houseNo)}, ${esc(order.postcode)} ${esc(order.city)} (${order.country}).`) +
        p(`Order number: <strong>${order.number}</strong>. We’ll mail you again as soon as your parcel ships.`) +
        button(`${base}/track?number=${encodeURIComponent(order.number)}`, "Track your order"),
      `${esc(content.business.brand)} · ${esc(addressLine(content.business))} · KvK ${content.business.kvk} · VAT ${content.business.vat}`,
    ),
  });

  const notify = process.env.SHOP_NOTIFY_EMAIL;
  if (notify) {
    await sendMail({
      to: notify,
      subject: `New order ${order.number} — ${money(order.totalCents)} (${beaconWord(units)})`,
      html: layout(`New order ${order.number}`, table(orderRows(order)) + p(`${esc(order.firstName)} ${esc(order.lastName)}, ${esc(order.city)} (${order.country})`) + button(`${base}/admin/orders/${order.id}`, "Open in admin")),
    });
  }
}

/** Change status from the admin; emails the customer for customer-facing steps. */
export async function setOrderStatus(orderId: string, status: OrderStatus, note = "", extra: { carrier?: string; trackingCode?: string } = {}): Promise<void> {
  const before = await db.order.findUniqueOrThrow({ where: { id: orderId }, include: { items: true } });
  const order = await db.order.update({
    where: { id: orderId },
    data: {
      status,
      ...(extra.carrier !== undefined ? { carrier: extra.carrier } : {}),
      ...(extra.trackingCode !== undefined ? { trackingCode: extra.trackingCode } : {}),
      ...(status === "paid" && !before.paidAt ? { paidAt: new Date() } : {}),
      events: { create: { status, note } },
    },
    include: { items: true },
  });

  // Put beacons back on the shelf when an unshipped order is cancelled.
  if (status === "cancelled" && before.stockDeducted && !["shipped", "delivered"].includes(before.status)) {
    const stock = await db.counter.findUnique({ where: { name: STOCK_COUNTER } });
    if (stock) await db.counter.update({ where: { name: STOCK_COUNTER }, data: { value: { increment: unitsOf(order.items) } } });
    await db.order.update({ where: { id: orderId }, data: { stockDeducted: false } });
  }

  const content = await getContent();
  const base = siteUrl();
  const trackLink = button(`${base}/track?number=${encodeURIComponent(order.number)}`, "Track your order");
  const url = trackingUrl(order.carrier, order.trackingCode, order.postcode, order.country);
  const units = unitsOf(order.items);
  const appLinks = [content.app.iosUrl && `<a href="${content.app.iosUrl}" style="color:#c96a48">iPhone</a>`, content.app.androidUrl && `<a href="${content.app.androidUrl}" style="color:#c96a48">Android</a>`].filter(Boolean).join(" · ");

  const mail: Partial<Record<OrderStatus, { subject: string; title: string; body: string }>> = {
    shipped: {
      subject: `${order.number} — your beacons have shipped`,
      title: "On its way.",
      body:
        p(`Your ${beaconWord(units)} ${units === 1 ? "is" : "are"} with ${esc(carrierLabel(order.carrier) || "the carrier")}.${order.trackingCode ? ` Tracking code: <strong>${esc(order.trackingCode)}</strong>.` : ""}`) +
        (url ? button(url, `Follow it at ${esc(carrierLabel(order.carrier))}`) : "") +
        p(`While you wait: download the free Luggo app${appLinks ? ` (${appLinks})` : ""}, so you can pair the beacons the moment they arrive.`),
    },
    delivered: {
      subject: `${order.number} — delivered. Time to pair!`,
      title: "Your beacons have landed.",
      body:
        p("Pairing takes a few seconds per beacon:") +
        `<ol style="font-size:15px;line-height:1.6;color:#6e6559;margin:0 0 12px;padding-left:20px"><li>Open Luggo and tap <strong>Pair a new bag</strong>.</li><li>Hold the beacon against the back of your phone — it’s found automatically.</li><li>Name it, pick the bag type, and tuck it into a pocket or the lining.</li></ol>` +
        p(`At the belt, open Luggo and watch your bags come to you.${appLinks ? ` Get the app: ${appLinks}.` : ""}`),
    },
    cancelled: { subject: `${order.number} — cancelled`, title: "Order cancelled.", body: p("Your order has been cancelled. If you already paid, the refund is on its way back to the same account.") },
    refunded: { subject: `${order.number} — refunded`, title: "Refund sent.", body: p(`We’ve refunded ${money(order.totalCents)}. It usually shows up within a few working days.`) },
  };
  const m = mail[status];
  if (m) await sendMail({ to: order.email, replyTo: content.business.email || undefined, subject: m.subject, html: layout(m.title, m.body + (note ? p(`<em>${esc(note)}</em>`) : "") + (status === "delivered" ? "" : trackLink)) });
}

export function statusLabel(s: string): string {
  return (STATUS_LABEL as Record<string, string>)[s] ?? s;
}
