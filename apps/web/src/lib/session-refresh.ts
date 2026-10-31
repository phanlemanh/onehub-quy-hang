import type { NextRequest, NextResponse } from "next/server";

/** Cookie phiên của better-auth (bản https thêm tiền tố `__Secure-`). */
export const SESSION_COOKIES = ["qh.session_token", "__Secure-qh.session_token"];

type InProcessApi = { request: (input: string, init?: RequestInit) => Response | Promise<Response> };

/**
 * Cookie trượt theo ngày dùng (ADR-0005 «Bổ sung 31/10»): trang dựng ở máy chủ đọc phiên trong tiến trình nên
 * `Set-Cookie` làm mới của better-auth không tới trình duyệt. Bước chặn đầu hỏi phiên trước khi trang dựng và chép
 * nguyên văn mọi `Set-Cookie` sang phản hồi — không dựng lại cookie, để giữ HttpOnly, SameSite, Secure.
 * better-auth chỉ trả `Set-Cookie` khi làm mới (quá một ngày) hay khi phiên đã hết.
 */
export async function refreshSessionCookie(request: NextRequest, response: NextResponse, api: InProcessApi) {
  const cookie = request.headers.get("cookie");
  if (!cookie || !SESSION_COOKIES.some((name) => request.cookies.has(name))) return response;
  const res = await api.request("http://quy-hang.local/api/v1/auth/get-session", { headers: { cookie } });
  for (const setCookie of res.headers.getSetCookie()) response.headers.append("set-cookie", setCookie);
  return response;
}
