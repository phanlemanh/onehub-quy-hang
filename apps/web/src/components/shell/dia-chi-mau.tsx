"use client";

import { duongCuaVo, type DuongVo } from "@quy-hang/core";
import { usePathname, useSearchParams } from "next/navigation";
import { createContext, useContext, useLayoutEffect } from "react";

// Bản mẫu khai màn thật nó đứng thay; vỏ đọc địa chỉ ấy (hàng ban-mau-khai-dia-chi). Màn thật không khai, nên mọi chỗ dưới
// đây trả đúng đường và tham số thật.

type GiaTri = { khai: string | null; mau: boolean; datKhai: (duong: string | null) => void };

export const NguCanhDiaChi = createContext<GiaTri>({ khai: null, mau: false, datKhai: () => {} });

/** Đường vỏ đọc. Không đọc tham số để vỏ không buộc trang tĩnh phải dựng ở trình duyệt. */
export function useDuongVo(): string {
  const { khai, mau } = useContext(NguCanhDiaChi);
  return duongCuaVo({ pathname: usePathname(), khai, mau }).duong;
}

/** Đường và tham số vỏ đọc — cho mục sáng của cột thứ hai. */
export function useDuongVoDayDu(): DuongVo {
  const { khai, mau } = useContext(NguCanhDiaChi);
  return duongCuaVo({ pathname: usePathname(), thamSo: useSearchParams().toString(), khai, mau });
}

/** Trang trong khu bản mẫu đặt thành phần này, với `duong` là chuỗi cố định (bộ quét bản đồ khuôn đọc giá trị ấy). */
export function KhaiDiaChi({ duong }: { duong: string }) {
  const { datKhai } = useContext(NguCanhDiaChi);
  useLayoutEffect(() => {
    datKhai(duong);
    return () => datKhai(null);
  }, [duong, datKhai]);
  return null;
}
