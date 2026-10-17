import { NextResponse } from "next/server";
export function GET(request: Request) {
  const slug = process.env.SECRET_LOGIN_SLUG;
  if (!slug) return new Response("Not found", { status: 404 });
  return NextResponse.redirect(new URL(`/${slug}`, request.url), {
    headers: {
      "Cache-Control": "no-store",
      "X-Robots-Tag": "noindex, nofollow",
    },
  });
}
