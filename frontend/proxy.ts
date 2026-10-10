import { NextResponse, type NextRequest } from "next/server";

const AUTH_REDIRECT_IF_LOGGED_IN = ["/login", "/signup"];
const PUBLIC_PATHS = ["/home", "/pricing", "/features", "/docs"];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("auth_token")?.value;
  const isPublic = PUBLIC_PATHS.some((p) => pathname.startsWith(p));
  const isAuthOnly = AUTH_REDIRECT_IF_LOGGED_IN.some((p) => pathname.startsWith(p));

  if (!token && !isPublic && !isAuthOnly) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  if (token && isAuthOnly) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next|api|favicon.ico|.*\\.(?:png|jpg|jpeg|svg|gif|webp|ico|txt|xml|json|woff|woff2|ttf|otf)$).*)"],
};