import { cookies } from "next/headers";

/**
 * Single-admin authentication for a one-person studio.
 * Password lives in ADMIN_PASSWORD; sessions are an HMAC-signed cookie
 * (Web Crypto, so the same code runs in proxy.ts on the edge runtime).
 */
export const ADMIN_COOKIE = "luggo_admin";
const SESSION_DAYS = 14;

function secret(): string {
  const s = process.env.AUTH_SECRET;
  if (!s || s.length < 16) throw new Error("AUTH_SECRET must be set (16+ characters)");
  return s;
}

async function hmac(data: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey("raw", enc.encode(secret()), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(data));
  return Array.from(new Uint8Array(sig)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

export async function createSessionToken(): Promise<string> {
  const exp = Date.now() + SESSION_DAYS * 86400_000;
  const payload = `admin.${exp}`;
  return `${payload}.${await hmac(payload)}`;
}

export async function verifySessionToken(token: string | undefined | null): Promise<boolean> {
  if (!token) return false;
  const parts = token.split(".");
  if (parts.length !== 3) return false;
  const [who, exp, sig] = parts;
  if (who !== "admin") return false;
  if (Number(exp) < Date.now()) return false;
  const expected = await hmac(`${who}.${exp}`);
  if (expected.length !== sig.length) return false;
  let diff = 0;
  for (let i = 0; i < expected.length; i++) diff |= expected.charCodeAt(i) ^ sig.charCodeAt(i);
  return diff === 0;
}

export function checkPassword(input: string): boolean {
  const pw = process.env.ADMIN_PASSWORD || "";
  if (!pw) return false;
  if (pw.length !== input.length) return false;
  let diff = 0;
  for (let i = 0; i < pw.length; i++) diff |= pw.charCodeAt(i) ^ input.charCodeAt(i);
  return diff === 0;
}

export async function isAdmin(): Promise<boolean> {
  const jar = await cookies();
  return verifySessionToken(jar.get(ADMIN_COOKIE)?.value);
}

export async function requireAdmin(): Promise<void> {
  if (!(await isAdmin())) throw new Error("Not authorised");
}

export function sessionCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_DAYS * 86400,
  };
}
