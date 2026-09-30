import { NextResponse } from "next/server";
import { getObject } from "@/lib/storage";

/** Serves product image renditions from the media store (local disk or S3). */
export async function GET(_req: Request, ctx: { params: Promise<{ key: string[] }> }) {
  const { key } = await ctx.params;
  const path = key.join("/");
  if (!/^[a-zA-Z0-9_\-./]+$/.test(path) || path.includes("..")) return new NextResponse("Bad key", { status: 400 });
  const obj = await getObject("media", path);
  if (!obj) return new NextResponse("Not found", { status: 404 });
  return new NextResponse(new Uint8Array(obj.body), {
    headers: {
      "Content-Type": obj.contentType,
      "Content-Length": String(obj.body.length),
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
