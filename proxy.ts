import { NextRequest, NextResponse } from 'next/server';
import { parseSetCookie } from 'cookie';

import { checkSession } from '@/lib/api/serverApi';

const privateRoutes = ['/profile', '/notes'];
const publicRoutes = ['/sign-in', '/sign-up'];

function matchesRoute(pathname: string, route: string) {
  return pathname === route || pathname.startsWith(`${route}/`);
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isPrivateRoute = privateRoutes.some(route =>
    matchesRoute(pathname, route)
  );

  const isPublicRoute = publicRoutes.some(route =>
    matchesRoute(pathname, route)
  );

  const cookieHeader = request.headers.get('cookie') ?? '';

  let isAuthenticated = false;
  let setCookie: string | string[] | undefined;

  try {
    const sessionResponse = await checkSession(cookieHeader);

    isAuthenticated = sessionResponse.data.success;
    setCookie = sessionResponse.headers['set-cookie'];
  } catch {
    isAuthenticated = false;
  }

  let response = NextResponse.next();

  if (isPrivateRoute && !isAuthenticated) {
    response = NextResponse.redirect(new URL('/sign-in', request.url));
  }

  if (isPublicRoute && isAuthenticated) {
    response = NextResponse.redirect(new URL('/profile', request.url));
  }

  if (setCookie) {
    const cookieArray = Array.isArray(setCookie) ? setCookie : [setCookie];

    for (const cookieString of cookieArray) {
      const parsedCookie = parseSetCookie(cookieString);

      if (parsedCookie.name && parsedCookie.value) {
        response.cookies.set(
          parsedCookie.name,
          parsedCookie.value,
          parsedCookie
        );
      }
    }
  }

  return response;
}

export const config = {
  matcher: ['/notes/:path*', '/profile/:path*', '/sign-in', '/sign-up'],
};
