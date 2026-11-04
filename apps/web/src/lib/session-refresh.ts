import type { NextRequest, NextResponse } from "next/server";

/** Cookie phiên của better-auth (bản https thêm tiền tố `__Secure-`). */
export const SESSION_COOKIES = ["qh.session_token", "__Secure-qh.session_token"];

type InProcessApi = { request: (input: string, init?: RequestInit) => Response | Promise<Response> };

/**
 * Cookie trượt theo ngày dùng (ADR-0005 «Bổ sung 31/10»): trang dựng ở máy chủ đọc phiên trong tiến trình nên
 * `Set-Cookie` làm mới của better-auth không tới trình duyệt. Bước chặn đầu hỏi phiên trước khi trang dựng và chép
 * nguyên văn mọi `Set-Cookie` sang phản hồi — không dựng lại cookie, để giữ HttpOnly, SameSite, Secure.
 * better-auth chỉ trả `Set-Cookie` khi làm mới (quá một ngày) hay khi phiên đã hết.
 *
 * Ngoại lệ (hàng 38): phiên đã bị thu qua «Báo mất máy» thì KHÔNG chép lệnh xoá cookie — màn đăng nhập cần chính cookie
 * ấy để máy chủ xác nhận máy này bị báo rồi mới xoá kho trên máy (`nguoiCanXoa`). Cookie còn lại không mở được gì: phiên
 * đã thu, mọi lời gọi trả 401; đăng nhập lại thì cookie mới đè lên.
 */
export async function refreshSessionCookie(request: NextRequest, response: NextResponse, api: InProcessApi) {
  const cookie = request.headers.get("cookie");
  if (!cookie || !SESSION_COOKIES.some((name) => request.cookies.has(name))) return response;
  const res = await api.request("http://quy-hang.local/api/v1/auth/get-session", { headers: { cookie } });
  const setCookies = res.headers.getSetCookie();
  if (setCookies.length > 0 && (await res.json().catch(() => null)) === null && (await biBaoMat(api, cookie))) return response;
  for (const setCookie of setCookies) response.headers.append("set-cookie", setCookie);
  return response;
}

/** Phiên trong cookie mang dấu bị báo mất (API trả 401 `device_reported_lost`). */
async function biBaoMat(api: InProcessApi, cookie: string): Promise<boolean> {
  const r = await api.request("http://quy-hang.local/api/v1/me", { headers: { cookie } });
  if (r.status !== 401) return false;
  const b = (await r.json().catch(() => null)) as { error?: unknown } | null;
  return b?.error === "device_reported_lost";
}
