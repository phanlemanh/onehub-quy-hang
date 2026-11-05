import { navigationFor } from "@quy-hang/core";
import { headers } from "next/headers";
import { notFound } from "next/navigation";

import { readMe } from "@/lib/api";
import { KhungHoSoCan } from "../../units/ho-so/khung";
import { BaLoi, type Loi, type Vai } from "./ba-loi";

export const dynamic = "force-dynamic";

// Trang ba lối của Hồ sơ căn trên điện thoại (khổ < 768 px, ADR-0019, hồ sơ ho-so-dien-thoai-product-detail-5): chủ kho
// chọn lối ở Cổng Phạm vi. `?loi=trong-kho|reui|ve-moi`, `?vai=dau-khach|dau-chu` (nút chính dính đáy). Không có lối
// vào trong điều hướng; chỉ vai có Bảng hàng; gỡ khi màn thật ra.
export default async function Page({ searchParams }: { searchParams: Promise<{ loi?: string; vai?: string }> }) {
  const me = await readMe((await headers()).get("cookie") ?? "");
  if (!me?.activeCompany || !navigationFor(me.activeCompany.roles).homes.includes("inventory")) notFound();
  const { loi, vai } = await searchParams;
  const chonLoi: Loi = loi === "trong-kho" || loi === "ve-moi" ? loi : "reui";
  const chonVai: Vai = vai === "dau-chu" ? "dau-chu" : "dau-khach";
  return (
    <KhungHoSoCan>
      <BaLoi loi={chonLoi} vai={chonVai} />
    </KhungHoSoCan>
  );
}
