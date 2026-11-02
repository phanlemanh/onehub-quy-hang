import { headers } from "next/headers";
import { notFound } from "next/navigation";

import { readMe } from "@/lib/api";
import { KhungCuocGoi } from "../../units/call/khung";
import { EpGia } from "./ep-gia";

export const dynamic = "force-dynamic";

// Trang thử chế độ ép giá (hàng 29, design-pass): chủ sản phẩm nhìn hai cách xếp của Hỏi-1 ở Cổng Phạm vi. Dữ liệu mẫu,
// phím chỉ đổi trạng thái cục bộ. Không có lối vào trong điều hướng; chỉ vai Đầu chủ; gỡ khi màn thật ra.
export default async function Page({ searchParams }: { searchParams: Promise<{ "bo-cuc"?: string }> }) {
  const me = await readMe((await headers()).get("cookie") ?? "");
  if (!me?.activeCompany?.roles.includes("listing_agent")) notFound();
  const sp = await searchParams;
  return (
    <KhungCuocGoi>
      <EpGia boCuc={sp["bo-cuc"] === "ba-cot" ? "ba-cot" : "ho-so"} />
    </KhungCuocGoi>
  );
}
