import { notFound } from "next/navigation";

import { docVung } from "../_chung/du-lieu-mau";
import { KhungLeadCuaToi } from "../_chung/khung";
import { LeadDaNhap } from "./lead-da-nhap";

// Trang ba lối hàng 27 (ADR-0019), lối «ReUI» — khối đích `list-11`. Không có lối vào trong điều hướng; chỉ chạy ở máy
// dev; gỡ khi màn thật qua Cổng Bằng chứng. `?vung=trong|dang-tai|loi` mở ba trạng thái vùng.
export default async function Page({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  if (process.env.NODE_ENV === "production") notFound();
  const vung = docVung((await searchParams).vung);
  return (
    <KhungLeadCuaToi>
      <LeadDaNhap key={vung} vung={vung} />
    </KhungLeadCuaToi>
  );
}
