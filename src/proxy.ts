import { NextResponse, type NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Define route lists
  const isAuthRoute = path.startsWith("/auth/");
  const isCreatorRoute = path.startsWith("/dashboard/creator");
  const isAdminRoute = path.startsWith("/dashboard/admin");
  const isModeratorRoute = path.startsWith("/dashboard/moderator");
  const isFanRoute = path.startsWith("/dashboard/fan");
  const isProtectedRoute = path === "/feed" || path === "/messages" || path === "/settings" || isCreatorRoute || isAdminRoute || isModeratorRoute || isFanRoute;

  // Quick read cookie for session presence to avoid unnecessary fetch requests
  // Better Auth sessions usually set a cookie named "better-auth.session_token" or similar
  const hasSessionCookie = request.cookies.getAll().some(c => c.name.includes("session_token"));

  if (!hasSessionCookie) {
    // If trying to access protected route and has no session, redirect to login
    if (isProtectedRoute) {
      return NextResponse.redirect(new URL("/auth/login", request.url));
    }
    return NextResponse.next();
  }

  // Double check full session object via API fetch
  try {
    const sessionRes = await fetch(`${request.nextUrl.origin}/api/auth/get-session`, {
      headers: {
        cookie: request.headers.get("cookie") || "",
      },
    });

    if (!sessionRes.ok) {
      if (isProtectedRoute) {
        return NextResponse.redirect(new URL("/auth/login", request.url));
      }
      return NextResponse.next();
    }

    const sessionData = await sessionRes.json();
    const session = sessionData?.user ? sessionData : null;

    if (!session) {
      if (isProtectedRoute) {
        return NextResponse.redirect(new URL("/auth/login", request.url));
      }
      return NextResponse.next();
    }

    // Redirect logged in users away from auth pages to feed
    if (isAuthRoute) {
      return NextResponse.redirect(new URL("/feed", request.url));
    }

    // Role-based Access Control
    const userRole = session.user.role;

    if (isCreatorRoute && userRole !== "creator") {
      return NextResponse.redirect(new URL("/feed", request.url));
    }

    if (isAdminRoute && userRole !== "admin") {
      return NextResponse.redirect(new URL("/feed", request.url));
    }

    if (isModeratorRoute && userRole !== "moderator" && userRole !== "admin") {
      return NextResponse.redirect(new URL("/feed", request.url));
    }

  } catch (error) {
    console.error("Middleware/Proxy auth verification error:", error);
    // On error, let it pass or redirect depending on safety
    if (isProtectedRoute) {
      return NextResponse.redirect(new URL("/auth/login", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - next.svg, vercel.svg (default asset logos)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|next.svg|vercel.svg).*)",
  ],
};
