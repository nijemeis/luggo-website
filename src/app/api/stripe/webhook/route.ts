import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { db } from "@/lib/db";
import { stripe, stripeEnabled } from "@/lib/stripe";
import { markOrderPaid, setOrderStatus } from "@/lib/order-service";

/** The Stripe account may be shared with nije3d: only act on events for Luggo orders. */
function isLuggo(meta: Stripe.Metadata | null | undefined): meta is Stripe.Metadata & { orderId: string } {
  return meta?.shop === "luggo" && !!meta.orderId;
}

/**
 * Stripe webhook — the source of truth for payment state. Every handler is idempotent:
 * Stripe retries deliveries, and markOrderPaid only acts on a pending order.
 * Endpoint: <site>/api/stripe/webhook with events checkout.session.completed,
 * checkout.session.async_payment_succeeded, checkout.session.expired,
 * payment_intent.payment_failed, charge.refunded.
 */
export async function POST(req: Request) {
  if (!stripeEnabled() || !process.env.STRIPE_WEBHOOK_SECRET) return NextResponse.json({ error: "Stripe not configured" }, { status: 503 });
  const sig = req.headers.get("stripe-signature");
  const body = await req.text();
  let event: Stripe.Event;
  try {
    event = stripe().webhooks.constructEvent(body, sig ?? "", process.env.STRIPE_WEBHOOK_SECRET);
  } catch (e) {
    return NextResponse.json({ error: `Invalid signature: ${e instanceof Error ? e.message : e}` }, { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed":
    case "checkout.session.async_payment_succeeded": {
      const session = event.data.object;
      if (session.payment_status !== "paid" || !isLuggo(session.metadata)) break;
      const piId = typeof session.payment_intent === "string" ? session.payment_intent : session.payment_intent?.id;
      let method: string | undefined;
      if (piId) {
        try {
          const pi = await stripe().paymentIntents.retrieve(piId, { expand: ["latest_charge"] });
          const charge = pi.latest_charge && typeof pi.latest_charge === "object" ? pi.latest_charge : null;
          method = charge?.payment_method_details?.type ?? pi.payment_method_types?.[0];
        } catch {}
      }
      await markOrderPaid(session.metadata!.orderId, { paymentIntentId: piId, paymentMethod: method });
      break;
    }
    case "checkout.session.expired": {
      const session = event.data.object;
      if (isLuggo(session.metadata)) {
        await db.order.updateMany({ where: { id: session.metadata!.orderId, status: "pending_payment" }, data: { status: "cancelled" } });
        await db.orderEvent.create({ data: { orderId: session.metadata!.orderId, status: "cancelled", note: "Checkout expired without payment", internal: true } }).catch(() => {});
      }
      break;
    }
    case "payment_intent.payment_failed": {
      const pi = event.data.object;
      if (isLuggo(pi.metadata)) {
        await db.orderEvent.create({ data: { orderId: pi.metadata.orderId, status: "pending_payment", note: `Payment failed: ${pi.last_payment_error?.message ?? "unknown"}`, internal: true } }).catch(() => {});
      }
      break;
    }
    case "charge.refunded": {
      const charge = event.data.object;
      const piId = typeof charge.payment_intent === "string" ? charge.payment_intent : charge.payment_intent?.id;
      if (piId && charge.refunded) {
        const order = await db.order.findUnique({ where: { pspPaymentId: piId } });
        if (order && order.status !== "refunded") await setOrderStatus(order.id, "refunded", "Refund confirmed by Stripe");
      }
      break;
    }
  }
  return NextResponse.json({ received: true });
}
