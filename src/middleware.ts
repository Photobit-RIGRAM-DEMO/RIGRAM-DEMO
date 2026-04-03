import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // 모든 쿠키 확인
  // const cookies = request.cookies.getAll();
  const userType = request.cookies.get('userType')?.value;

  // 로그인되지 않은 경우
  if (!userType) {
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }

  // Admin 페이지 보호
  if (path.startsWith('/admin')) {
    if (userType !== 'admin') {
      return NextResponse.redirect(new URL('/404', request.url));
    }
  }

  // Student 페이지 보호
  if (path.startsWith('/student' )) {
    if (userType !== 'student' && userType !== 'admin') {
      return NextResponse.redirect(new URL('/404', request.url));
    }
  }

  return NextResponse.next();
}

// IMPORTANT: matcher 설정 확인
export const config = {
  matcher: [
    // Admin 관련 모든 경로
    '/admin/:path*',
    // Student 관련 모든 경로
    '/student/:path*',
  ],
};
