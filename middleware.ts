import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifyToken } from '@/lib/auth'

const publicPaths = ['/', '/login', '/register', '/f']
const apiPublicPaths = ['/api/public']

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Allow public paths
  if (publicPaths.some((p) => pathname === p || pathname.startsWith('/f/'))) {
    return NextResponse.next()
  }

  // Allow public API routes
  if (apiPublicPaths.some((p) => pathname.startsWith(p))) {
    return NextResponse.next()
  }

  // Allow static files and Next.js internals
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api/auth') ||
    pathname.includes('.') // static files
  ) {
    return NextResponse.next()
  }

  // Check auth for dashboard routes
  if (pathname.startsWith('/dashboard')) {
    const token = request.cookies.get('session')?.value

    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url))
    }

    try {
      const payload = await verifyToken(token)
      const headers = new Headers(request.headers)
      headers.set('x-user-id', payload.userId)
      headers.set('x-workspace-id', payload.workspaceId)
      return NextResponse.next({ request: { headers } })
    } catch {
      const response = NextResponse.redirect(new URL('/login', request.url))
      response.cookies.delete('session')
      return response
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
