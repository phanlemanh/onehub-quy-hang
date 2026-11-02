import { navigationFor } from "@quy-hang/core";
import { headers } from "next/headers";
import { notFound } from "next/navigation";

import { readMe } from "@/lib/api";
import { KhungBangHang } from "../khung";
import { KhungHoSoCan } from "../../units/ho-so/khung";
import { BanMau, type TrangThaiMau } from "./ban-mau";

export const dynamic = "force-dynamic";

const TT: TrangThaiMau[] = ["chua-co", "ma-rong", "trung-can", "dang-luu", "da-gan"];

// Bản bấm được của hàng dien-ma-can-cho-hang (Hỏi-4): hồ sơ của hàng chưa có mã căn, ô «Mã căn» và nút lưu GIẢ — chưa nối
// máy chủ. Đặt dưới /inventory (không phải /proto) để vỏ nhận nhà Bảng hàng và hiện cột thứ hai như màn thật. Không có lối
// vào trong điều hướng; chỉ vai có Bảng hàng; gỡ khi màn thật ra.
export default async function Page({ searchParams }: { searchParams: Promise<{ tt?: string }> }) {
  const me = await readMe((await headers()).get("cookie") ?? "");
  if (!me?.activeCompany || !navigationFor(me.activeCompany.roles).homes.includes("inventory")) notFound();
  const { tt } = await searchParams;
  const dau = TT.find((t) => t === tt) ?? "chua-co";
  return (
    <>
      {/* Máy tính: hồ sơ là cột phải của Bảng hàng. Điện thoại: hồ sơ toàn màn như /units/<mã>. */}
      <div className="hidden md:contents">
        <KhungBangHang title="Bảng hàng">
          <BanMau dau={dau} cot />
        </KhungBangHang>
      </div>
      <div className="md:hidden">
        <KhungHoSoCan>
          <BanMau dau={dau} />
        </KhungHoSoCan>
      </div>
    </>
  );
}
