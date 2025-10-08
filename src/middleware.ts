import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    // Vérifier si l'utilisateur est un admin pour les routes admin
    if (req.nextUrl.pathname.startsWith("/admin")) {
      const token = req.nextauth.token;
      if (token?.role !== "ADMIN") {
        return NextResponse.redirect(new URL("/", req.url));
      }
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
