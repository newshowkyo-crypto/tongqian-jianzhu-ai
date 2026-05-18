import { NextResponse, type NextRequest } from 'next/server';

const publicPaths = ['/login', '/forbidden'];
const allowedRoles = new Set(['owner', 'employee', 'platform_owner']);

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  if (publicPaths.some((path) => pathname === path || pathname.startsWith(`${path}/`))) {
    return NextResponse.next();
  }

  const token = request.cookies.get('tq_auth_token')?.value;
  if (!token) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('next', pathname);
    return NextResponse.redirect(url);
  }

  const role = request.cookies.get('tq_role')?.value ?? '';
  if (!allowedRoles.has(role)) {
    const url = request.nextUrl.clone();
    url.pathname = '/forbidden';
    return NextResponse.rewrite(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next|favicon.ico|api).*)'],
};
