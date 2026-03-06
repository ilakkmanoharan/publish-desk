import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Dashboard protection is handled client-side via AuthProvider.
// Only redirect /dashboard to /login so unauthenticated users land on login page.
export function middleware(request: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: [],
};
