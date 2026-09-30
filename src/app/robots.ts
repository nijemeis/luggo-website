import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/stripe";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/admin", "/checkout", "/cart", "/order/", "/track"] },
    sitemap: `${siteUrl()}/sitemap.xml`,
  };
}
