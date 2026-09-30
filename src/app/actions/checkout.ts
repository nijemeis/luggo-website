"use server";

import { z } from "zod";
import { db } from "@/lib/db";
import { getContent } from "@/lib/content";
import { getZones, zoneForCountry, shippingFor, POSTCODE_PATTERNS, COUNTRIES } from "@/lib/shipping";
import { getStock } from "@/lib/catalog";
import { nextOrderNumber } from "@/lib/orders";
import { stripe, stripeEnabled, siteUrl } from "@/lib/stripe";
import { vatIncluded } from "@/lib/money";
import { imgSrc } from "@/lib/image-urls";
import { markOrderPaid } from "@/lib/order-service";

const LineSchema = z.object({
  productId: z.string().min(1),
  qty: z.number().int().min(1).max(9),
});

const CheckoutSchema = z.object({
  email: z.string().trim().email("Enter a valid email address"),
  phone: z.string().trim().max(30).regex(/^[+\d\s()-]*$/, "Use digits, spaces and + only").default(""),
  firstName: z.string().trim().min(1, "Required").max(80),
  lastName: z.string().trim().min(1, "Required").max(80),
  street: z.string().trim().min(1, "Required").max(120),
  houseNo: z.string().trim().min(1, "Required").max(20),
  postcode: z.string().trim().min(2, "Required").max(16),
  city: z.string().trim().min(1, "Required").max(80),
  country: z.string().length(2),
  lines: z.array(LineSchema).min(1).max(10),
});

export type CheckoutResult = { ok: true; redirectUrl: string } | { ok: false; error: string; fieldErrors?: Record<string, string> };

export async function createCheckout(raw: unknown): Promise<CheckoutResult> {
  const parsed = CheckoutSchema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) fieldErrors[String(issue.path[0])] ??= issue.message;
    return { ok: false, error: "Please check the highlighted fields.", fieldErrors };
  }
  const input = parsed.data;
  if (!COUNTRIES.some((c) => c.code === input.country)) return { ok: false, error: "We don't ship to that country yet.", fieldErrors: { country: "Not available" } };
  const pc = POSTCODE_PATTERNS[input.country];
  if (pc && !pc.test(input.postcode)) return { ok: false, error: "Please check the postcode.", fieldErrors: { postcode: "That doesn't look like a valid postcode" } };

  const [content, zones, stock] = await Promise.all([getContent(), getZones(), getStock()]);
  const zone = zoneForCountry(zones, input.country);
  if (!zone) return { ok: false, error: "No shipping is configured for that country yet." };

  // Re-price every line from the database — never trust client prices.
  const products = await db.product.findMany({
    where: { id: { in: input.lines.map((l) => l.productId) }, active: true },
    include: { images: { orderBy: { sort: "asc" }, take: 1 } },
  });
  const items = [];
  for (const l of input.lines) {
    const p = products.find((x) => x.id === l.productId);
    if (!p) return { ok: false, error: "One of the packs in your cart is no longer available. Please review your cart." };
    items.push({ productId: p.id, name: p.name, units: p.units, qty: l.qty, unitPriceCents: p.priceCents, imageKey: p.images[0]?.key ?? "" });
  }
  const units = items.reduce((s, i) => s + i.units * i.qty, 0);
  if (stock != null && units > stock) {
    return { ok: false, error: stock > 0 ? `We have ${stock} beacon${stock === 1 ? "" : "s"} left right now. Please lower the quantity.` : "Beacons are sold out for now. Please try again soon." };
  }

  const subtotalCents = items.reduce((s, i) => s + i.unitPriceCents * i.qty, 0);
  const shippingCents = shippingFor(zone, subtotalCents);
  const totalCents = subtotalCents + shippingCents;
  const number = await nextOrderNumber();

  const order = await db.order.create({
    data: {
      number,
      status: "pending_payment",
      email: input.email.toLowerCase(),
      phone: input.phone,
      firstName: input.firstName,
      lastName: input.lastName,
      street: input.street,
      houseNo: input.houseNo,
      postcode: input.postcode.toUpperCase(),
      city: input.city,
      country: input.country,
      zoneKey: zone.key,
      zoneName: zone.name,
      subtotalCents,
      shippingCents,
      totalCents,
      vatCents: vatIncluded(totalCents, content.business.vatRate),
      items: { create: items.map(({ imageKey: _img, ...i }) => i) },
      events: { create: { status: "pending_payment", note: "Order created, awaiting payment", internal: true } },
    },
  });

  if (!stripeEnabled()) {
    // Mock payment for local development: mark paid immediately.
    if (process.env.NODE_ENV === "production" && process.env.ALLOW_MOCK_PAYMENTS !== "true") {
      return { ok: false, error: "Payments are not configured yet. Please try again later." };
    }
    await markOrderPaid(order.id, { paymentMethod: "mock" });
    return { ok: true, redirectUrl: `/order/${order.number}?mock=1` };
  }

  const base = siteUrl();
  const session = await stripe().checkout.sessions.create({
    mode: "payment",
    // Same Checkout Studio parameters as nije3d.
    ui_mode: "hosted_page",
    billing_address_collection: "auto",
    phone_number_collection: { enabled: false },
    automatic_tax: { enabled: false },
    allow_promotion_codes: false,
    submit_type: "auto",
    integration_identifier: "hosted_web_0001",
    origin_context: "web",
    customer_email: order.email,
    client_reference_id: order.id,
    metadata: { orderId: order.id, orderNumber: order.number, shop: "luggo" },
    payment_intent_data: { metadata: { orderId: order.id, orderNumber: order.number, shop: "luggo" } },
    line_items: [
      ...items.map((i) => ({
        quantity: i.qty,
        price_data: {
          currency: "eur",
          unit_amount: i.unitPriceCents,
          product_data: {
            name: `Luggo ${i.name}`,
            description: `${i.units} beacon${i.units === 1 ? "" : "s"}`,
            images: i.imageKey && base.startsWith("https") ? [`${base}${imgSrc(i.imageKey, 900)}`] : undefined,
          },
        },
      })),
      ...(shippingCents > 0 ? [{ quantity: 1, price_data: { currency: "eur", unit_amount: shippingCents, product_data: { name: `Shipping — ${zone.name}` } } }] : []),
    ],
    success_url: `${base}/order/${order.number}?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${base}/checkout?cancelled=1`,
    locale: "auto",
    expires_at: Math.floor(Date.now() / 1000) + 60 * 60,
  });
  await db.order.update({ where: { id: order.id }, data: { stripeSessionId: session.id } });
  if (!session.url) return { ok: false, error: "The payment page could not be opened. Please try again." };
  return { ok: true, redirectUrl: session.url };
}
