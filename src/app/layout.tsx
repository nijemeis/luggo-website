import type { Metadata, Viewport } from "next";
import { Nunito, Quicksand } from "next/font/google";
import { getContent } from "@/lib/content";
import { imgSrc } from "@/lib/image-urls";
import "./globals.css";

// next/font self-hosts both families at build time; no request goes to Google at runtime.
const quicksand = Quicksand({ subsets: ["latin"], weight: ["500", "600", "700"], variable: "--font-quicksand", display: "swap" });
const nunito = Nunito({ subsets: ["latin"], weight: ["400", "500", "600", "700"], variable: "--font-nunito", display: "swap" });

export async function generateMetadata(): Promise<Metadata> {
  const c = await getContent();
  const og = c.seo.ogImageKey ? imgSrc(c.seo.ogImageKey, 1600) : "/og.png";
  return {
    title: { default: c.seo.title, template: "%s · Luggo" },
    description: c.seo.description,
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3020"),
    openGraph: { type: "website", siteName: "Luggo", title: c.seo.title, description: c.seo.description, images: [{ url: og }] },
    twitter: { card: "summary_large_image", title: c.seo.title, description: c.seo.description, images: [og] },
  };
}

export const viewport: Viewport = { themeColor: "#faf7f2" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${quicksand.variable} ${nunito.variable}`}>
      <body>{children}</body>
    </html>
  );
}
