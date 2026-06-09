import { NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  // 1. Hit Better-Auth's internal API endpoint to check the live session state.
  // This is completely Edge-safe and forwards the user's cookies securely.
  const response = await fetch(new URL("/api/auth/get-session", request.url), {
    headers: {
      cookie: request.headers.get("cookie") || "",
    },
  });

  const session = await response.json();

  // 2. If no session is found, block them and redirect to the login page
  if (!session || Object.keys(session).length === 0) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // 3. If authenticated, allow them to pass through
  return NextResponse.next();
}

export const config = {
  // Protect /dashboard and any nested sub-routes like /dashboard/settings
  matcher: ["/dashboard/:path*"],
};
