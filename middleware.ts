import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// 公开路由（不需要认证）
const publicRoutes = ['/login', '/register'];

// 认证路由（已登录用户不应访问）
const authRoutes = ['/login', '/register'];

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  const isPublicRoute = publicRoutes.includes(request.nextUrl.pathname);
  const isAuthRoute = authRoutes.includes(request.nextUrl.pathname);

  // 未登录用户访问受保护路由，重定向到登录页
  if (!token && !isPublicRoute) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // 已登录用户访问认证页面，重定向到首页
  if (token && isAuthRoute) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

// 配置需要中间件处理的路径
export const config = {
  matcher: [
    // 排除 API 路由、静态资源等
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};