import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { TrangThai } from "@/components/trang-thai";
import { readMe } from "@/lib/api";
import { coQuyen } from "@/lib/nhap/trang-thai";

import { KhungNhap } from "../khung";
import { ManNhap } from "./man-nhap";

export const dynamic = "force-dynamic";

// Nhập Excel (hàng man-nhap-excel), dựng qua khuôn KhungNhap (design/patterns/nhap-excel.md). Vai có nút «Nhập Excel» ở
// bảng vai của lõi mới nhập được; API chặn lại cùng luật.
export default async function Page() {
  const cookie = (await headers()).get("cookie") ?? "";
  const me = await readMe(cookie);
  if (!me) redirect("/login");
  if (me.companies.length === 0) redirect("/no-company");
  if (!me.activeCompany) redirect("/select-company");
  const vai = me.activeCompany.roles;
  if (!coQuyen(vai)) {
    return (
      <KhungNhap>
        <TrangThai kind="notice" title="Chỉ Đầu chủ và Trưởng nhóm nhập được." description="Nhờ đầu chủ của căn nhập tệp bảng hàng." />
      </KhungNhap>
    );
  }
  return (
    <KhungNhap>
      <ManNhap vai={vai} />
    </KhungNhap>
  );
}
