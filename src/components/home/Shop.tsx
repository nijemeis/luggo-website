"use client";

import { useState } from "react";
import { useCart, MAX_QTY } from "@/components/cart/CartProvider";
import { Beacon } from "@/components/glyphs";
import type { Pack } from "@/lib/catalog";
import { money } from "@/lib/money";
import { imgSrc } from "@/lib/image-urls";

/** Pack picker + quantity + add to cart. Prices come from the database; checkout re-prices on the server. */
export function Shop({ packs, stock, note, soldOut }: { packs: Pack[]; stock: number | null; note: string; soldOut: string }) {
  const cart = useCart();
  const available = (p: Pack) => stock == null || stock >= p.units;
  const initial = [packs.find((p) => p.isDefault), ...packs].find((p) => p && available(p))?.id ?? packs[0]?.id ?? "";
  const [selected, setSelected] = useState(initial);
  const [qty, setQty] = useState(1);
  const pack = packs.find((p) => p.id === selected) ?? packs[0];
  const maxQty = pack && stock != null ? Math.max(1, Math.min(MAX_QTY, Math.floor(stock / pack.units))) : MAX_QTY;

  if (!pack) return <p className="lead" style={{ marginTop: 40 }}>{soldOut}</p>;

  const add = () => {
    cart.add({ productId: pack.id, name: pack.name, note: pack.note, units: pack.units, unitCents: pack.priceCents, imageKey: pack.imageKey }, Math.min(qty, maxQty));
    setQty(1);
    cart.setOpen(true);
  };

  return (
    <>
      <div className="grid-fit" role="radiogroup" aria-label="Choose a pack" style={{ "--min": "270px", gap: 16, marginTop: 40 } as React.CSSProperties}>
        {packs.map((p) => {
          const on = p.id === pack.id;
          const ok = available(p);
          return (
            <button key={p.id} type="button" role="radio" aria-checked={on} className="pack" disabled={!ok} onClick={() => { setSelected(p.id); setQty(1); }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
                  <span className="radio" />
                  <span className="pack-label">{p.name}</span>
                </div>
                {!ok ? <span className="tag" style={{ background: "var(--sand)", color: "var(--body)" }}>Sold out</span> : p.badge ? <span className="tag">{p.badge}</span> : null}
              </div>
              {p.imageKey ? (
                <div className="pack-photo"><img src={imgSrc(p.imageKey, 400)} alt="" /></div>
              ) : (
                <div className="pack-units" aria-hidden="true">
                  {Array.from({ length: Math.min(p.units, 10) }, (_, i) => <Beacon key={i} w={40} h={48} radius={13} dot={11} />)}
                </div>
              )}
              <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
                <div className="price-lg">{money(p.priceCents)}</div>
                <div style={{ font: "600 13.5px var(--font-body)", color: "var(--body)" }}>{money(Math.round(p.priceCents / p.units))} each</div>
              </div>
              <div style={{ font: "500 14px var(--font-body)", color: "var(--body)", marginTop: 4 }}>{p.note}</div>
            </button>
          );
        })}
      </div>

      <div className="order-bar">
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <span id="qty-label" style={{ font: "600 15px var(--font-body)" }}>Quantity</span>
          <div className="stepper" role="group" aria-labelledby="qty-label">
            <button type="button" className="step-btn" aria-label="Decrease quantity" disabled={qty <= 1} onClick={() => setQty((q) => Math.max(1, q - 1))}>&minus;</button>
            <output aria-live="polite">{qty}</output>
            <button type="button" className="step-btn" aria-label="Increase quantity" disabled={qty >= maxQty} onClick={() => setQty((q) => Math.min(maxQty, q + 1))}>+</button>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginLeft: "auto" }}>
          <span style={{ font: "600 15px var(--font-body)", color: "var(--body)" }}>Total</span>
          <span style={{ font: "700 28px var(--font-head)" }}>{money(pack.priceCents * qty)}</span>
        </div>
        <button type="button" className="btn btn-primary" style={{ padding: "16px 28px" }} disabled={!available(pack)} onClick={add}>Add to cart</button>
      </div>
      <div style={{ marginTop: 14, font: "600 13.5px var(--font-body)", color: "var(--body)" }}>{stock != null && stock <= 0 ? soldOut : note}</div>
    </>
  );
}
