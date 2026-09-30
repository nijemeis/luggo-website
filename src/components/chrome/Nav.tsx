"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { AppIcon, CartGlyph } from "@/components/glyphs";
import { useCart } from "@/components/cart/CartProvider";

const LINKS = [
  ["how", "How it works"],
  ["zones", "Zones"],
  ["beacon", "The beacon"],
  ["shop", "Shop"],
  ["faq", "FAQ"],
  ["contact", "Contact"],
] as const;

const LEGAL_PATHS = ["/privacy", "/shipping"];

export function Nav() {
  const pathname = usePathname();
  const cart = useCart();
  const [menu, setMenu] = useState(false);
  const home = pathname === "/";
  const legal = LEGAL_PATHS.includes(pathname);
  const href = (id: string) => (home ? `#${id}` : `/#${id}`);

  useEffect(() => setMenu(false), [pathname]);

  return (
    <header className="nav">
      <div className="nav-inner">
        <Link href={home ? "#top" : "/"} className="brand" aria-label="Luggo home">
          <AppIcon size={34} />
          <span className="brand-name">Luggo</span>
        </Link>
        {!legal && (
          <nav className="nav-links" aria-label="Sections">
            {LINKS.map(([id, label]) => <a key={id} href={href(id)}>{label}</a>)}
          </nav>
        )}
        <div className="nav-right">
          {legal ? (
            <Link href="/" className="btn btn-secondary" style={{ height: 42, padding: "0 18px", borderRadius: 14, fontSize: 14 }}>&larr; Back to Luggo</Link>
          ) : (
            <>
              <button type="button" className="cart-btn" aria-label={`Open cart${cart.count ? `, ${cart.count} item${cart.count === 1 ? "" : "s"}` : ""}`} onClick={() => cart.setOpen(true)}>
                <CartGlyph />
                Cart
                {cart.hydrated && cart.count > 0 && <span className="cart-count">{cart.count}</span>}
              </button>
              <a href={href("shop")} className="btn btn-primary btn-sm">Get beacons</a>
              <button type="button" className="menu-btn" aria-label="Menu" aria-expanded={menu} onClick={() => setMenu((m) => !m)}>
                <svg width="18" height="14" viewBox="0 0 18 14" aria-hidden="true" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  {menu ? <path d="M3 1l12 12M15 1L3 13" /> : <path d="M1 1h16M1 7h16M1 13h16" />}
                </svg>
              </button>
            </>
          )}
        </div>
      </div>
      {menu && !legal && (
        <nav className="mobile-sheet" aria-label="Sections">
          {LINKS.map(([id, label]) => <a key={id} href={href(id)} onClick={() => setMenu(false)}>{label}</a>)}
          <Link href="/track" onClick={() => setMenu(false)}>Track your order</Link>
        </nav>
      )}
    </header>
  );
}
