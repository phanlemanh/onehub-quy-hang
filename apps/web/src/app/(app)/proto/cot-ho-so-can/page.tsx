import { navigationFor } from "@quy-hang/core";
import { headers } from "next/headers";
import { notFound } from "next/navigation";

import { KhaiDiaChi } from "@/components/shell/dia-chi-mau";
import { readMe } from "@/lib/api";
import { KhungHoSoCan } from "../../units/ho-so/khung";
import { BaLoi } from "./ba-loi";

export const dynamic = "force-dynamic";

// Trang ba lối của cột hồ sơ căn (hàng 17, ADR-0019): chủ sản phẩm chọn lối ở Cổng Phạm vi. Không có lối vào trong điều
// hướng; chỉ vai có Bảng hàng; gỡ khi màn thật ra.
export default async function Page({ searchParams }: { searchParams: Promise<{ loi?: string }> }) {
  const me = await readMe((await headers()).get("cookie") ?? "");
  if (!me?.activeCompany || !navigationFor(me.activeCompany.roles).homes.includes("inventory")) notFound();
  const { loi } = await searchParams;
  return (
    <KhungHoSoCan>
      <KhaiDiaChi duong="/units/A-01.02" />
      <BaLoi loi={loi === "trong-kho" || loi === "ve-moi" ? loi : "reui"} />
    </KhungHoSoCan>
  );
}
