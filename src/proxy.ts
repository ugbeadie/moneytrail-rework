import { NextRequest, NextResponse } from "next/server";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const authRoutes = ["/login", "/register"];
  const isAuthRoute = authRoutes.includes(pathname);

  // Check authentication status
  const response = await fetch(new URL("/api/auth/get-session", request.url), {
    headers: {
      cookie: request.headers.get("cookie") || "",
    },
  });

  let session = null;
  try {
    session = await response.json();
  } catch (error) {
    session = null;
  }

  const isLoggedIn = session && Object.keys(session).length > 0;

  if (isLoggedIn && isAuthRoute) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  if (!isLoggedIn && !isAuthRoute) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  // 5. Expand the matcher to include your auth pages
  matcher: ["/", "/calendar", "/statistics", "/login", "/register"],
};
