/**
 * Seeds the Luggo shop.
 *   tsx prisma/seed.ts          packs, zones, FAQ, pages, counters (created only if missing)
 *   tsx prisma/seed.ts --base   the same; production runs this on every start
 *   tsx prisma/seed.ts --demo   also adds a few demo orders (local databases only)
 *
 * Nothing here ever overwrites a row that exists, so edits made in /admin survive deploys.
 */
import { PrismaClient } from "@prisma/client";
import { withSchema } from "../src/lib/db-url";

const db = new PrismaClient({ datasourceUrl: withSchema(process.env.DATABASE_URL) });
const args = process.argv.slice(2);

const PACKS = [
  { slug: "single", name: "Single", units: 1, priceCents: 2900, note: "1 beacon", badge: "", isDefault: false, sort: 0 },
  { slug: "family-3-pack", name: "Family 3-pack", units: 3, priceCents: 7500, note: "3 beacons · save 14%", badge: "Most popular", isDefault: true, sort: 1 },
  { slug: "traveler-5-pack", name: "Traveler 5-pack", units: 5, priceCents: 11900, note: "5 beacons · save 18%", badge: "", isDefault: false, sort: 2 },
];

// Placeholder rates until the owner confirms carriers and prices (see README).
const ZONES = [
  { key: "NL", name: "Netherlands", countries: "NL", rateCents: 495, transit: "1–2 working days", sort: 0 },
  { key: "BE", name: "Belgium", countries: "BE", rateCents: 695, transit: "2–3 working days", sort: 1 },
  { key: "EU", name: "Rest of the EU", countries: "", rateCents: 995, transit: "3–6 working days", sort: 2 },
];

const FAQ = [
  ["Do I need an account?", "No. Luggo works without sign-up — your bags are stored on your phone. Download the app, pair a beacon and go."],
  ["Can Luggo show where my bag is?", "No, and that’s on purpose. Beacons tell your phone how close a bag is — Far, Medium or Near — and when it was last in range. They never share a location."],
  ["How long does the battery last?", "Around 3 years of typical use, and up to 5. The app warns you when a beacon runs low, so you can swap the battery before your next trip."],
  ["What’s the range?", "Luggo uses Bluetooth, so it comes alive when your bag is in the same hall as you — exactly where you need it: at the belt."],
  ["Does it work with any bag?", "Yes. The beacon is slim enough for a pocket, a lining or a tag sleeve. In the app you pick the type — cabin, suitcase, duffel, backpack or handbag."],
  ["How do I pair a beacon?", "Open Luggo, tap “Pair a new bag” and hold the beacon against the back of your phone. It’s found automatically."],
];

const PRIVACY = {
  slug: "privacy",
  kicker: "Legal",
  title: "Privacy statement",
  intro: "Luggo is built to know as little about you as possible. Here’s exactly what we do and don’t collect.",
  updatedOn: "30 September 2026",
  sections: [
    { heading: "1. Who we are", body: "Luggo is a product of The RO Brand, Fokkerstraat 12, 3833 LD Leusden, The Netherlands (KvK 58083111, VAT NL852865867B01). We are the controller for the personal data described in this statement, and we process it in line with the EU General Data Protection Regulation (GDPR)." },
    { heading: "2. The app: no account, no location", body: "You don’t need an account to use Luggo. The bags you pair — their names, types and beacon IDs — are stored only on your phone. Beacons tell your phone how close a bag is (Far, Medium, Near) and when it was last in range. Luggo does not determine, store or share the location of your bags or of you.\n\nThe app asks for Bluetooth permission to detect your beacons, and for notification permission to send in-range alerts. You can turn both off at any time in your phone’s settings or in the app." },
    { heading: "3. Orders from our shop", body: "When you order beacons, we process your name, delivery address, email address, phone number (if provided), order details and payment status. We use this to deliver your order, send order updates and handle returns or support questions. The legal basis is the performance of our contract with you. Payment details are handled by our payment provider; we never see or store your full card details." },
    { heading: "4. Who we share data with", body: "Only with the parties we need to fulfil your order: our payment provider, our shipping partner and our hosting provider. They process data on our behalf under a data processing agreement. We never sell your data or use it for advertising." },
    { heading: "5. How long we keep it", body: "Order data is kept for as long as needed to deliver and support your order, and for seven years afterwards where Dutch tax law requires us to keep financial records. Data in the app stays on your phone until you delete a bag or remove the app." },
    { heading: "6. Website & cookies", body: "This website only uses cookies that are needed for it to work, such as keeping your cart. We don’t use tracking or advertising cookies." },
    { heading: "7. Your rights", body: "You have the right to access, correct or delete your personal data, to restrict or object to its processing, and to receive it in a portable format. Contact us to exercise any of these rights — we’ll respond within one month. If you’re unhappy with how we handle your data, you can file a complaint with the Dutch Data Protection Authority (Autoriteit Persoonsgegevens)." },
    { heading: "8. Changes & contact", body: "We may update this statement when our product or the law changes; the date at the top shows the latest version. Questions about privacy? Contact The RO Brand at Fokkerstraat 12, 3833 LD Leusden, The Netherlands, or call +31 6 45438943." },
  ],
};

