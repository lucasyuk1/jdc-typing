import { NextResponse } from "next/server";

export function middleware(req) {
const url = req.nextUrl.clone();
const cookieValue = req.cookies.get("user_session")?.value; // lê o valor do cookie
const pathname = url.pathname;

// rotas públicas
const publicPaths = [
"/auth",
"/api/auth/login",
"/api/auth/register",
"/favicon.ico",
"/_next"
];

// permite assets e rotas públicas
if (publicPaths.some(p => pathname.startsWith(p))) {
return NextResponse.next();
}

// se NÃO logado, redireciona para /auth
if (!cookieValue) {
if (pathname !== "/auth") {
url.pathname = "/auth";
return NextResponse.redirect(url);
}
return NextResponse.next();
}

// se está em /auth e já logado, redireciona para /dashboard
if (cookieValue && pathname === "/auth") {
url.pathname = "/dashboard";
return NextResponse.redirect(url);
}

// usuário logado acessando outras páginas
return NextResponse.next();
}

export const config = {
matcher: ["/((?!api|_next|static|favicon.ico).*)"],
};
