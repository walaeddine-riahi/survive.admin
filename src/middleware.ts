import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const pathname = req.nextUrl.pathname;

    // Routes réservées aux ADMINS uniquement
    const adminOnlyPaths = [
      "/admin",
      "/factories",
      "/plan",
      "/plan-type",
      "/risk",
      "/scenario",
      "/incident",
      "/report",
      "/bia",
      "/bia-form",
      "/compliance",
      "/conformity",
      "/training",
      "/task",
      "/injections",
      "/instructor-simulations",
    ];

    // Routes accessibles aux utilisateurs réguliers
    const userAccessPaths = [
      "/participant-mode",
      "/participant-view",
      "/simulation",
      "/participations",
      "/notifications",
      "/profile",
      "/settings",
      "/team-members",
      "/team-chat",
      "/dashboard",
    ];

    // Vérifier si l'utilisateur accède à une route admin
    const isAdminPath = adminOnlyPaths.some((path) =>
      pathname.startsWith(path)
    );

    if (isAdminPath && token?.role !== "ADMIN") {
      const url = new URL("/participant-mode", req.url);
      url.searchParams.set("error", "unauthorized");
      return NextResponse.redirect(url);
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
    pages: {
      signIn: "/connection",
      error: "/connection",
    },
  }
);

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - connection (login page)
     * - signup (registration page)
     * - password-reset (password reset page)
     * - register (registration page)
     * - payments (payment pages)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|connection|signup|password-reset|register|payments).*)",
  ],
};
