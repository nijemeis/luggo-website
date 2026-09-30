"use server";

import { z } from "zod";
import { db } from "@/lib/db";

export async function subscribeNewsletter(email: string): Promise<{ ok: true } | { ok: false; error: string }> {
  const parsed = z.string().email().safeParse(email.trim().toLowerCase());
  if (!parsed.success) return { ok: false, error: "That doesn't look like an email address" };
  await db.subscriber.upsert({ where: { email: parsed.data }, create: { email: parsed.data }, update: {} });
  return { ok: true };
}
