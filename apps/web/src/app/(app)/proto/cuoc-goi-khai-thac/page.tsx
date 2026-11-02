import { headers } from "next/headers";
import { notFound } from "next/navigation";

import { readMe } from "@/lib/api";
import { KhungCuocGoi } from "../../units/call/khung";
import { BaLoi } from "./ba-loi";

export const dynamic = "force-dynamic";

// Trang ba lối của Chế độ cuộc gọi khai thác (hàng 28, ADR-0019): chủ sản phẩm chọn lối ở Cổng Phạm vi. Dữ liệu mẫu, nút
// chỉ đổi trạng thái cục bộ. Không có lối vào trong điều hướng; chỉ vai Đầu chủ; gỡ khi màn thật ra.
export default async function Page({ searchParams }: { searchParams: Promise<{ loi?: string }> }) {
  const me = await readMe((await headers()).get("cookie") ?? "");
  if (!me?.activeCompany?.roles.includes("listing_agent")) notFound();
  const { loi } = await searchParams;
  return (
    <KhungCuocGoi>
      <BaLoi loi={loi === "trong-kho" || loi === "reui" ? loi : "ve-moi"} />
    </KhungCuocGoi>
  );
}
