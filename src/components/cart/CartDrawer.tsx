"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useCart, MAX_QTY, type CartLine } from "./CartProvider";
import { Beacon } from "@/components/glyphs";
import { money } from "@/lib/money";
import { imgSrc } from "@/lib/image-urls";

type PackInfo = Omit<CartLine, "qty">;

/** Scroll to the shop section on the home page, or navigate there from elsewhere. */
export function useGoShop() {
  const pathname = usePathname();
  const router = useRouter();
  return () => {
    const el = document.getElementById("shop");
    if (pathname === "/" && el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 66, behavior: "smooth" });
    else router.push("/#shop");
  };
}

export function LineTile({ imageKey }: { imageKey: string }) {
  return (
    <div className="line-tile">
      {imageKey ? <img src={imgSrc(imageKey, 400)} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <Beacon w={22} h={26} radius={8} dot={7} bg="#fff" />}
    </div>
  );
}

export function CartLines({ compact = false }: { compact?: boolean }) {
  const cart = useCart();
  return (
    <>
      {cart.lines.map((l) => (
        <div key={l.productId} className="line" style={compact ? undefined : { padding: 16 }}>
          <LineTile imageKey={l.imageKey} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ font: "700 15.5px var(--font-head)" }}>{l.name}</div>
            <div style={{ font: "500 12.5px var(--font-body)", color: "var(--body)", marginTop: 1 }}>{l.note}</div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 8 }}>
              <button type="button" className="step-btn sm" aria-label={`One ${l.name} less`} disabled={l.qty <= 1} onClick={() => cart.setQty(l.productId, l.qty - 1)}>&minus;</button>
              <span style={{ font: "700 14px var(--font-head)", minWidth: 14, textAlign: "center" }} aria-live="polite">{l.qty}</span>
              <button type="button" className="step-btn sm" aria-label={`One ${l.name} more`} disabled={l.qty >= MAX_QTY} onClick={() => cart.setQty(l.productId, l.qty + 1)}>+</button>
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 10, alignSelf: "stretch", justifyContent: "space-between" }}>
            <button type="button" className="remove-btn" aria-label={`Remove ${l.name}`} onClick={() => cart.remove(l.productId)}>&times;</button>
            <span style={{ font: "700 16px var(--font-head)" }}>{money(l.unitCents * l.qty)}</span>
          </div>
        </div>
      ))}
    </>
  );
}

export function CartDrawer({ packs }: { packs: PackInfo[] }) {
  const cart = useCart();
  const router = useRouter();
  const goShop = useGoShop();
  const closeRef = useRef<HTMLButtonElement>(null);

  // Keep stored lines in step with the live catalogue (prices, names, removed packs).
  useEffect(() => {
    if (cart.hydrated) cart.sync(packs);
  }, [cart.hydrated, packs]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (cart.open) closeRef.current?.focus();
  }, [cart.open]);

  if (!cart.open) return null;
  const empty = cart.lines.length === 0;
  return (
    <div className="drawer">
      <button type="button" className="drawer-backdrop" aria-label="Close cart" tabIndex={-1} onClick={() => cart.setOpen(false)} />
      <div className="drawer-panel" role="dialog" aria-modal="true" aria-label="Your cart">
        <div className="drawer-head">
          <div className="drawer-title">Your cart</div>
          <button ref={closeRef} type="button" className="icon-btn" aria-label="Close cart" onClick={() => cart.setOpen(false)}>&times;</button>
        </div>
        {empty ? (
          <div className="empty">
            <div className="empty-tile" />
            <div style={{ font: "700 20px var(--font-head)" }}>Your cart is empty</div>
            <div style={{ font: "500 14.5px var(--font-body)", color: "var(--body)" }}>Pick a pack to get started.</div>
            <button type="button" className="btn btn-primary" style={{ marginTop: 14, padding: "14px 24px", fontSize: 15 }} onClick={() => { cart.setOpen(false); goShop(); }}>Choose a pack</button>
          </div>
        ) : (
          <div style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0 }}>
            <div style={{ flex: 1, overflowY: "auto", padding: "4px 24px 12px", display: "flex", flexDirection: "column", gap: 10 }}>
              <CartLines compact />
            </div>
            <div className="drawer-foot">
              <div className="sum-row"><span>Beacons</span><span>{cart.units}</span></div>
              <div className="sum-total" style={{ marginTop: 8 }}><span style={{ font: "600 15px var(--font-body)" }}>Subtotal</span><span>{money(cart.subtotalCents)}</span></div>
              <button type="button" className="btn btn-primary btn-block" style={{ marginTop: 16, padding: 17 }} onClick={() => { cart.setOpen(false); router.push("/checkout"); }}>Checkout</button>
              <div style={{ textAlign: "center", font: "500 12.5px var(--font-body)", color: "var(--muted)", marginTop: 10 }}>Shipping calculated at checkout</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
