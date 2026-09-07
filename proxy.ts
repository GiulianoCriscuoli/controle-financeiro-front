import { NextRequest, NextResponse } from "next/server";
import { AUTH_COOKIE } from "@/lib/auth";

export function proxy(req: NextRequest) {
  const token = req.cookies.get(AUTH_COOKIE)?.value;
  const { pathname } = req.nextUrl;

  const isLogin = pathname === "/login";
  const isProtected = pathname === "/" || pathname.startsWith("/dashboard");

  if (isProtected && !token) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  if (isLogin && token) {
    const url = req.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/login", "/dashboard/:path*"],
};
