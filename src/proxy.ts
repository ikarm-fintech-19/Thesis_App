import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = process.env.JWT_SECRET || 'development-secret-fallback';

const PUBLIC_ROUTES = ['/', '/login', '/pricing', '/contact', '/legal', '/support', '/api/auth/login', '/api/auth/register', '/api/calculate', '/api/declaration/calculate'];
const PROTECTED_DASHBOARD = '/dashboard';
const PROTECTED_API = '/api/';
const ADMIN_ROUTE = '/dashboard/admin';
const ADMIN_API_ROUTE = '/api/admin';

async function getVerifiedPayload(token: string): Promise<any | null> {
  try {
    const secret = new TextEncoder().encode(JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);
    return payload;
  } catch {
    return null;
  }
}

export async function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const token = request.cookies.get('matax_token')?.value;

  const isPublicRoute = PUBLIC_ROUTES.some(route => path === route || path.startsWith(route + '/'));
  const isApiRoute = path.startsWith(PROTECTED_API);
  const isDashboardRoute = path.startsWith(PROTECTED_DASHBOARD);
  const isAdminRoute = path.startsWith(ADMIN_ROUTE) || path.startsWith(ADMIN_API_ROUTE);

  if (isPublicRoute) {
    return NextResponse.next();
  }

  let payload: any = null;
  if (token) {
    payload = await getVerifiedPayload(token);
  }

  if (!token || !payload) {
    if (isApiRoute) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', path);
    return NextResponse.redirect(loginUrl);
  }

  if (isAdminRoute && payload?.role !== 'ADMIN') {
    if (isApiRoute) {
      return NextResponse.json({ error: 'Forbidden - Admin only' }, { status: 403 });
    }
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/api/user/:path*',
    '/api/declaration/:path*',
    '/api/calculate/:path*',
    '/api/accountant/:path*',
    '/api/admin/:path*',
    '/api/salary/:path*',
    '/api/ai/:path*',
    '/api/export-validation/:path*',
    '/api/tax-rules/:path*',
  ],
};
