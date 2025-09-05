// import {getToken} from "next-auth/jwt"
// import {withAuth} from "next-auth/middleware"
// import {NextResponse} from "@/node_modules/next/server"
// import type {NextRequest} from "@/node_modules/next/server";
import createMiddleware from "next-intl/middleware";
import { routing } from "@/i18n/routing";

// export default withAuth(
//   async function middleware(req: NextRequest) {
//     const pathname = req.nextUrl.pathname;

//     // Skip middleware for API routes and static files
//     if (pathname.startsWith('/api/') || pathname.startsWith('/_next/') || pathname.includes('.')) {
//       return null;
//     }

//     const token = await getToken({ req })
//     const isAuth = !!token
    
//     const isAuthPage =
//       pathname.startsWith("/login") ||
//       pathname.startsWith("/register")

//     if (isAuthPage) {
//       if (isAuth) {
//         return NextResponse.redirect(new URL("/dashboard", req.url))
//       }
//       return null
//     }

//     // Only check auth for protected routes
//     const isProtectedRoute = 
//       pathname.startsWith("/dashboard") ||
//       pathname.startsWith("/editor");

//     if (isProtectedRoute && !isAuth) {
//       let from = pathname;
//       if (req.nextUrl.search) {
//         from += req.nextUrl.search;
//       }

//       return NextResponse.redirect(
//         new URL(`/login?from=${encodeURIComponent(from)}`, req.url)
//       );
//     }
//     // If no auth redirects, return i18n response (if present) or continue
//     return NextResponse.next();
//   },
//   {
//     callbacks: {
//       async authorized() {
//         // This is a work-around for handling redirect on auth pages.
//         // We return true here so that the middleware function above
//         // is always called.
//         return true
//       },
//     },
//   }
// )

export default createMiddleware(routing);

export const config = {
  matcher: [
    // Match all pathnames except for
    // - … if they start with `/api`, `/_next` or `/_vercel`
    // - … the ones containing a dot (e.g. `favicon.ico`)
    '/((?!api|_next|_vercel|.*\\..*).*)'
  ]
}
