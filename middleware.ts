import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Create a new Response object
  const response = NextResponse.next()

  // Add cache control headers to disable caching
  response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate')
  response.headers.set('Pragma', 'no-cache')
  response.headers.set('Expires', '0')

  return response
}

// Run middleware on product-related routes
export const config = {
  matcher: [
    '/produto/:path*',
    '/colecao/:path*',
    '/admin/produtos/:path*',
  ],
}
