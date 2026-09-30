import { cache } from "react";
import { db } from "./db";

export type Pack = {
  id: string;
  slug: string;
  name: string;
  units: number;
  priceCents: number;
  note: string;
  badge: string;
  isDefault: boolean;
  imageKey: string;
};

/** Active beacon packs in shop order. Deduplicated per request. */
export const getPacks = cache(async (): Promise<Pack[]> => {
  const rows = await db.product.findMany({
    where: { active: true },
    orderBy: [{ sort: "asc" }, { units: "asc" }],
    include: { images: { orderBy: { sort: "asc" }, take: 1 } },
  });
  return rows.map((p) => ({
    id: p.id,
    slug: p.slug,
    name: p.name,
    units: p.units,
    priceCents: p.priceCents,
    note: p.note,
    badge: p.badge,
    isDefault: p.isDefault,
    imageKey: p.images[0]?.key ?? "",
  }));
});

export const getFaq = cache(async () =>
  db.faqItem.findMany({ where: { active: true }, orderBy: [{ sort: "asc" }, { updatedAt: "asc" }], select: { id: true, question: true, answer: true } }),
);

/**
 * Beacon stock is tracked in beacons (one hardware item across all packs), in the
 * `beacon_stock` counter. No counter row means stock isn't tracked.
 */
export const STOCK_COUNTER = "beacon_stock";

export const getStock = cache(async (): Promise<number | null> => {
  const row = await db.counter.findUnique({ where: { name: STOCK_COUNTER } });
  return row ? row.value : null;
});

export type PageSection = { heading: string; body: string };

export function parseSections(json: string): PageSection[] {
  try {
    const v = JSON.parse(json);
    return Array.isArray(v) ? v.filter((s) => s && typeof s.heading === "string").map((s) => ({ heading: s.heading, body: String(s.body ?? "") })) : [];
  } catch {
    return [];
  }
}

export const getPage = cache(async (slug: string) => {
  const page = await db.page.findUnique({ where: { slug } });
  if (!page || !page.published) return null;
  return { ...page, sections: parseSections(page.sections) };
});
