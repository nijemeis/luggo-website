"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { useCart } from "@/components/cart/CartProvider";
import { CartLines, useGoShop } from "@/components/cart/CartDrawer";
import { money } from "@/lib/money";
import { createCheckout } from "@/app/actions/checkout";

type Zone = { key: string; name: string; countries: string[]; rateCents: number; freeFromCents: number | null; transit: string };
type Country = { code: string; name: string };

const EMPTY = { email: "", phone: "", firstName: "", lastName: "", street: "", houseNo: "", postcode: "", city: "", country: "NL" };

export function CheckoutForm({ zones, countries, cancelled, paymentLine }: { zones: Zone[]; countries: Country[]; cancelled: boolean; paymentLine: string }) {
  const cart = useCart();
  const router = useRouter();
  const goShop = useGoShop();
  const [pending, start] = useTransition();
  const [f, setF] = useState(EMPTY);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState(cancelled ? "Payment was cancelled — nothing has been charged. Try again when you’re ready." : "");

  const zoneFor = (code: string) => zones.find((z) => z.countries.includes(code)) ?? zones.find((z) => z.countries.length === 0);
  const zone = useMemo(() => zoneFor(f.country), [f.country, zones]); // eslint-disable-line react-hooks/exhaustive-deps
  const shipping = !zone ? 0 : zone.freeFromCents != null && cart.subtotalCents >= zone.freeFromCents ? 0 : zone.rateCents;
  const total = cart.subtotalCents + shipping;
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setF((s) => ({ ...s, [k]: e.target.value }));
    if (errors[k]) setErrors(({ [k]: _drop, ...rest }) => rest);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setErrors({});
    if (!cart.lines.length) return;
    start(async () => {
      const res = await createCheckout({ ...f, lines: cart.lines.map((l) => ({ productId: l.productId, qty: l.qty })) });
      if (!res.ok) {
        setError(res.error);
        setErrors(res.fieldErrors ?? {});
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }
      if (res.redirectUrl.startsWith("http")) window.location.href = res.redirectUrl;
      else router.push(res.redirectUrl);
    });
  };

  const field = (k: keyof typeof f, label: string, props: React.InputHTMLAttributes<HTMLInputElement> = {}) => (
    <label className="field">
      <span>{label}</span>
      <input className="input" name={k} value={f[k]} onChange={set(k)} aria-invalid={!!errors[k]} aria-describedby={errors[k] ? `${k}-err` : undefined} {...props} />
      {errors[k] && <span id={`${k}-err`} className="field-error">{errors[k]}</span>}
    </label>
  );

  if (cart.hydrated && cart.lines.length === 0 && !pending) {
    return (
      <div className="panel-w empty" style={{ marginTop: 28, padding: "48px 24px" }}>
        <div className="empty-tile" />
        <h2 style={{ font: "700 22px var(--font-head)" }}>Your cart is empty</h2>
        <p style={{ font: "500 15px var(--font-body)", color: "var(--body)" }}>Pick a pack to get started.</p>
        <button type="button" className="btn btn-primary" style={{ marginTop: 14 }} onClick={goShop}>Choose a pack</button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="checkout-grid" noValidate>
      <div style={{ display: "grid", gap: 18, minWidth: 0 }}>
        {error && <div className="alert" role="alert">{error}</div>}
        <section className="panel-w">
          <h2 className="panel-title">Contact</h2>
          <div style={{ display: "grid", gap: 14, marginTop: 16 }}>
            {field("email", "Email", { type: "email", inputMode: "email", autoComplete: "email", placeholder: "you@example.com", required: true })}
            {field("phone", "Phone (optional, for the carrier)", { type: "tel", inputMode: "tel", autoComplete: "tel", placeholder: "+31 6 12345678" })}
          </div>
        </section>

        <section className="panel-w">
          <h2 className="panel-title">Shipping address</h2>
          <div style={{ display: "grid", gap: 14, marginTop: 16 }}>
            <div className="grid-fit" style={{ "--min": "160px", gap: 14 } as React.CSSProperties}>
              {field("firstName", "First name", { autoComplete: "given-name", required: true })}
              {field("lastName", "Last name", { autoComplete: "family-name", required: true })}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 2fr) minmax(0, 1fr)", gap: 14 }}>
              {field("street", "Street", { autoComplete: "address-line1", required: true })}
              {field("houseNo", "No.", { autoComplete: "address-line2", required: true })}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) minmax(0, 2fr)", gap: 14 }}>
              {field("postcode", "Postcode", { autoComplete: "postal-code", placeholder: f.country === "NL" ? "3833 LD" : "", required: true })}
              {field("city", "City", { autoComplete: "address-level2", required: true })}
            </div>
            <label className="field">
              <span>Country</span>
              <select className="select" name="country" value={f.country} onChange={set("country")} autoComplete="country" aria-invalid={!!errors.country}>
                {countries.map((c) => <option key={c.code} value={c.code}>{c.name}</option>)}
              </select>
              {errors.country && <span className="field-error">{errors.country}</span>}
            </label>
          </div>
        </section>

        <section className="panel-w">
          <h2 className="panel-title">Shipping</h2>
          {zone ? (
            <label className="radio-row" style={{ marginTop: 16 }}>
              <input type="radio" name="ship" checked readOnly />
              <span style={{ flex: 1 }}>
                <span style={{ display: "flex", justifyContent: "space-between", gap: 10, font: "700 15.5px var(--font-head)" }}><span>Tracked parcel — {zone.name}</span><span>{shipping ? money(shipping) : "Free"}</span></span>
                <span style={{ display: "block", font: "500 13.5px var(--font-body)", color: "var(--body)", marginTop: 3 }}>
                  {zone.transit}{zone.freeFromCents != null && shipping > 0 ? ` · free from ${money(zone.freeFromCents)}` : ""}
                </span>
              </span>
            </label>
          ) : (
            <p className="field-error" style={{ marginTop: 12 }}>We don’t ship to this country yet.</p>
          )}
        </section>
      </div>

      <aside className="panel-w sticky-aside" style={{ background: "#fff" }}>
        <h2 className="panel-title">Order summary</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 16 }}>
          <CartLines compact />
        </div>
        <div className="divider" />
        <div style={{ display: "grid", gap: 8 }}>
          <div className="sum-row"><span>Beacons</span><span>{cart.units}</span></div>
          <div className="sum-row"><span>Subtotal</span><span>{money(cart.subtotalCents)}</span></div>
          <div className="sum-row"><span>Shipping</span><span>{zone ? (shipping ? money(shipping) : "Free") : "—"}</span></div>
        </div>
        <div className="divider" />
        <div className="sum-total"><span style={{ font: "600 15px var(--font-body)" }}>Total <span style={{ color: "var(--muted)", fontWeight: 500, fontSize: 13 }}>incl. VAT</span></span><span>{money(total)}</span></div>
        <button type="submit" className="btn btn-primary btn-block" style={{ marginTop: 18, padding: 17 }} disabled={pending || !cart.hydrated || !zone}>
          <svg width="15" height="16" viewBox="0 0 15 16" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="7" width="13" height="8" rx="2.5" /><path d="M4 7V5a3.5 3.5 0 0 1 7 0v2" /></svg>
          {pending ? "One moment…" : `Pay ${money(total)}`}
        </button>
        <p style={{ textAlign: "center", font: "500 12.5px/1.5 var(--font-body)", color: "var(--muted)", marginTop: 10 }}>
          {paymentLine}. You choose how to pay on the secure payment page.
        </p>
      </aside>
    </form>
  );
}
