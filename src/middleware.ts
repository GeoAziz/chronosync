import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const session = request.cookies.get('session')?.value;

  // If there's no session cookie, redirect to login
  if (!session) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  try {
    // Call our API route to verify the session
    const verifyResponse = await fetch(new URL('/api/auth/verify', request.url), {
      headers: {
        'Cookie': `session=${session}`
      }
    });

    if (!verifyResponse.ok) {
      throw new Error('Invalid session');
    }

    return NextResponse.next();
  } catch (error) {
    // If session is invalid, redirect to login
    return NextResponse.redirect(new URL('/login', request.url));
  }
}

// Specify which routes to protect with the middleware
export const config = {
  matcher: ['/worker/:path*', '/admin/:path*']
}
