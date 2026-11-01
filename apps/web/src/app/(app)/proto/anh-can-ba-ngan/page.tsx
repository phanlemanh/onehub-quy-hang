import { navigationFor } from "@quy-hang/core";
import { headers } from "next/headers";
import { notFound } from "next/navigation";

import { readMe } from "@/lib/api";
import { KhungHoSoCan } from "../../units/ho-so/khung";
import { MauAnh } from "./mau-anh";

export const dynamic = "force-dynamic";

// Trang bấm được của mục Ảnh (hàng 18, design-pass): ảnh giữ trong bộ nhớ trang, không gọi API ảnh. `?vai=khac` xem như
// thành viên không giữ căn. Không có lối vào trong điều hướng; chỉ vai có Bảng hàng; gỡ khi màn thật qua Cổng Bằng chứng.
export default async function Page({ searchParams }: { searchParams: Promise<{ vai?: string }> }) {
  const me = await readMe((await headers()).get("cookie") ?? "");
  if (!me?.activeCompany || !navigationFor(me.activeCompany.roles).homes.includes("inventory")) notFound();
  const { vai } = await searchParams;
  return (
    <KhungHoSoCan>
      <MauAnh giuCan={vai !== "khac"} />
    </KhungHoSoCan>
  );
}
