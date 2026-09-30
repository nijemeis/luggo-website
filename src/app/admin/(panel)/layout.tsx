import type { Metadata } from "next";
import Link from "next/link";
import { db } from "@/lib/db";
import { OPEN_STATUSES } from "@/lib/orders";
import { logout } from "@/app/admin/actions/auth";
import { AdminNav } from "@/components/admin/AdminNav";
import { AppIcon } from "@/components/glyphs";
import "../admin.css";

export const metadata: Metadata = { title: { default: "Admin", template: "%s · Luggo admin" }, robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const openOrders = await db.order.count({ where: { status: { in: OPEN_STATUSES } } });
  const items = [
    { href: "/admin", label: "Dashboard" },
    { href: "/admin/orders", label: "Orders", count: openOrders },
    { href: "/admin/products", label: "Packs & stock" },
    { href: "/admin/faq", label: "FAQ" },
    { href: "/admin/pages", label: "Pages" },
    { href: "/admin/content", label: "Homepage copy" },
    { href: "/admin/shipping", label: "Shipping" },
    { href: "/admin/settings", label: "Settings" },
    { href: "/admin/subscribers", label: "Newsletter" },
  ];
  return (
    <div className="admin">
      <aside className="admin-side">
        <Link href="/admin" className="brand">
          <AppIcon size={36} />
          <span style={{ display: "flex", flexDirection: "column", gap: 3 }}>
            <span className="brand-name" style={{ fontSize: 19 }}>Luggo</span>
            <span className="brand-sub">ADMIN</span>
          </span>
        </Link>
        <AdminNav items={items} />
        <div style={{ marginTop: 24, display: "grid", gap: 4 }}>
          <a href="/" target="_blank" rel="noreferrer" className="side-link">View site ↗</a>
          <form action={logout}><button type="submit" className="side-link">Log out</button></form>
        </div>
      </aside>
      <main className="admin-main">{children}</main>
    </div>
  );
}
