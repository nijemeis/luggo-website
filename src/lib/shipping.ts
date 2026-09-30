import { cache } from "react";
import { db } from "./db";

export type Zone = {
  id: string;
  key: string;
  name: string;
  countries: string[];
  rateCents: number;
  freeFromCents: number | null;
  transit: string;
  sort: number;
};

/** Deduplicated per request. */
export const getZones = cache(async (): Promise<Zone[]> => {
  const rows = await db.shippingZone.findMany({ where: { active: true }, orderBy: { sort: "asc" } });
  return rows.map((z) => ({
    id: z.id,
    key: z.key,
    name: z.name,
    countries: z.countries.split(",").map((c) => c.trim().toUpperCase()).filter(Boolean),
    rateCents: z.rateCents,
    freeFromCents: z.freeFromCents,
    transit: z.transit,
    sort: z.sort,
  }));
});

/** Find the zone for a country; a zone with no countries acts as the fallback. */
export function zoneForCountry(zones: Zone[], country: string): Zone | undefined {
  const c = country.toUpperCase();
  return zones.find((z) => z.countries.includes(c)) ?? zones.find((z) => z.countries.length === 0);
}

export function shippingFor(zone: Zone | undefined, subtotalCents: number): number {
  if (!zone) return 0;
  if (zone.freeFromCents != null && subtotalCents >= zone.freeFromCents) return 0;
  return zone.rateCents;
}

/** Countries offered in the checkout: the Netherlands, Belgium and the rest of the EU. */
export const COUNTRIES: { code: string; name: string }[] = [
  { code: "NL", name: "Netherlands" },
  { code: "BE", name: "Belgium" },
  { code: "DE", name: "Germany" },
  { code: "AT", name: "Austria" },
  { code: "BG", name: "Bulgaria" },
  { code: "HR", name: "Croatia" },
  { code: "CY", name: "Cyprus" },
  { code: "CZ", name: "Czechia" },
  { code: "DK", name: "Denmark" },
  { code: "EE", name: "Estonia" },
  { code: "FI", name: "Finland" },
  { code: "FR", name: "France" },
  { code: "GR", name: "Greece" },
  { code: "HU", name: "Hungary" },
  { code: "IE", name: "Ireland" },
  { code: "IT", name: "Italy" },
  { code: "LV", name: "Latvia" },
  { code: "LT", name: "Lithuania" },
  { code: "LU", name: "Luxembourg" },
  { code: "MT", name: "Malta" },
  { code: "PL", name: "Poland" },
  { code: "PT", name: "Portugal" },
  { code: "RO", name: "Romania" },
  { code: "SK", name: "Slovakia" },
  { code: "SI", name: "Slovenia" },
  { code: "ES", name: "Spain" },
  { code: "SE", name: "Sweden" },
];

export const POSTCODE_PATTERNS: Record<string, RegExp> = {
  NL: /^\d{4}\s?[A-Za-z]{2}$/,
  BE: /^\d{4}$/,
  DE: /^\d{5}$/,
  FR: /^\d{5}$/,
  AT: /^\d{4}$/,
  LU: /^\d{4}$/,
  DK: /^\d{4}$/,
  ES: /^\d{5}$/,
  IT: /^\d{5}$/,
};

export function countryName(code: string): string {
  return COUNTRIES.find((c) => c.code === code)?.name ?? code;
}

/** Carriers the admin can pick when shipping; the URL builds the customer's tracking link. */
export const CARRIERS: { key: string; label: string; url: (code: string, postcode: string, country: string) => string }[] = [
  { key: "postnl", label: "PostNL", url: (c, p, cc) => `https://jouw.postnl.nl/track-and-trace/${encodeURIComponent(c)}-${encodeURIComponent(cc)}-${encodeURIComponent(p.replace(/\s/g, ""))}` },
  { key: "dhl", label: "DHL", url: (c) => `https://www.dhl.com/nl-en/home/tracking.html?tracking-id=${encodeURIComponent(c)}` },
  { key: "dpd", label: "DPD", url: (c) => `https://tracking.dpd.de/status/en_NL/parcel/${encodeURIComponent(c)}` },
  { key: "bpost", label: "bpost", url: (c, p) => `https://track.bpost.cloud/btr/web/#/search?itemCode=${encodeURIComponent(c)}&postalCode=${encodeURIComponent(p)}` },
  { key: "other", label: "Other", url: () => "" },
];

export function trackingUrl(carrier: string, code: string, postcode: string, country: string): string {
  if (!code) return "";
  return CARRIERS.find((c) => c.key === carrier)?.url(code, postcode, country) ?? "";
}

export function carrierLabel(carrier: string): string {
  return CARRIERS.find((c) => c.key === carrier)?.label ?? carrier;
}
