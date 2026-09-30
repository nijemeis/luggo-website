import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPage } from "@/lib/catalog";
import { CmsPage } from "@/components/CmsPage";

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPage("shipping");
  return { title: page?.title ?? "Not found", description: page?.intro };
}

export default async function Page() {
  const page = await getPage("shipping");
  if (!page) notFound();
  return <CmsPage page={page} />;
}
