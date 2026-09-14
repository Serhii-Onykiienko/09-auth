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

  const accessToken = request.cookies.get('accessToken')?.value;
  const refreshToken = request.cookies.get('refreshToken')?.value;

  let isAuthenticated = Boolean(accessToken);

  let response = NextResponse.next();

  if (!accessToken && refreshToken) {
    try {
      const cookieHeader = request.headers.get('cookie') ?? '';

      const sessionResponse = await checkSession(cookieHeader);

      isAuthenticated = sessionResponse.data.success;

      const setCookie = sessionResponse.headers['set-cookie'];

      if (setCookie) {
        const cookies = Array.isArray(setCookie) ? setCookie : [setCookie];

        for (const cookieString of cookies) {
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
    } catch {
      isAuthenticated = false;
    }
  }

  if (isPrivateRoute && !isAuthenticated) {
    response = NextResponse.redirect(new URL('/sign-in', request.url));
  }

  if (isPublicRoute && isAuthenticated) {
    response = NextResponse.redirect(new URL('/', request.url));
  }

  return response;
}

export const config = {
  matcher: ['/notes/:path*', '/profile/:path*', '/sign-in', '/sign-up'],
};
