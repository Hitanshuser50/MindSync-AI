import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs"

// Define protected routes that require authentication
const PROTECTED_ROUTES = [
  "/dashboard",
  "/profile",
  "/chat",
  "/mood",
  "/mood-tracker",
  "/self-care",
  "/meditations",
  "/insights",
  "/achievements",
  "/subscription",
  "/settings",
]

// Define admin-only routes
const ADMIN_ROUTES = ["/admin"]

// Define routes that should redirect logged-in users
const AUTH_ROUTES = ["/login", "/signup", "/reset-password"]

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()

  // Create Supabase client
  const supabase = createMiddlewareClient({ req, res })

  // Get session
  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Get the pathname
  const { pathname } = req.nextUrl

  // Security headers for all routes
  const securityHeaders = new Headers(res.headers)

  // Add security headers
  securityHeaders.set("X-Content-Type-Options", "nosniff")
  securityHeaders.set("X-Frame-Options", "DENY")
  securityHeaders.set("X-XSS-Protection", "1; mode=block")
  securityHeaders.set("Referrer-Policy", "strict-origin-when-cross-origin")
  securityHeaders.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()")

  // Add Content Security Policy
  securityHeaders.set(
    "Content-Security-Policy",
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https://v0.blob.com; font-src 'self' data:; connect-src 'self' https://*.supabase.co https://api.stripe.com https://generativelanguage.googleapis.com; frame-src 'self' https://js.stripe.com;",
  )

  // Check if the route requires authentication
  const isProtectedRoute = PROTECTED_ROUTES.some((route) => pathname.startsWith(route))
  const isAdminRoute = ADMIN_ROUTES.some((route) => pathname.startsWith(route))
  const isAuthRoute = AUTH_ROUTES.some((route) => pathname.startsWith(route))

  // Handle protected routes
  if (isProtectedRoute && !session) {
    // Redirect to login page with return URL
    const redirectUrl = new URL("/login", req.url)
    redirectUrl.searchParams.set("redirect", pathname)
    return NextResponse.redirect(redirectUrl)
  }

  // Handle admin routes
  if (isAdminRoute) {
    if (!session) {
      // Redirect to login page with return URL
      const redirectUrl = new URL("/login", req.url)
      redirectUrl.searchParams.set("redirect", pathname)
      return NextResponse.redirect(redirectUrl)
    }

    // Check if user has admin role (you would need to implement this logic)
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", session.user.id).single()

    if (!profile || profile.role !== "admin") {
      // Redirect to home page if not an admin
      return NextResponse.redirect(new URL("/", req.url))
    }
  }

  // Redirect logged-in users away from auth pages
  if (isAuthRoute && session) {
    // Check if there's a redirect parameter
    const redirectParam = req.nextUrl.searchParams.get("redirect")
    if (redirectParam) {
      return NextResponse.redirect(new URL(redirectParam, req.url))
    }

    // Otherwise redirect to dashboard
    return NextResponse.redirect(new URL("/dashboard", req.url))
  }

  // Apply security headers to the response
  const response = NextResponse.next({
    request: {
      headers: req.headers,
    },
  })

  // Add all security headers to the response
  Object.entries(Object.fromEntries(securityHeaders.entries())).forEach(([key, value]) => {
    response.headers.set(key, value)
  })

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public files)
     */
    "/((?!_next/static|_next/image|favicon.ico|public).*)",
  ],
}

