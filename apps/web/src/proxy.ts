import { NextResponse, type NextRequest } from "next/server";

// Kiểm lạc quan: chưa có cookie phiên thì về màn đăng nhập. Phiên thật kiểm ở máy chủ (API, trang dựng ở máy chủ) —
// cookie còn mà phiên đã hết thì trang tự đưa về /dang-nhap.
const SESSION_COOKIES = ["qh.session_token", "__Secure-qh.session_token"];

export function proxy(request: NextRequest) {
  const hasSession = SESSION_COOKIES.some((name) => request.cookies.has(name));
  if (!hasSession && request.nextUrl.pathname !== "/dang-nhap") {
    return NextResponse.redirect(new URL("/dang-nhap", request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api/|_next/|favicon.ico).*)"],
};
