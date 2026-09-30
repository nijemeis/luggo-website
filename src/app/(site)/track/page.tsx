import type { Metadata } from "next";
import { db } from "@/lib/db";
import { getContent } from "@/lib/content";
import { normaliseOrderNumber, STATUS_LABEL, TIMELINE, type OrderStatus } from "@/lib/orders";
import { carrierLabel, trackingUrl } from "@/lib/shipping";

export const metadata: Metadata = { title: "Track your order" };

const fmt = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", timeZone: "Europe/Amsterdam" });

/** Order lookup by number + email. A plain GET form, so it works without JavaScript. */
export default async function TrackPage({ searchParams }: { searchParams: Promise<{ number?: string; email?: string }> }) {
  const [{ number: rawNumber = "", email: rawEmail = "" }, content] = await Promise.all([searchParams, getContent()]);
  const number = normaliseOrderNumber(rawNumber);
  const email = rawEmail.trim().toLowerCase();
  const searched = !!(rawNumber && rawEmail);
  const order = searched && number
    ? await db.order.findFirst({ where: { number, email, status: { not: "pending_payment" } }, include: { events: { where: { internal: false }, orderBy: { createdAt: "asc" } }, items: true } })
    : null;

  return (
    <main className="wrap page-pad" style={{ maxWidth: 760 }}>
      <div className="kicker">Orders</div>
      <h1 className="page-title">{content.track.title}</h1>
      <p className="lead" style={{ marginTop: 14 }}>{content.track.lead}</p>

      <form method="get" action="/track" className="panel-w" style={{ marginTop: 28, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 200px), 1fr))", gap: 14, alignItems: "end" }}>
        <label className="field"><span>Order number</span><input className="input" name="number" defaultValue={rawNumber} placeholder="LUG-1234" required autoComplete="off" /></label>
        <label className="field"><span>Email</span><input className="input" name="email" type="email" defaultValue={rawEmail} placeholder="you@example.com" required autoComplete="email" /></label>
        <button type="submit" className="btn btn-primary" style={{ padding: "14px 24px" }}>Find my order</button>
      </form>

      {searched && !order && (
        <div className="alert" role="alert" style={{ marginTop: 18 }}>
          We couldn’t find an order with that number and email address. Check both in your confirmation mail — orders show up here once payment is confirmed.
        </div>
      )}

      {order && <Timeline order={order} help={content.track.help} />}
    </main>
  );
}

type TrackedOrder = NonNullable<Awaited<ReturnType<typeof db.order.findFirst<{ include: { events: true; items: true } }>>>>;

function Timeline({ order, help }: { order: TrackedOrder; help: string }) {
  const status = order.status as OrderStatus;
  const closed = status === "cancelled" || status === "refunded";
  const idx = TIMELINE.indexOf(status);
  const at = (s: OrderStatus) => [...order.events].reverse().find((e) => e.status === s)?.createdAt;
  const link = trackingUrl(order.carrier, order.trackingCode, order.postcode, order.country);
  const units = order.items.reduce((s, i) => s + i.units * i.qty, 0);
  const notes: Partial<Record<OrderStatus, string>> = {
    paid: "Payment received",
    packed: "Your beacons are packed and ready to go",
    shipped: order.trackingCode ? `${carrierLabel(order.carrier)} · ${order.trackingCode}` : "Tracking code arrives by email",
    delivered: "Time to pair them in the app",
  };

  return (
    <div className="panel-w" style={{ marginTop: 18 }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 14, flexWrap: "wrap", alignItems: "flex-start" }}>
        <div>
          <div className="info-label">Order</div>
          <div style={{ font: "700 24px var(--font-head)", marginTop: 6 }}>{order.number}</div>
          <div style={{ font: "500 14px var(--font-body)", color: "var(--body)", marginTop: 4 }}>{units} Luggo beacon{units === 1 ? "" : "s"}</div>
        </div>
        <span className="tag" style={{ fontSize: 13, padding: "7px 12px" }}>{STATUS_LABEL[status]}</span>
      </div>
      <div className="divider" style={{ margin: "22px 0" }} />
      {closed ? (
        <p style={{ font: "500 15.5px/1.6 var(--font-body)", color: "var(--body)" }}>
          {status === "cancelled" ? "This order was cancelled. If you already paid, the refund is on its way back to the same account." : "This order has been refunded. It usually shows up within a few working days."}
        </p>
      ) : (
        <ol className="timeline" style={{ listStyle: "none", padding: 0, margin: 0 }}>
          {TIMELINE.map((key, i) => {
            const state = i < idx || key === "delivered" && i === idx ? "done" : i === idx ? "now" : "todo";
            const when = at(key);
            const last = i === TIMELINE.length - 1;
            return (
              <li key={key} className="tl-step" aria-current={state === "now" ? "step" : undefined}>
                <div className="tl-rail">
                  <span className="tl-dot" style={{ background: state === "todo" ? "var(--page)" : state === "now" ? "var(--coral)" : "var(--success)", border: state === "todo" ? "2px solid var(--border)" : "none" }}>
                    {state !== "todo" && <svg width="11" height="9" viewBox="0 0 11 9" aria-hidden="true"><path d="M1 4.5 4 7.5 10 1.5" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>}
                  </span>
                  {!last && <span className="tl-line" style={{ background: i < idx ? "var(--success)" : "var(--border)" }} />}
                </div>
                <div className="tl-body">
                  <div className="tl-label" style={{ color: state === "todo" ? "var(--muted)" : "var(--ink)" }}>{STATUS_LABEL[key]}</div>
                  <div className="tl-note">
                    {state === "todo" ? "" : `${when ? `${fmt.format(when)} · ` : ""}${notes[key] ?? ""}`}
                    {key === "shipped" && state !== "todo" && link && <> · <a href={link} target="_blank" rel="noreferrer">Follow your parcel</a></>}
                  </div>
                </div>
              </li>
            );
          })}
        </ol>
      )}
      <p style={{ font: "500 14px/1.5 var(--font-body)", color: "var(--body)", marginTop: 6 }}>{help}</p>
    </div>
  );
}
