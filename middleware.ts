import {getToken} from "next-auth/jwt"
import {withAuth} from "next-auth/middleware"
import {NextResponse} from "next/server"
import type {NextRequest} from "next/server";
import createMiddleware from 'next-intl/middleware';
import routing from '@/i18n/routing';

// Domain-based locale routing
const intlMiddleware = createMiddleware(routing);

export default withAuth(
  async function middleware(req: NextRequest) {
    // First, run i18n routing to resolve locale and rewrite paths accordingly
    const i18nResponse = intlMiddleware(req);
    if (i18nResponse) {
      // If the i18n middleware returns a response (rewrite/redirect), merge headers and continue
      // but still allow auth logic for protected routes
      // We clone the URL from the potentially rewritten request
    }
    const pathname = req.nextUrl.pathname;

    // Skip middleware for API routes and static files
    if (pathname.startsWith('/api/') || pathname.startsWith('/_next/') || pathname.includes('.')) {
      return null;
    }

    const token = await getToken({ req })
    const isAuth = !!token
    
    const isAuthPage =
      pathname.startsWith("/login") ||
      pathname.startsWith("/register")

    if (isAuthPage) {
      if (isAuth) {
        return NextResponse.redirect(new URL("/dashboard", req.url))
      }
      return null
    }

    // Only check auth for protected routes
    const isProtectedRoute = 
      pathname.startsWith("/dashboard") ||
      pathname.startsWith("/editor");

    if (isProtectedRoute && !isAuth) {
      let from = pathname;
      if (req.nextUrl.search) {
        from += req.nextUrl.search;
      }

      return NextResponse.redirect(
        new URL(`/login?from=${encodeURIComponent(from)}`, req.url)
      );
    }
    // If no auth redirects, return i18n response (if present) or continue
    return i18nResponse ?? NextResponse.next();
  },
  {
    callbacks: {
      async authorized() {
        // This is a work-around for handling redirect on auth pages.
        // We return true here so that the middleware function above
        // is always called.
        return true
      },
    },
  }
)

export const config = {
  matcher: [
    // Recommended matcher (v4) to exclude Next internals & static assets
    '/((?!api|_next|_vercel|.*\\..*).*)',
  ],
}
