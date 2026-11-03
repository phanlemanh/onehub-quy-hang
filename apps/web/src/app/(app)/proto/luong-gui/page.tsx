import { navigationFor } from "@quy-hang/core";
import { headers } from "next/headers";
import { notFound } from "next/navigation";

import { readMe } from "@/lib/api";
import { BaLoi } from "./ba-loi";

export const dynamic = "force-dynamic";

// Trang ba lối của Luồng Gửi (hàng 34, ADR-0019): chủ sản phẩm chọn lối ở Cổng Phạm vi. Dữ liệu mẫu, không gọi mạng.
// Không có lối vào trong điều hướng; chỉ vai có nhà Đã gửi (đầu khách); gỡ khi màn thật `/shares/new` ra.
export default async function Page({ searchParams }: { searchParams: Promise<{ loi?: string }> }) {
  const me = await readMe((await headers()).get("cookie") ?? "");
  if (!me?.activeCompany || !navigationFor(me.activeCompany.roles).homes.includes("shares")) notFound();
  const { loi } = await searchParams;
  return <BaLoi loi={loi === "trong-kho" || loi === "ve-moi" ? loi : "reui"} />;
}
