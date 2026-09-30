"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function AdminNav({ items }: { items: { href: string; label: string; count?: number; icon?: React.ReactNode }[] }) {
  const pathname = usePathname();
  return (
    <nav className="admin-nav" aria-label="Admin">
      {items.map((i) => {
        const current = i.href === "/admin" ? pathname === "/admin" : pathname.startsWith(i.href);
        return (
          <Link key={i.href} href={i.href} aria-current={current ? "page" : undefined}>
            {i.icon}{i.label}{i.count ? <span className="admin-count">{i.count}</span> : null}
          </Link>
        );
      })}
    </nav>
  );
}
