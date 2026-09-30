"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

/** A cart line is one pack. Prices here are for display only; checkout re-prices on the server. */
export type CartLine = {
  productId: string;
  name: string;
  note: string;
  units: number;
  unitCents: number;
  imageKey: string;
  qty: number;
};

export const MAX_QTY = 9;

type CartApi = {
  lines: CartLine[];
  count: number; // packs
  units: number; // beacons
  subtotalCents: number;
  hydrated: boolean;
  open: boolean;
  setOpen: (open: boolean) => void;
  add: (line: Omit<CartLine, "qty">, qty: number) => void;
  setQty: (productId: string, qty: number) => void;
  remove: (productId: string) => void;
  clear: () => void;
  /** Refresh names/prices from the server's current catalogue (drops packs that no longer exist). */
  sync: (packs: Omit<CartLine, "qty">[]) => void;
};

const CartContext = createContext<CartApi | null>(null);
const STORAGE_KEY = "luggo.cart.v1";

const clamp = (n: number) => Math.max(1, Math.min(MAX_QTY, Math.round(n)));

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [open, setOpenState] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) setLines(parsed.filter((l) => l && typeof l.productId === "string").map((l) => ({ ...l, qty: clamp(Number(l.qty) || 1) })));
      }
    } catch {}
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(lines)); } catch {}
  }, [lines, hydrated]);

  // Close the drawer with Escape; lock page scroll while it's open.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpenState(false); };
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => { window.removeEventListener("keydown", onKey); document.body.style.overflow = prev; };
  }, [open]);

  const setOpen = useCallback((v: boolean) => setOpenState(v), []);

  const api = useMemo<CartApi>(() => ({
    lines,
    hydrated,
    open,
    setOpen,
    count: lines.reduce((s, l) => s + l.qty, 0),
    units: lines.reduce((s, l) => s + l.units * l.qty, 0),
    subtotalCents: lines.reduce((s, l) => s + l.unitCents * l.qty, 0),
    add: (line, qty) =>
      setLines((ls) => {
        const hit = ls.find((l) => l.productId === line.productId);
        return hit ? ls.map((l) => (l.productId === line.productId ? { ...l, ...line, qty: clamp(l.qty + qty) } : l)) : [...ls, { ...line, qty: clamp(qty) }];
      }),
    setQty: (productId, qty) => setLines((ls) => ls.map((l) => (l.productId === productId ? { ...l, qty: clamp(qty) } : l))),
    remove: (productId) => setLines((ls) => ls.filter((l) => l.productId !== productId)),
    clear: () => setLines([]),
    sync: (packs) =>
      setLines((ls) => {
        const next = ls.flatMap((l) => {
          const p = packs.find((x) => x.productId === l.productId);
          return p ? [{ ...l, ...p }] : [];
        });
        return JSON.stringify(next) === JSON.stringify(ls) ? ls : next;
      }),
  }), [lines, hydrated, open, setOpen]);

  return <CartContext.Provider value={api}>{children}</CartContext.Provider>;
}

export function useCart(): CartApi {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}
