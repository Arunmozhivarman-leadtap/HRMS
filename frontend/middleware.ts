import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const token = request.cookies.get('access_token')?.value
  const { pathname } = request.nextUrl

  // 1. Allow public assets and API routes to bypass middleware
  if (
    pathname.startsWith('/_next') || 
    pathname.startsWith('/api') || 
    pathname.includes('/favicon.ico')
  ) {
    return NextResponse.next()
  }

  // 2. Define protected and public paths
  const isDashboardPath = pathname.startsWith('/dashboard')
  const isLoginPage = pathname === '/'

  // 3. Logic: Redirect to dashboard if logged in and trying to access login page
  if (isLoginPage && token) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // 4. Logic: Redirect to login if NOT logged in and trying to access dashboard
  if (isDashboardPath && !token) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
