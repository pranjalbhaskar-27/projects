import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

// This function runs before a request is completed
export async function middleware(request) {
  const { pathname } = request.nextUrl;

  // Check if the request is for the upload section
  if (pathname.startsWith('/upload')) {
    const token = await getToken({ req: request });

    // Redirect to signin if there's no session token
    if (!token) {
      const signInUrl = new URL('/auth/signin', request.url);
      return NextResponse.redirect(signInUrl);
    }
  }

  return NextResponse.next();
}

// See: https://nextjs.org/docs/app/building-your-application/routing/middleware
export const config = {
  matcher: ['/upload/:path*'],
}; 