"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { saveContent } from "@/lib/content";
import { parseMoney } from "@/lib/money";
import { processAndStoreImage, newImageKey } from "@/lib/images";
import type { ActionState } from "./catalog";

/**
 * Generic content saver. Form field names carry a type prefix and a dotted path:
 *   s:hero.headline       string
 *   b:footer.newsletter   boolean (checkbox; pair with a hidden "false" first)
 *   n:business.vatRate    number
 *   m:some.path           money "19,00" → cents
 *   l:some.list           textarea, one entry per line → string[]
 * Arrays built from indexed paths are compacted and rows with only empty
 * strings are dropped, so blank "add another" rows are harmless.
 */
export async function saveContentForm(_prev: ActionState, form: FormData): Promise<ActionState> {
  await requireAdmin();
  const patch: Record<string, unknown> = {};
  const touchedArrays = new Set<string>();
  for (const [rawKey, rawVal] of form.entries()) {
    const m = /^([sbnfml]):(.+)$/.exec(rawKey);
    if (!m) continue;
    const [, type, path] = m;
    const val = typeof rawVal === "string" ? rawVal : "";
    let parsed: unknown;
    switch (type) {
      case "s": parsed = val.trim(); break;
      case "b": parsed = val === "on" || val === "true"; break;
      case "n": parsed = Number(val) || 0; break;
      case "f": parsed = Number(val.replace(",", ".")) || 0; break;
      case "m": { const c = parseMoney(val); if (c == null) return { error: `Invalid price in ${path}` }; parsed = c; break; }
      case "l": parsed = val.split("\n").map((s) => s.trim()).filter(Boolean); break;
    }
    setPath(patch, path.split("."), parsed, touchedArrays);
  }
  compactArrays(patch);
  await saveContent(patch);
  revalidatePath("/", "layout");
  return { ok: "Saved" };
}

function setPath(obj: Record<string, unknown>, parts: string[], value: unknown, arrays: Set<string>, prefix = "") {
  const [head, ...rest] = parts;
  if (rest.length === 0) { obj[head] = value; return; }
  const nextIsIndex = /^\d+$/.test(rest[0]);
  if (obj[head] === undefined) obj[head] = nextIsIndex ? [] : {};
  if (nextIsIndex) arrays.add(prefix + head);
  setPath(obj[head] as Record<string, unknown>, rest, value, arrays, `${prefix}${head}.`);
}

function compactArrays(node: unknown): void {
  if (Array.isArray(node)) {
    for (let i = 0; i < node.length; i++) compactArrays(node[i]);
    const kept = node.filter((row) => row !== undefined && !(isPlainObject(row) && Object.values(row).every((v) => v === "" || v === false || v === 0 || v === undefined)));
    node.length = 0;
    node.push(...kept);
  } else if (isPlainObject(node)) {
    for (const v of Object.values(node)) compactArrays(v);
  }
}
function isPlainObject(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

/* ── Shipping zones ─────────────────────────────────────────────────── */
export async function saveZone(_prev: ActionState, form: FormData): Promise<ActionState> {
  await requireAdmin();
  const id = String(form.get("id") ?? "").trim();
  const key = String(form.get("key") ?? "").trim().toUpperCase().replace(/[^A-Z0-9_]/g, "");
  const name = String(form.get("name") ?? "").trim();
  const rate = parseMoney(String(form.get("rate") ?? ""));
  const freeRaw = String(form.get("freeFrom") ?? "").trim();
  const freeFrom = freeRaw ? parseMoney(freeRaw) : null;
  if (!key || !name || rate == null) return { error: "Key, name and a valid rate are required" };
  if (freeRaw && freeFrom == null) return { error: "“Free from” must look like 100,00" };
  const data = {
    key, name, rateCents: rate, freeFromCents: freeFrom,
    countries: String(form.get("countries") ?? "").toUpperCase().split(/[,\s]+/).filter(Boolean).join(","),
    transit: String(form.get("transit") ?? "").trim(),
    sort: Number(form.get("sort")) || 0,
    active: form.get("active") === "on",
  };
  try {
    if (id) await db.shippingZone.update({ where: { id }, data });
    else await db.shippingZone.create({ data });
  } catch {
    return { error: "That zone key already exists" };
  }
  revalidatePath("/", "layout");
  return { ok: `Saved zone ${name}` };
}

export async function deleteZone(id: string): Promise<ActionState> {
  await requireAdmin();
  await db.shippingZone.delete({ where: { id } });
  revalidatePath("/", "layout");
  return { ok: "Zone deleted" };
}

/* ── Content images (beacon photo, OG image) ───────────────────────── */
const IMAGE_SLOTS = { beacon: "beacon.imageKey", og: "seo.ogImageKey" } as const;

export async function uploadContentImage(slot: keyof typeof IMAGE_SLOTS, _prev: ActionState, form: FormData): Promise<ActionState> {
  await requireAdmin();
  const f = form.get("image");
  if (!(f instanceof File) || f.size === 0) return { error: "Choose an image" };
  if (f.size > 25 * 1024 * 1024) return { error: "That image is over 25 MB" };
  if (!/^image\/(jpeg|png|webp|avif|heic|heif)$/.test(f.type)) return { error: "Use a JPG, PNG or WebP image" };
  const { key } = await processAndStoreImage(Buffer.from(await f.arrayBuffer()), newImageKey());
  const patch: Record<string, unknown> = {};
  setPath(patch, IMAGE_SLOTS[slot].split("."), key, new Set());
  await saveContent(patch);
  revalidatePath("/", "layout");
  return { ok: "Image uploaded" };
}

export async function clearContentImage(slot: keyof typeof IMAGE_SLOTS): Promise<ActionState> {
  await requireAdmin();
  const patch: Record<string, unknown> = {};
  setPath(patch, IMAGE_SLOTS[slot].split("."), "", new Set());
  await saveContent(patch);
  revalidatePath("/", "layout");
  return { ok: "Image removed" };
}
