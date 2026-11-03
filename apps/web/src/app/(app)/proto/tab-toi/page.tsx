import { KhungToi } from "../../me/khung";
import { BaLoiToi } from "./ba-loi";

export const dynamic = "force-dynamic";

// Trang ba lối của tab Tôi (hàng 38, ADR-0019): chủ sản phẩm chọn lối. Dữ liệu mẫu, nút chỉ đổi trạng thái cục bộ, không
// gọi mạng. Không có lối vào trong điều hướng; gỡ khi màn thật qua Cổng Bằng chứng.
export default async function Page({ searchParams }: { searchParams: Promise<{ loi?: string; may?: string }> }) {
  const { loi, may } = await searchParams;
  return (
    <KhungToi>
      <BaLoiToi loi={loi === "trong-kho" || loi === "ve-moi" ? loi : "reui"} motMay={may === "1"} />
    </KhungToi>
  );
}
