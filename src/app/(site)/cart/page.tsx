import type { Metadata } from "next";
import { CartPage } from "@/components/cart/CartPage";

export const metadata: Metadata = { title: "Your cart", robots: { index: false } };

export default function Page() {
  return (
    <main className="wrap page-pad" style={{ maxWidth: 760 }}>
      <div className="kicker">Cart</div>
      <h1 className="page-title">Your cart</h1>
      <CartPage />
    </main>
  );
}
