import { cache } from "react";
import { db } from "./db";

/**
 * Site content managed from /admin/content. Stored as one JSON document in the
 * Setting table (key "content"); the defaults below are merged in, so a fresh
 * database renders the full design immediately. Packs, FAQ items and the legal
 * pages have their own tables.
 */

export type Step = { title: string; text: string };
export type Spec = { title: string; text: string };
export type ZoneCopy = { title: string; copy: string };
export type Social = { label: string; url: string };

export type SiteContent = {
  announcement: { text: string; link: string };
  seo: { title: string; description: string; ogImageKey: string };
  hero: { pill: string; headline: string; lead: string; primaryCta: string; secondaryCta: string; small: string };
  how: { kicker: string; title: string; steps: Step[] };
  zones: { kicker: string; title: string; lead: string; far: ZoneCopy; med: ZoneCopy; near: ZoneCopy; here: ZoneCopy };
  beacon: { kicker: string; title: string; lead: string; imageKey: string; imageAlt: string; caption: string; specs: Spec[]; cta: string };
  shop: { kicker: string; title: string; lead: string; note: string; soldOut: string };
  app: { title: string; text: string; iosUrl: string; androidUrl: string };
  faq: { kicker: string; title: string };
  contact: { kicker: string; title: string; lead: string };
  business: {
    brand: string;
    company: string;
    street: string;
    postcode: string;
    city: string;
    country: string;
    phone: string;
    email: string;
    kvk: string;
    vat: string;
    vatRate: number;
  };
  shipping: { times: string };
  footer: { tagline: string; paymentLine: string; newsletter: boolean; newsletterHead: string; newsletterText: string; socials: Social[] };
  confirmation: { title: string; text: string };
  track: { title: string; lead: string; help: string };
};

export const DEFAULT_CONTENT: SiteContent = {
  announcement: { text: "", link: "" },
  seo: {
    title: "Luggo — see your bags come to you",
    description: "Slip a Luggo beacon into your bag. At the belt, your phone shows it moving closer — Far, Medium, Near — so you step up at exactly the right moment.",
    ogImageKey: "",
  },
  hero: {
    pill: "Bluetooth beacons for your luggage",
    headline: "See your bags come to you.",
    lead: "Slip a Luggo beacon into your bag. At the belt, your phone shows it moving closer — Far, Medium, Near — so you step up at exactly the right moment.",
    primaryCta: "Get beacons · from {fromPrice}",
    secondaryCta: "See how it works",
    small: "Free app for iOS & Android · No account needed",
  },
  how: {
    kicker: "How it works",
    title: "From your pocket to the belt in three steps.",
    steps: [
      { title: "Pair in seconds", text: "Hold a Luggo beacon against the back of your phone. The app finds it automatically — name it, pick the bag type, done." },
      { title: "Tuck it in your bag", text: "Slim enough for any pocket, lining or tag sleeve. Check the bag as usual — the beacon quietly rides along." },
      { title: "Watch it come to you", text: "At the belt, open Luggo. Each bag moves closer on screen, and you get a nudge the moment it’s in range." },
    ],
  },
  zones: {
    kicker: "Try it",
    title: "Four zones. Zero guessing.",
    lead: "As a beacon’s signal gets stronger, Luggo moves the bag from Far to Medium to Near. Drag the slider to bring the suitcase in.",
    far: { title: "On its way", copy: "{bag} is in the terminal and heading toward you." },
    med: { title: "Getting closer", copy: "{bag} is on the belt now, coming your way." },
    near: { title: "Almost yours", copy: "{bag} is just a few steps away — get ready." },
    here: { title: "Here it is", copy: "{bag} reached you. Grab it and go!" },
  },
  beacon: {
    kicker: "The beacon",
    title: "Small enough to forget. Smart enough not to.",
    lead: "A slim Bluetooth tag that tells your phone how close each bag is. Nothing to charge before a trip, nothing to set up at the airport.",
    imageKey: "",
    imageAlt: "The Luggo beacon",
    caption: "Luggo beacon",
    specs: [
      { title: "3-year battery", text: "Up to 5 years. The app lets you know well before it’s time to replace it." },
      { title: "Fits any bag", text: "Cabin, suitcase, duffel, backpack or handbag." },
      { title: "Pairs automatically", text: "Hold it to your phone. No codes, no sign-up." },
      { title: "Private by design", text: "Luggo knows when a bag is near you — never where it is." },
    ],
    cta: "Choose a pack →",
  },
  shop: {
    kicker: "Shop",
    title: "Get beacons",
    lead: "One for the carry-on, or one for every bag in the family.",
    note: "Arrives in {shipTimes}. Pair them in the app when they land.",
    soldOut: "Sold out for now — back soon.",
  },
  app: {
    title: "The app is free. No account, ever.",
    text: "Luggo runs on iOS and Android. Your bags live on your phone — pair a beacon and you’re ready to fly.",
    iosUrl: "",
    androidUrl: "",
  },
  faq: { kicker: "FAQ", title: "Questions, answered." },
  contact: {
    kicker: "Contact",
    title: "Get in touch.",
    lead: "Questions about an order, a beacon or the app? Give us a call or drop us a line.",
  },
  business: {
    brand: "Luggo by The RO Brand",
    company: "The RO Brand",
    street: "Fokkerstraat 12",
    postcode: "3833 LD",
    city: "Leusden",
    country: "The Netherlands",
    phone: "+31 6 45438943",
    email: "",
    kvk: "58083111",
    vat: "NL852865867B01",
    vatRate: 21,
  },
  shipping: { times: "2–4 days" },
  footer: {
    tagline: "See your bags come to you",
    paymentLine: "iDEAL · Bancontact · Card · PayPal",
    newsletter: false,
    newsletterHead: "News from Luggo",
    newsletterText: "An occasional mail when there’s something new. Unsubscribe any time.",
    socials: [],
  },
  confirmation: {
    title: "Order placed",
    text: "{units} on the way — arrives in {shipTimes}. Download the app so you’re ready to pair.",
  },
  track: {
    title: "Track your order",
    lead: "Enter the order number from your confirmation mail — it looks like LUG-1234 — and the email address you ordered with.",
    help: "Something off? Reply to your confirmation mail and we’ll help you out.",
  },
};

