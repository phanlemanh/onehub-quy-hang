import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { TrangThai } from "@/components/trang-thai";
import { getApi, readMe } from "@/lib/api";
import { KhungLienHe } from "./khung";
import { CHU, trangDauLienHe } from "./lien-he";
import VungLienHe, { type TrangDau } from "./vung";
import { khoaLoc } from "./xem-them";

export const dynamic = "force-dynamic";

// Liên hệ (hàng 103), khuôn «Danh sách → chi tiết» (design/patterns/lien-he.md): đầu chủ thấy người mình giữ, trưởng nhóm cả
// sàn (ADR-0021 qđ 3). API chặn lại cùng luật.
export default async function Page({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const cookie = (await headers()).get("cookie") ?? "";
  const me = await readMe(cookie);
  if (!me) redirect("/login");
  if (!me.activeCompany) redirect("/select-company");
  const roles = me.activeCompany.roles ?? [];
  const duoc = roles.includes("listing_agent") || roles.includes("team_lead");
  if (duoc) {
    // Trang đầu đọc ngay ở máy chủ theo bộ lọc URL, trao cho vùng: bảng hiện cùng màn, không chờ một vòng sau khi dựng
    // (hàng khung-ho-so-lien-he). Đọc hỏng thì vùng tự đọc như trước.
    const sp = await searchParams;
    const mot = (v: string | string[] | undefined) => (typeof v === "string" ? v : "");
    const loc = { type: mot(sp.type), status: mot(sp.status) };
    const goi = (duong: string, init?: RequestInit) =>
      Promise.resolve(getApi().request(`http://quy-hang.local${duong}`, { ...init, headers: { cookie, ...(init?.headers ?? {}) } }));
    const kq = await trangDauLienHe(loc, goi).catch(() => null);
    const dau: TrangDau | null = kq ? { khoa: khoaLoc({ q: "", type: loc.type, status: loc.status, lan: 0 }), items: kq.items, nextCursor: kq.nextCursor } : null;
    return <VungLienHe dau={dau} />;
  }
  return (
    <KhungLienHe>
      <TrangThai kind="notice" title={CHU.khongVai} />
    </KhungLienHe>
  );
}
