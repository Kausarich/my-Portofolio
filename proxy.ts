import { NextResponse, type NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
export async function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const deny = () =>
    NextResponse.rewrite(new URL("/404", request.url), { status: 404 });
  if (["/login", "/admin", "/signin", "/wp-admin"].includes(path))
    return deny();
  if (path === "/dashboard" || path.startsWith("/dashboard/")) {
    const token = await getToken({
      req: request,
      secret: process.env.AUTH_SECRET,
      secureCookie: request.nextUrl.protocol === "https:",
    });
    if (
      !token?.email ||
      !process.env.OWNER_EMAIL ||
      token.email.toLowerCase() !== process.env.OWNER_EMAIL.toLowerCase()
    )
      return deny();
  }
  const response = NextResponse.next();
  if (
    path === `/${process.env.SECRET_LOGIN_SLUG}` ||
    path.startsWith("/dashboard")
  )
    response.headers.set("X-Robots-Tag", "noindex, nofollow");
  return response;
}
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|images).*)"],
};
