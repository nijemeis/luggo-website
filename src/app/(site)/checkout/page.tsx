import type { Metadata } from "next";
import { getZones, COUNTRIES } from "@/lib/shipping";
import { getContent } from "@/lib/content";
import { CheckoutForm } from "@/components/checkout/CheckoutForm";

export const metadata: Metadata = { title: "Checkout", robots: { index: false } };

export default async function CheckoutPage({ searchParams }: { searchParams: Promise<{ cancelled?: string }> }) {
  const [{ cancelled }, zones, content] = await Promise.all([searchParams, getZones(), getContent()]);
  // Only offer countries that a shipping zone covers.
  const hasFallback = zones.some((z) => z.countries.length === 0);
  const countries = COUNTRIES.filter((c) => hasFallback || zones.some((z) => z.countries.includes(c.code)));
  return (
    <main className="wrap page-pad">
      <div className="kicker">Checkout</div>
      <h1 className="page-title">Almost on its way.</h1>
      <CheckoutForm
        zones={zones.map((z) => ({ key: z.key, name: z.name, countries: z.countries, rateCents: z.rateCents, freeFromCents: z.freeFromCents, transit: z.transit }))}
        countries={countries}
        cancelled={cancelled === "1"}
        paymentLine={content.footer.paymentLine}
      />
    </main>
  );
}
