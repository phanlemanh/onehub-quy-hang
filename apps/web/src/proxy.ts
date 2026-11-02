import { NextResponse, type NextRequest } from "next/server";
import { getApi } from "./lib/api";
import { refreshSessionCookie, SESSION_COOKIES } from "./lib/session-refresh";

// Kiểm lạc quan: chưa có cookie phiên thì về màn đăng nhập. Phiên thật kiểm ở máy chủ (API, trang dựng ở máy chủ) —
// cookie còn mà phiên đã hết thì trang tự đưa về /login. Có cookie thì đặt lại nó khi phiên vừa trượt (ADR-0005).
// Trang mẫu sống của hệ bố cục (ADR-0024 quyết định 8) mở không cần phiên: trang chỉ đọc dữ liệu mẫu, không gọi API.
export const MO_KHONG_PHIEN = ["/login", "/mau/he-bo-cuc"];

const moKhongPhien = (path: string) => MO_KHONG_PHIEN.some((p) => path === p || path.startsWith(`${p}/`));

export async function proxy(request: NextRequest) {
  const hasSession = SESSION_COOKIES.some((name) => request.cookies.has(name));
  if (!hasSession && !moKhongPhien(request.nextUrl.pathname)) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  if (!hasSession) return NextResponse.next();
  return refreshSessionCookie(request, NextResponse.next(), getApi());
}

export const config = {
  matcher: ["/((?!api/|_next/|favicon.ico).*)"],
};
