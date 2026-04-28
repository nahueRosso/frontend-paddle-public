import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const DISABLED_PATHS = ["/aprobacion", "/chatbot"];
const DISABLED_PREFIXES = ["/dashboard"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isDisabledPath = DISABLED_PATHS.includes(pathname);
  const isDisabledPrefix = DISABLED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );

  if (!isDisabledPath && !isDisabledPrefix) {
    return NextResponse.next();
  }

  const target = request.nextUrl.clone();
  target.pathname = pathname.startsWith("/dashboard") ? "/clubes" : "/";
  target.search = "";

  return NextResponse.redirect(target);
}

export const config = {
  matcher: ["/aprobacion", "/chatbot", "/dashboard/:path*"],
};
