import { NextResponse, type NextRequest } from "next/server";
import { ADMIN_COOKIE, verifySessionToken } from "@/lib/auth";

/** Protects everything under /admin except the login page. */
export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (pathname === "/admin/login") return NextResponse.next();
  const ok = await verifySessionToken(req.cookies.get(ADMIN_COOKIE)?.value);
  if (ok) return NextResponse.next();
  const url = req.nextUrl.clone();
  url.pathname = "/admin/login";
  url.searchParams.set("next", pathname);
  return NextResponse.redirect(url);
}

export const config = { matcher: ["/admin/:path*"] };
