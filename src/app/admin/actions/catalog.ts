"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { slugify } from "@/lib/slug";
import { parseMoney } from "@/lib/money";
import { STOCK_COUNTER } from "@/lib/catalog";
import { processAndStoreImage, deleteImageRenditions, newImageKey } from "@/lib/images";

export type ActionState = { ok?: string; error?: string } | null;

function str(form: FormData, key: string): string {
  return String(form.get(key) ?? "").trim();
}
function bool(form: FormData, key: string): boolean {
  return form.get(key) === "on" || form.get(key) === "true";
}
function num(form: FormData, key: string, fallback = 0): number {
  const n = Number(form.get(key));
  return Number.isFinite(n) ? n : fallback;
}

/* ── Packs (products) ───────────────────────────────────────────────── */
export async function saveProduct(_prev: ActionState, form: FormData): Promise<ActionState> {
  await requireAdmin();
  const id = str(form, "id");
  const name = str(form, "name");
  if (!name) return { error: "Name is required" };
  const priceCents = parseMoney(str(form, "price"));
  if (priceCents == null || priceCents <= 0) return { error: "Enter a price like 75,00" };
  const units = Math.round(num(form, "units", 1));
  if (units < 1 || units > 20) return { error: "Beacons per pack must be between 1 and 20" };
  const data = {
    name,
    slug: slugify(str(form, "slug") || name),
    units,
    priceCents,
    note: str(form, "note"),
    badge: str(form, "badge"),
    isDefault: bool(form, "isDefault"),
    sort: num(form, "sort"),
    active: bool(form, "active"),
  };
  let productId = id;
  try {
    if (id) await db.product.update({ where: { id }, data });
    else productId = (await db.product.create({ data })).id;
  } catch {
    return { error: "That slug is already in use" };
  }
  // Only one pack can be pre-selected.
  if (data.isDefault) await db.product.updateMany({ where: { id: { not: productId } }, data: { isDefault: false } });
  revalidatePath("/", "layout");
  if (!id) redirect(`/admin/products/${productId}?saved=1`);
  return { ok: `Saved “${name}”` };
}

export async function deleteProduct(id: string): Promise<ActionState> {
  await requireAdmin();
  const used = await db.orderItem.count({ where: { productId: id } });
  if (used > 0) return { error: `This pack is on ${used} order line(s). Deactivate it instead, so order history stays intact.` };
  const images = await db.productImage.findMany({ where: { productId: id } });
  await db.product.delete({ where: { id } });
  await Promise.all(images.map((i) => deleteImageRenditions(i.key)));
  revalidatePath("/", "layout");
  redirect("/admin/products");
}

export async function toggleProduct(id: string, active: boolean): Promise<void> {
  await requireAdmin();
  await db.product.update({ where: { id }, data: { active } });
  revalidatePath("/", "layout");
}

/** Beacon stock, in beacons. Empty input stops tracking (deletes the counter). */
export async function saveStock(_prev: ActionState, form: FormData): Promise<ActionState> {
  await requireAdmin();
  const raw = str(form, "stock");
  if (raw === "") {
    await db.counter.deleteMany({ where: { name: STOCK_COUNTER } });
    revalidatePath("/", "layout");
    return { ok: "Stock is no longer tracked" };
  }
  const value = Math.round(Number(raw));
  if (!Number.isFinite(value) || value < 0) return { error: "Enter a whole number of beacons, or leave empty" };
  await db.counter.upsert({ where: { name: STOCK_COUNTER }, create: { name: STOCK_COUNTER, value }, update: { value } });
  revalidatePath("/", "layout");
  return { ok: `Stock set to ${value} beacons` };
}

const IMAGE_TYPES = /^image\/(jpeg|png|webp|avif|gif|heic|heif)$/;

async function storeUpload(f: File): Promise<{ key: string; width: number; height: number } | { error: string }> {
  if (f.size > 25 * 1024 * 1024) return { error: `${f.name} is over 25 MB` };
  if (!IMAGE_TYPES.test(f.type)) return { error: `${f.name} isn't a supported image` };
  try {
    return await processAndStoreImage(Buffer.from(await f.arrayBuffer()), newImageKey());
  } catch (e) {
    return { error: `Could not process ${f.name}: ${e instanceof Error ? e.message : e}` };
  }
}

