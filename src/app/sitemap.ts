import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/stripe";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteUrl();
  return [
    { url: `${base}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/shipping`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${base}/privacy`, changeFrequency: "yearly", priority: 0.3 },
  ];
}