function isObject(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

/** Deep-merge stored content over the defaults (arrays replace, objects merge). */
export function mergeContent<T>(base: T, over: unknown): T {
  if (!isObject(over) || !isObject(base)) return over === undefined ? base : (over as T);
  const out: Record<string, unknown> = { ...(base as Record<string, unknown>) };
  for (const [k, v] of Object.entries(over)) {
    const b = (base as Record<string, unknown>)[k];
    out[k] = isObject(b) && isObject(v) ? mergeContent(b, v) : v;
  }
  return out as T;
}

/** Deduplicated per request: layout, pages and components share one query. */
export const getContent = cache(async (): Promise<SiteContent> => {
  const row = await db.setting.findUnique({ where: { key: "content" } });
  if (!row) return DEFAULT_CONTENT;
  try {
    return mergeContent(DEFAULT_CONTENT, JSON.parse(row.json));
  } catch {
    return DEFAULT_CONTENT;
  }
});

export async function saveContent(patch: unknown): Promise<void> {
  const current = await getContent();
  const next = mergeContent(current, patch);
  await db.setting.upsert({
    where: { key: "content" },
    create: { key: "content", json: JSON.stringify(next) },
    update: { json: JSON.stringify(next) },
  });
}

/** Replace {placeholders} in copy with live values. */
export function fill(text: string, vars: Record<string, string | number>): string {
  return text.replace(/\{(\w+)\}/g, (m, k) => (k in vars ? String(vars[k]) : m));
}

/** "Fokkerstraat 12, 3833 LD Leusden, The Netherlands" */
export function addressLine(b: SiteContent["business"]): string {
  return `${b.street}, ${b.postcode} ${b.city}, ${b.country}`;
}

export function telHref(phone: string): string {
  return `tel:${phone.replace(/[^+\d]/g, "")}`;
}
