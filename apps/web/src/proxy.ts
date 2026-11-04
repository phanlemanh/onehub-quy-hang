import { NextResponse, type NextRequest } from "next/server";
import { getApi } from "./lib/api";
import { refreshSessionCookie, SESSION_COOKIES } from "./lib/session-refresh";

// Kiểm lạc quan: chưa có cookie phiên thì về màn đăng nhập. Phiên thật kiểm ở máy chủ (API, trang dựng ở máy chủ) —
// cookie còn mà phiên đã hết thì trang tự đưa về /login. Có cookie thì đặt lại nó khi phiên vừa trượt (ADR-0005).
// Trang mẫu sống của hệ bố cục (ADR-0024 quyết định 8) mở không cần phiên: trang chỉ đọc dữ liệu mẫu, không gọi API.
// Bản chính thức (`VERCEL_ENV=production`) không mở nó (Hỏi-1 hàng 91).
const TRANG_MAU = "/mau/he-bo-cuc";

// Trang khách `/s/<mã>` (hàng 35) là link công khai khách mở từ Zalo — không đăng nhập, dữ liệu dựng từ luật ẩn của lõi.
const TRANG_KHACH = "/s/";

function moKhongPhien(path: string): boolean {
  if (path === "/login") return true;
  if (path.startsWith(TRANG_KHACH)) return true;
  if (process.env.VERCEL_ENV === "production") return false;
  return path === TRANG_MAU || path.startsWith(`${TRANG_MAU}/`);
}

// Service worker, manifest và biểu tượng (hàng 26) phải tải được khi chưa đăng nhập — trình duyệt tự xin chúng.
const TAI_KHONG_PHIEN = /^\/(sw\.js|manifest\.webmanifest|icons\/)/;

export async function proxy(request: NextRequest) {
  if (TAI_KHONG_PHIEN.test(request.nextUrl.pathname)) return NextResponse.next();
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
