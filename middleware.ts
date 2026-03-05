import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const DASHBOARD_LOGIN = "/dashboard/login";
const COOKIE_NAME = "dashboard_auth";

async function getExpectedToken(secret: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(secret);
  const hash = await crypto.subtle.digest("SHA-256", data);
  const bytes = new Uint8Array(hash);
  let binary = "";
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export async function middleware(request: NextRequest) {
  const secret = process.env.DASHBOARD_SECRET;
  const isDev = process.env.NODE_ENV === "development";

  const { pathname } = request.nextUrl;
  const isDashboard = pathname.startsWith("/dashboard");
  const isLoginPage = pathname === DASHBOARD_LOGIN;
  const isProtectedApi =
    request.method === "POST" &&
    (pathname.startsWith("/api/magazines") || pathname.startsWith("/api/publications"));

  // In dev with no secret, dashboard is open (no login required)
  if (isDev && !secret) {
    return NextResponse.next();
  }

  // Production, or dev with secret set: require auth
  if (isLoginPage) {
    if (!secret) return NextResponse.next();
    const token = request.cookies.get(COOKIE_NAME)?.value;
    const expected = await getExpectedToken(secret);
    if (token === expected) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    return NextResponse.next();
  }

  if (isDashboard || isProtectedApi) {
    if (!secret) {
      if (isProtectedApi) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      const login = new URL(DASHBOARD_LOGIN, request.url);
      login.searchParams.set("from", pathname);
      return NextResponse.redirect(login);
    }
    const token = request.cookies.get(COOKIE_NAME)?.value;
    const expected = await getExpectedToken(secret);
    if (token !== expected) {
      if (isProtectedApi) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      const login = new URL(DASHBOARD_LOGIN, request.url);
      login.searchParams.set("from", pathname);
      return NextResponse.redirect(login);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/api/magazines", "/api/publications"],
};