export async function uploadProductImages(productId: string, _prev: ActionState, form: FormData): Promise<ActionState> {
  await requireAdmin();
  const files = form.getAll("images").filter((f): f is File => f instanceof File && f.size > 0);
  if (!files.length) return { error: "Choose at least one image" };
  const [last, product] = await Promise.all([db.productImage.findFirst({ where: { productId }, orderBy: { sort: "desc" } }), db.product.findUnique({ where: { id: productId } })]);
  let sort = (last?.sort ?? -1) + 1;
  for (const f of files) {
    const res = await storeUpload(f);
    if ("error" in res) return res;
    await db.productImage.create({ data: { productId, key: res.key, width: res.width, height: res.height, alt: product?.name ?? "", sort: sort++ } });
  }
  revalidatePath("/", "layout");
  return { ok: `${files.length} image${files.length > 1 ? "s" : ""} added` };
}

export async function updateImage(imageId: string, _prev: ActionState, form: FormData): Promise<ActionState> {
  await requireAdmin();
  await db.productImage.update({ where: { id: imageId }, data: { alt: str(form, "alt"), sort: num(form, "sort") } });
  revalidatePath("/", "layout");
  return { ok: "Image updated" };
}

export async function deleteImage(imageId: string): Promise<ActionState> {
  await requireAdmin();
  const img = await db.productImage.findUnique({ where: { id: imageId } });
  if (!img) return { error: "Image not found" };
  await db.productImage.delete({ where: { id: imageId } });
  await deleteImageRenditions(img.key);
  revalidatePath("/", "layout");
  return { ok: "Image removed" };
}

/* ── FAQ ────────────────────────────────────────────────────────────── */
export async function saveFaq(_prev: ActionState, form: FormData): Promise<ActionState> {
  await requireAdmin();
  const id = str(form, "id");
  const question = str(form, "question");
  const answer = str(form, "answer");
  if (!question || !answer) return { error: "Question and answer are both required" };
  const data = { question, answer, sort: num(form, "sort"), active: bool(form, "active") };
  if (id) await db.faqItem.update({ where: { id }, data });
  else await db.faqItem.create({ data });
  revalidatePath("/", "layout");
  return { ok: "FAQ saved" };
}

export async function deleteFaq(id: string): Promise<ActionState> {
  await requireAdmin();
  await db.faqItem.delete({ where: { id } });
  revalidatePath("/", "layout");
  return { ok: "Deleted" };
}

/** Swap an item with its neighbour; renumbers all items so sort values stay unique. */
export async function moveFaq(id: string, dir: -1 | 1): Promise<ActionState> {
  await requireAdmin();
  const items = await db.faqItem.findMany({ orderBy: [{ sort: "asc" }, { updatedAt: "asc" }] });
  const i = items.findIndex((x) => x.id === id);
  const j = i + dir;
  if (i < 0 || j < 0 || j >= items.length) return null;
  [items[i], items[j]] = [items[j], items[i]];
  await db.$transaction(items.map((x, n) => db.faqItem.update({ where: { id: x.id }, data: { sort: n } })));
  revalidatePath("/", "layout");
  return { ok: "Moved" };
}

/* ── CMS pages ──────────────────────────────────────────────────────── */
export async function savePage(_prev: ActionState, form: FormData): Promise<ActionState> {
  await requireAdmin();
  const id = str(form, "id");
  const title = str(form, "title");
  if (!title) return { error: "Title is required" };
  const sections = [];
  for (let i = 0; form.has(`heading.${i}`); i++) {
    const heading = str(form, `heading.${i}`);
    const body = String(form.get(`body.${i}`) ?? "").replace(/\r\n/g, "\n").trim();
    if (heading || body) sections.push({ heading, body });
  }
  await db.page.update({
    where: { id },
    data: { title, kicker: str(form, "kicker"), intro: str(form, "intro"), updatedOn: str(form, "updatedOn"), published: bool(form, "published"), sections: JSON.stringify(sections) },
  });
  revalidatePath("/", "layout");
  return { ok: `Saved “${title}” (${sections.length} sections)` };
}
