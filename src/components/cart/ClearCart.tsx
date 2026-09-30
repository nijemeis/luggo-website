"use client";

import { useEffect } from "react";
import { useCart } from "./CartProvider";

/** Empties the cart once the order is confirmed paid. */
export function ClearCart() {
  const cart = useCart();
  useEffect(() => {
    if (cart.hydrated && cart.lines.length) cart.clear();
  }, [cart.hydrated]); // eslint-disable-line react-hooks/exhaustive-deps
  return null;
}
