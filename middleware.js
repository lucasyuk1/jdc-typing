import { NextResponse } from "next/server";

export function middleware(req) {
  const url = req.nextUrl.clone();
  const cookie = req.cookies.get("user_session");
  const pathname = url.pathname;

  // rotas públicas
  const publicPaths = [
    "/auth",
    "/api/auth/login",
    "/api/auth/register",
    "/favicon.ico",
    "/_next"
  ];

  // permite assets e next internals
  if (publicPaths.some(p => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  // se NÃO logado, redireciona para /auth
  if (!cookie) {
    url.pathname = "/auth";
    return NextResponse.redirect(url);
  }

  // se está em /auth e já logado, manda para /dashboard
  if (cookie && pathname === "/auth") {
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next|static|favicon.ico).*)"],
};
