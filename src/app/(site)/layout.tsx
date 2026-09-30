import { CartProvider } from "@/components/cart/CartProvider";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { Nav } from "@/components/chrome/Nav";
import { Footer } from "@/components/chrome/Footer";
import { getContent } from "@/lib/content";
import { getPacks } from "@/lib/catalog";

export const dynamic = "force-dynamic";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const [content, packs] = await Promise.all([getContent(), getPacks()]);
  const a = content.announcement;
  return (
    <CartProvider>
      {a.text && <div className="announce">{a.link ? <a href={a.link}>{a.text}</a> : a.text}</div>}
      <Nav />
      {children}
      <Footer content={content} />
      <CartDrawer packs={packs.map((p) => ({ productId: p.id, name: p.name, note: p.note, units: p.units, unitCents: p.priceCents, imageKey: p.imageKey }))} />
    </CartProvider>
  );
}
