import { NextResponse, type NextRequest } from "next/server";
import { getApi } from "./lib/api";
import { refreshSessionCookie, SESSION_COOKIES } from "./lib/session-refresh";

// Kiểm lạc quan: chưa có cookie phiên thì về màn đăng nhập. Phiên thật kiểm ở máy chủ (API, trang dựng ở máy chủ) —
// cookie còn mà phiên đã hết thì trang tự đưa về /login. Có cookie thì đặt lại nó khi phiên vừa trượt (ADR-0005).
export async function proxy(request: NextRequest) {
  const hasSession = SESSION_COOKIES.some((name) => request.cookies.has(name));
  if (!hasSession && request.nextUrl.pathname !== "/login") {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  if (!hasSession) return NextResponse.next();
  return refreshSessionCookie(request, NextResponse.next(), getApi());
}

export const config = {
  matcher: ["/((?!api/|_next/|favicon.ico).*)"],
};
