import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { getContent, fill } from "@/lib/content";
import { money } from "@/lib/money";
import { beaconWord } from "@/lib/orders";
import { stripe, stripeEnabled } from "@/lib/stripe";
import { markOrderPaid } from "@/lib/order-service";
import { ClearCart } from "@/components/cart/ClearCart";
import { AutoRefresh } from "@/components/checkout/AutoRefresh";

export const metadata: Metadata = { title: "Your order", robots: { index: false } };

/**
 * Stripe's return URL. Shows pending / paid / failed. Deliberately shows no address or
 * email: anyone can type an order number here.
 */
export default async function OrderPage({ params, searchParams }: { params: Promise<{ number: string }>; searchParams: Promise<{ session_id?: string }> }) {
  const [{ number }, { session_id }] = await Promise.all([params, searchParams]);
  let order = await db.order.findUnique({ where: { number: number.toUpperCase() }, include: { items: true } });
  if (!order) notFound();

  // If the webhook hasn't landed yet, verify the session directly (markOrderPaid is idempotent).
  if (order.status === "pending_payment" && session_id && stripeEnabled() && order.stripeSessionId === session_id) {
    try {
      const session = await stripe().checkout.sessions.retrieve(session_id, { expand: ["payment_intent"] });
      if (session.payment_status === "paid") {
        const pi = typeof session.payment_intent === "object" ? session.payment_intent : null;
        await markOrderPaid(order.id, { paymentIntentId: pi?.id, paymentMethod: pi?.payment_method_types?.[0] });
        order = (await db.order.findUnique({ where: { id: order.id }, include: { items: true } }))!;
      }
    } catch {}
  }

  const content = await getContent();
  const units = order.items.reduce((s, i) => s + i.units * i.qty, 0);
  const state = order.status === "pending_payment" ? "pending" : order.status === "cancelled" && !order.paidAt ? "failed" : "paid";

  return (
    <main className="wrap page-pad" style={{ maxWidth: 640, textAlign: "center" }}>
      {state === "paid" && <ClearCart />}
      {state === "pending" && <AutoRefresh seconds={3} times={10} />}
      <div className="panel-w" style={{ padding: "44px 28px 36px", animation: "fadeUp .4s ease" }}>
        {state === "paid" ? (
          <div className="check-circle"><i /></div>
        ) : (
          <div className="check-circle" style={{ background: state === "failed" ? "var(--tint)" : "var(--sand)" }}>
            <span style={{ font: "700 34px var(--font-head)", color: state === "failed" ? "var(--danger)" : "var(--muted)" }}>{state === "failed" ? "!" : "…"}</span>
          </div>
        )}
        <h1 style={{ font: "700 clamp(26px, 3.4vw, 32px) var(--font-head)", marginTop: 8 }}>
          {state === "paid" ? content.confirmation.title : state === "pending" ? "Waiting for your payment" : "Payment didn’t go through"}
        </h1>
        <p style={{ font: "500 15.5px/1.55 var(--font-body)", color: "var(--body)", margin: "10px auto 0", maxWidth: 400, textWrap: "pretty" }}>
          {state === "paid"
            ? fill(content.confirmation.text, { units: beaconWord(units), shipTimes: content.shipping.times })
            : state === "pending"
              ? "We haven’t had the confirmation from the payment provider yet. This page updates by itself — it usually takes a few seconds."
              : "Nothing has been charged. You can try again — your cart is still there."}
        </p>
        <div style={{ display: "flex", justifyContent: "center", gap: 28, flexWrap: "wrap", marginTop: 26, paddingTop: 22, borderTop: "1px solid var(--border)" }}>
          <div><div className="info-label">Order</div><div style={{ font: "700 18px var(--font-head)", marginTop: 6 }}>{order.number}</div></div>
          <div><div className="info-label">Beacons</div><div style={{ font: "700 18px var(--font-head)", marginTop: 6 }}>{units}</div></div>
          <div><div className="info-label">{state === "paid" ? "Paid" : "Total"}</div><div style={{ font: "700 18px var(--font-head)", marginTop: 6 }}>{money(order.totalCents)}</div></div>
        </div>
        <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap", marginTop: 26 }}>
          {state === "failed" ? (
            <Link href="/checkout" className="btn btn-primary">Try again</Link>
          ) : (
            <>
              <Link href={`/track?number=${order.number}`} className="btn btn-secondary" style={{ padding: "13px 26px", fontSize: 15 }}>Track order</Link>
              <Link href="/" className="btn btn-primary" style={{ padding: "13px 30px", fontSize: 15 }}>Done</Link>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
