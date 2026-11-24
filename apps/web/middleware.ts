import { NextResponse, type NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  if (!request.nextUrl.pathname.startsWith('/admin')) return NextResponse.next();
  const user = process.env.ADMIN_USER;
  const pass = process.env.ADMIN_PASSWORD;
  if (!user || !pass) {
    return new NextResponse('Admin login is not configured. Set ADMIN_USER and ADMIN_PASSWORD.', { status: 503 });
  }
  const header = request.headers.get('authorization') ?? '';
  const expected = `Basic ${btoa(`${user}:${pass}`)}`;
  if (header !== expected) {
    return new NextResponse('Sign in', {
      status: 401,
      headers: { 'WWW-Authenticate': 'Basic realm="Crossings admin"' },
    });
  }
  return NextResponse.next();
}

export const config = { matcher: ['/admin/:path*'] };
