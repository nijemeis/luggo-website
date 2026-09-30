"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ADMIN_COOKIE, checkPassword, createSessionToken, sessionCookieOptions } from "@/lib/auth";

export async function login(_prev: { error: string } | null, form: FormData): Promise<{ error: string }> {
  const password = String(form.get("password") ?? "");
  const next = String(form.get("next") ?? "/admin");
  if (!process.env.ADMIN_PASSWORD) return { error: "ADMIN_PASSWORD is not set in .env" };
  if (!checkPassword(password)) {
    await new Promise((r) => setTimeout(r, 600)); // slow down guessing
    return { error: "Wrong password" };
  }
  const jar = await cookies();
  jar.set(ADMIN_COOKIE, await createSessionToken(), sessionCookieOptions());
  redirect(next.startsWith("/admin") ? next : "/admin");
}

export async function logout(): Promise<void> {
  const jar = await cookies();
  jar.delete(ADMIN_COOKIE);
  redirect("/admin/login");
}
