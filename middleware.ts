import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(req: NextRequest) {
  const token = await getToken({
    req,
    secret: process.env.AUTH_SECRET || 'merchant-acquisition-map-secret-key-2026',
    secureCookie: process.env.NODE_ENV === 'production',
  });

  const { pathname } = req.nextUrl;
  const isLoginPage = pathname === '/login';

  // If on login page and token exists -> redirect to home '/'
  if (isLoginPage) {
    if (token) {
      return NextResponse.redirect(new URL('/', req.url));
    }
    return NextResponse.next();
  }

  // If no session token -> redirect to /login
  if (!token) {
    const loginUrl = new URL('/login', req.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Role-based access rules
  const userRole = (token.role as string) || 'MARKETING';

  if (pathname.startsWith('/users') && userRole !== 'ADMIN') {
    return NextResponse.redirect(new URL('/', req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|markers|images).*)'],
};
