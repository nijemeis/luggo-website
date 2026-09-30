import type { Metadata } from "next";
import { AppIcon } from "@/components/glyphs";
import { LoginForm } from "./LoginForm";
import "../admin.css";

export const metadata: Metadata = { title: "Admin login", robots: { index: false } };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams;
  return (
    <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 20 }}>
      <div className="panel-w" style={{ width: "min(420px, 100%)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
          <AppIcon size={42} />
          <div><div className="brand-name">Luggo</div><div className="help">Admin</div></div>
        </div>
        <LoginForm next={next ?? "/admin"} />
      </div>
    </main>
  );
}
