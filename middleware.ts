import { NextResponse, type NextRequest } from "next/server";

/**
 * Fast redirect for admin pages without a session cookie.
 * This is NOT the security boundary: the admin layout and every admin API validate the session in MongoDB.
 */
export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (pathname === "/admin/login") return NextResponse.next();
  if (!req.cookies.get("ow_admin")?.value) {
    const url = req.nextUrl.clone();
    url.pathname = "/admin/login";
    url.search = `?next=${encodeURIComponent(pathname)}`;
    return NextResponse.redirect(url);
  }
  const res = NextResponse.next();
  res.headers.set("X-Robots-Tag", "noindex, nofollow");
  return res;
}

export const config = { matcher: ["/admin", "/admin/:path*"] };
