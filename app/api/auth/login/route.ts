import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import crypto from "crypto";

const COOKIE_NAME = "dashboard_auth";

function getToken(secret: string): string {
  return crypto.createHash("sha256").update(secret).digest("base64url");
}

export async function POST(request: Request) {
  const secret = process.env.DASHBOARD_SECRET;
  if (!secret) {
    return NextResponse.json(
      { error: "Dashboard login is not configured" },
      { status: 503 }
    );
  }

  const body = await request.json().catch(() => ({}));
  const password = body.password;

  if (password !== secret) {
    return NextResponse.json({ error: "Invalid password" }, { status: 401 });
  }

  const token = getToken(secret);
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  const url = new URL(request.url);
  const from = url.searchParams.get("from") || "/dashboard";
  return NextResponse.json({ redirect: from });
}
