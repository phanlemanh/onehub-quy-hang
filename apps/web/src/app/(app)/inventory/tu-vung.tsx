"use client";

// Cách gọi riêng của sàn trên Bảng hàng (hàng 45): trang đọc `GET /api/v1/company/labels` ở máy chủ, bọc màn bằng
// `TuVungProvider`; lưới, thẻ điện thoại, ô lọc, ô sửa và hộp phát hàng cùng đọc một từ vựng qua `useTuVung`.
import { createContext, useContext, type ReactNode } from "react";

import { TU_VUNG_RONG, type TuVung } from "@quy-hang/core/labels";

const TuVungCtx = createContext<TuVung>(TU_VUNG_RONG);

export function TuVungProvider({ tuVung, children }: { tuVung: TuVung; children: ReactNode }) {
  return <TuVungCtx.Provider value={tuVung}>{children}</TuVungCtx.Provider>;
}

export const useTuVung = () => useContext(TuVungCtx);
