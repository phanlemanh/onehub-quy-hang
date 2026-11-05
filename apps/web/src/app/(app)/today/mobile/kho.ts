/**
 * Rẽ khổ của Hôm nay đầu chủ (hàng 39, AC-1): màn hỏi đúng hàm này để chọn thẻ điện thoại hay lưới máy tính — dưới
 * `MOC_DIEN_THOAI` (768 px, cùng mốc `md` của vỏ) là điện thoại. Bài kiểm gọi `khoCuaSo` và `ngheKho` với cửa sổ giả.
 */
import { useSyncExternalStore } from "react";
import { laDienThoai, MOC_DIEN_THOAI } from "./goi";

type CuaSoKho = {
  innerWidth: number;
  matchMedia: (q: string) => { addEventListener: (t: "change", f: () => void) => void; removeEventListener: (t: "change", f: () => void) => void };
};

/** Truy vấn khổ mà màn nghe: đổi qua mốc thì đọc lại. */
export const TRUY_VAN_DIEN_THOAI = `(max-width: ${MOC_DIEN_THOAI - 1}px)`;

/** Khổ hiện tại của cửa sổ: true là điện thoại. */
export const khoCuaSo = (w: Pick<CuaSoKho, "innerWidth">): boolean => laDienThoai(w.innerWidth);

/** Nghe đổi khổ; trả hàm gỡ. */
export function ngheKho(w: Pick<CuaSoKho, "matchMedia">, f: () => void): () => void {
  const m = w.matchMedia(TRUY_VAN_DIEN_THOAI);
  m.addEventListener("change", f);
  return () => m.removeEventListener("change", f);
}

/** Màn đang ở khổ điện thoại? Máy chủ dựng bản máy tính (false), trình duyệt đọc lại ngay khi gắn. */
export function useDienThoai(): boolean {
  return useSyncExternalStore(
    (f) => ngheKho(window, f),
    () => khoCuaSo(window),
    () => false,
  );
}
