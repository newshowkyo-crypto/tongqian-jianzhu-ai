import { NextResponse, type NextRequest } from 'next/server';

const publicPaths = ['/login', '/forbidden'];
const allowedRoles = new Set(['agent', 'platform_owner']);
const DEV_TOKEN = 'dev-agent';
const DEV_ROLE = 'agent';
const basePath = '/agent';

function setDevCookies(response: NextResponse): void {
  const expires = 60 * 60 * 24 * 7;
  response.cookies.set('tq_auth_token', DEV_TOKEN, { maxAge: expires, path: '/', sameSite: 'lax' });
  response.cookies.set('tq_role', DEV_ROLE, { maxAge: expires, path: '/', sameSite: 'lax' });
}

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const normalizedPath = pathname.startsWith(basePath) ? pathname.slice(basePath.length) || '/' : pathname;
  if (publicPaths.some((path) => normalizedPath === path || normalizedPath.startsWith(`${path}/`))) return NextResponse.next();

  const isDev = process.env.NODE_ENV !== 'production';
  const token = request.cookies.get('tq_auth_token')?.value;
  const role = request.cookies.get('tq_role')?.value ?? '';

  if (isDev && (!token || !allowedRoles.has(role))) {
    const url = request.nextUrl.clone();
    if (normalizedPath === '/') url.pathname = '/dashboard';
    const response = normalizedPath === '/' ? NextResponse.redirect(url) : NextResponse.next();
    setDevCookies(response);
    return response;
  }
  if (isDev && normalizedPath === '/') {
    const url = request.nextUrl.clone();
    url.pathname = '/dashboard';
    return NextResponse.redirect(url);
  }
  if (!token) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('next', normalizedPath);
    return NextResponse.redirect(url);
  }
  if (!allowedRoles.has(role)) {
    const url = request.nextUrl.clone();
    url.pathname = '/forbidden';
    return NextResponse.rewrite(url);
  }
  return NextResponse.next();
}

export const config = { matcher: ['/((?!_next|favicon.ico|api).*)'] };
