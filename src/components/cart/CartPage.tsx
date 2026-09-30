"use client";

import Link from "next/link";
import { useCart } from "./CartProvider";
import { CartLines, useGoShop } from "./CartDrawer";
import { money } from "@/lib/money";

/** Full-page cart (the drawer is the main entry; this is for direct links). */
export function CartPage() {
  const cart = useCart();
  const goShop = useGoShop();
  if (!cart.hydrated) return null;
  if (!cart.lines.length) {
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
    <div style={{ marginTop: 28, display: "grid", gap: 10 }}>
      <CartLines />
      <div className="panel-w" style={{ marginTop: 8 }}>
        <div className="sum-row"><span>Beacons</span><span>{cart.units}</span></div>
        <div className="sum-total" style={{ marginTop: 8 }}><span style={{ font: "600 15px var(--font-body)" }}>Subtotal</span><span>{money(cart.subtotalCents)}</span></div>
        <Link href="/checkout" className="btn btn-primary btn-block" style={{ marginTop: 16 }}>Checkout</Link>
        <div style={{ textAlign: "center", font: "500 12.5px var(--font-body)", color: "var(--muted)", marginTop: 10 }}>Shipping calculated at checkout</div>
      </div>
    </div>
  );
}
