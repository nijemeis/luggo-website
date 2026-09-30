"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { isOrderStatus, NEXT_STATUS, type OrderStatus } from "@/lib/orders";
import { markOrderPaid, setOrderStatus } from "@/lib/order-service";
import { CARRIERS } from "@/lib/shipping";
import { stripe, stripeEnabled } from "@/lib/stripe";
import type { ActionState } from "./catalog";

function str(form: FormData, key: string): string {
  return String(form.get(key) ?? "").trim();
}

/** Save carrier + tracking code without changing status. */
export async function updateShipping(orderId: string, _prev: ActionState, form: FormData): Promise<ActionState> {
  await requireAdmin();
  const carrier = str(form, "carrier");
  if (carrier && !CARRIERS.some((c) => c.key === carrier)) return { error: "Unknown carrier" };
  await db.order.update({ where: { id: orderId }, data: { carrier, trackingCode: str(form, "trackingCode") } });
  revalidatePath("/admin", "layout");
  return { ok: "Shipping details saved" };
}

/** Status change; emails the customer for shipped / delivered / cancelled / refunded. */
export async function changeOrderStatus(orderId: string, _prev: ActionState, form: FormData): Promise<ActionState> {
  await requireAdmin();
  const status = str(form, "status");
  if (!isOrderStatus(status)) return { error: "Unknown status" };
  const order = await db.order.findUnique({ where: { id: orderId } });
  if (!order) return { error: "Order not found" };
  if (!NEXT_STATUS[order.status as OrderStatus]?.includes(status)) return { error: `Can't go from ${order.status} to ${status}` };

  const carrier = form.has("carrier") ? str(form, "carrier") : undefined;
  const trackingCode = form.has("trackingCode") ? str(form, "trackingCode") : undefined;
  if (status === "shipped" && !(trackingCode ?? order.trackingCode)) return { error: "Add a tracking code before marking the order as shipped" };

  if (status === "refunded" && form.get("stripeRefund") === "on") {
    if (!order.pspPaymentId || !stripeEnabled()) return { error: "No Stripe payment to refund — untick the refund box to only change the status" };
    try {
      await stripe().refunds.create({ payment_intent: order.pspPaymentId });
    } catch (e) {
      return { error: `Stripe refund failed: ${e instanceof Error ? e.message : e}` };
    }
  }

  // Manually confirming a payment runs the same path as the webhook (email + stock).
  if (status === "paid" && order.status === "pending_payment") {
    await markOrderPaid(orderId, { paymentMethod: "manual" });
  } else {
    await setOrderStatus(orderId, status, str(form, "note"), { carrier, trackingCode });
  }
  revalidatePath("/admin", "layout");
  const emailed = ["paid", "shipped", "delivered", "cancelled", "refunded"].includes(status);
  return { ok: `Status set to ${status.replace(/_/g, " ")}${emailed ? " — customer emailed" : ""}` };
}

export async function addOrderNote(orderId: string, _prev: ActionState, form: FormData): Promise<ActionState> {
  await requireAdmin();
  const note = str(form, "note");
  if (!note) return { error: "Write a note first" };
  const order = await db.order.findUnique({ where: { id: orderId } });
  if (!order) return { error: "Order not found" };
  await db.orderEvent.create({ data: { orderId, status: order.status, note, internal: true } });
  revalidatePath("/admin", "layout");
  return { ok: "Note added" };
}
