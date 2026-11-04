import { notFound } from "next/navigation";

import { KhungNhap } from "../../imports/khung";
import { BaLoi } from "./ba-loi";

// Trang ba lối của design-pass hàng man-nhap-excel: ?loi=trong-kho|reui|ve-moi. Không có lối vào trong điều hướng; chỉ
// chạy ở máy dev; gỡ khi màn thật qua Cổng Bằng chứng.
export default async function Page({ searchParams }: { searchParams: Promise<{ loi?: string }> }) {
  if (process.env.NODE_ENV === "production") notFound();
  const { loi = "reui" } = await searchParams;
  return (
    <KhungNhap>
      <BaLoi loi={loi} />
    </KhungNhap>
  );
}
