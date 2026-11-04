import type { Metadata } from "next";

import { getApi } from "@/lib/api";
import { docThan } from "./doc";
import { TrangKhachCongKhai } from "./trang";

// Trang khách `/s/<mã>` (hàng 35), khuôn «trang khách» (design/patterns/trang-khach.md): link công khai khách mở từ Zalo,
// không đăng nhập (proxy.ts mở `/s/`). Dữ liệu là bản ra của luật ẩn qua route công khai của API; không lưu đệm — giá và
// trạng thái sống.
export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Bộ căn", robots: { index: false, follow: false } };

export default async function Page({ params, searchParams }: { params: Promise<{ code: string }>; searchParams: Promise<{ can?: string }> }) {
  const { code } = await params;
  const { can } = await searchParams;
  const than = await docThan(code, (u, i) => getApi().request(u, i));
  const viTri = can != null && /^\d+$/.test(can) ? Number(can) : undefined;
  return <TrangKhachCongKhai code={code} than={than} can={viTri} />;
}
