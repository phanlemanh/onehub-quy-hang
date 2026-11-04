import { BaLoi } from "./ba-loi";

export const dynamic = "force-dynamic";

// Trang ba lối của Hôm nay của Trưởng nhóm (hàng 42, ADR-0019): chủ sản phẩm chọn lối ở Cổng Phạm vi. Dữ liệu mẫu, nút
// chỉ đổi trạng thái cục bộ, không gọi mạng. Không có lối vào trong điều hướng; gỡ khi màn thật qua Cổng Bằng chứng.
export default async function Page({ searchParams }: { searchParams: Promise<{ loi?: string }> }) {
  const { loi } = await searchParams;
  return <BaLoi loi={loi === "trong-kho" || loi === "ve-moi" ? loi : "reui"} />;
}
