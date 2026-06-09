import { NextRequest, NextResponse } from "next/server";

export async function proxy(request: NextRequest) {
  const response = await fetch(new URL("/api/auth/get-session", request.url), {
    headers: {
      cookie: request.headers.get("cookie") || "",
    },
  });

  const session = await response.json();

  if (!session || Object.keys(session).length === 0) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/calendar", "/statistics"],
};