// Draft copy, not legally reviewed — edit under Admin → Pages before launch.
const SHIPPING = {
  slug: "shipping",
  kicker: "Help",
  title: "Shipping & returns",
  intro: "Beacons ship from Leusden, in a small parcel that fits through most letterboxes.",
  updatedOn: "30 September 2026",
  sections: [
    { heading: "Where we ship", body: "We ship to the Netherlands, Belgium and the rest of the European Union. The shipping cost for your country is shown at checkout before you pay." },
    { heading: "How long it takes", body: "Orders placed on a working day before 15:00 usually leave the same day. Delivery takes 1–2 working days in the Netherlands, 2–3 in Belgium and 3–6 elsewhere in the EU. You get a tracking link by email as soon as your parcel ships." },
    { heading: "Returns", body: "Changed your mind? You can return unused beacons within 14 days of delivery, no reason needed. Let us know first by replying to your order confirmation, then send the beacons back in their original packaging. We refund the purchase price and the original shipping cost within 14 days of receiving them; the cost of sending them back is yours." },
    { heading: "Faulty beacon?", body: "If a beacon doesn’t work, contact us and we’ll send a replacement. Beacons come with the statutory warranty under Dutch and EU law." },
  ],
};

async function base() {
  for (const p of PACKS) {
    await db.product.upsert({ where: { slug: p.slug }, create: p, update: {} });
  }
  if ((await db.shippingZone.count()) === 0) {
    for (const z of ZONES) await db.shippingZone.create({ data: z });
  }
  if ((await db.faqItem.count()) === 0) {
    for (const [i, [question, answer]] of FAQ.entries()) await db.faqItem.create({ data: { question, answer, sort: i } });
  }
  for (const pg of [PRIVACY, SHIPPING]) {
    await db.page.upsert({ where: { slug: pg.slug }, create: { ...pg, sections: JSON.stringify(pg.sections) }, update: {} });
  }
  await db.counter.upsert({ where: { name: "order" }, create: { name: "order", value: 1000 }, update: {} });
}

function isLocal(url: string | undefined): boolean {
  return !!url && /@(localhost|127\.0\.0\.1)[:/]/.test(url);
}

async function demo() {
  if (!isLocal(process.env.DATABASE_URL)) {
    console.log("Skipping demo orders: DATABASE_URL is not a local database.");
    return;
  }
  if ((await db.order.count()) > 0) return;
  const packs = await db.product.findMany();
  const bySlug = (s: string) => packs.find((p) => p.slug === s)!;
  const people = [
    { firstName: "Sanne", lastName: "de Vries", email: "sanne@example.com", street: "Hamersveldseweg", houseNo: "14b", postcode: "3833 GN", city: "Leusden", country: "NL", status: "paid", pack: "family-3-pack", qty: 1 },
    { firstName: "Jonas", lastName: "Peeters", email: "jonas@example.com", street: "Meir", houseNo: "21", postcode: "2000", city: "Antwerpen", country: "BE", status: "shipped", pack: "single", qty: 2 },
    { firstName: "Mila", lastName: "Jansen", email: "mila@example.com", street: "Oudegracht", houseNo: "88", postcode: "3511 AV", city: "Utrecht", country: "NL", status: "delivered", pack: "traveler-5-pack", qty: 1 },
  ];
  const zones = await db.shippingZone.findMany();
  for (const person of people) {
    const { status, pack, qty, ...rest } = person;
    const product = bySlug(pack);
    const zone = zones.find((z) => z.countries.split(",").includes(rest.country)) ?? zones.find((z) => !z.countries)!;
    const subtotal = product.priceCents * qty;
    const total = subtotal + zone.rateCents;
    const c = await db.counter.update({ where: { name: "order" }, data: { value: { increment: 1 } } });
    const flow = ["pending_payment", "paid", "packed", "shipped", "delivered"];
    await db.order.create({
      data: {
        ...rest,
        number: `LUG-${c.value}`,
        status,
        zoneKey: zone.key,
        zoneName: zone.name,
        paymentMethod: "ideal (demo)",
        subtotalCents: subtotal,
        shippingCents: zone.rateCents,
        totalCents: total,
        vatCents: Math.round(total - total / 1.21),
        carrier: ["shipped", "delivered"].includes(status) ? "postnl" : "",
        trackingCode: ["shipped", "delivered"].includes(status) ? "3SLUGG0123456" : "",
        paidAt: new Date(),
        items: { create: { productId: product.id, name: product.name, units: product.units, qty, unitPriceCents: product.priceCents } },
        events: { create: flow.slice(0, flow.indexOf(status) + 1).map((s) => ({ status: s, note: s === "pending_payment" ? "Demo order" : "" })) },
      },
    });
  }
  console.log("Added 3 demo orders.");
}

async function main() {
  await base();
  if (args.includes("--demo")) await demo();
  console.log("Seed done.");
}

main().finally(() => db.$disconnect());
