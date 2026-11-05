"use client";

// Hàng chờ ảnh của người đang đăng nhập trên máy này (hàng 41 chup-anh-dien-thoai): MỘT bản cho cả app, sống ngoài mọi
// thành phần — đóng ngăn chụp hay rời hồ sơ vẫn tải tiếp (AC-3). Vỏ (`lib/sync/react.tsx`) khởi động nó khi người đăng
// nhập, dừng và xoá kho khi đăng xuất. Thử lại khi trình duyệt báo có mạng và theo nhịp 15 giây của bộ đồng bộ.
import { useEffect, useRef, useSyncExternalStore } from "react";

import { dongHoThat, taoNhip } from "@/lib/sync/mang";
import { taoHangCho, theoDoiDaTai, type AnhCho, type HangCho } from "./hang-cho-anh";
import { taoKhoAnhCho } from "./kho-anh-cho";
import { nguonApi } from "./nguon-api";

type Ban = { userId: string; hang: HangCho; dung: () => void };
let ban: Ban | null = null;
const ngheBan = new Set<() => void>();
const doiBan = (b: Ban | null) => {
  ban = b;
  ngheBan.forEach((f) => f());
};

/** Khởi động hàng chờ của người (mở app, đăng nhập lại): dựng lại từ kho trên máy rồi tải tiếp. */
export function khoiDongHangCho(userId: string): HangCho {
  if (ban?.userId === userId) return ban.hang;
  ban?.dung();
  const hang = taoHangCho({
    gui: ({ id, toa, ma, ngan, tep }) => nguonApi(toa, ma).them(tep, ngan, id),
    daCo: async ({ toa, ma, id }) => (await nguonApi(toa, ma).danhSach()).anh.some((p) => p.id === id),
    kho: taoKhoAnhCho(userId),
    onLine: () => navigator.onLine,
    xem: (b) => URL.createObjectURL(b),
  });
  const nhip = taoNhip({ dongHo: dongHoThat, thu: hang.day, coCho: hang.coCho });
  const online = () => nhip.quayLaiTrang();
  window.addEventListener("online", online);
  doiBan({
    userId,
    hang,
    dung: () => {
      nhip.dung();
      window.removeEventListener("online", online);
    },
  });
  void hang.khoiDong().catch(() => {});
  return hang;
}

/** Đăng xuất: dừng hàng chờ, chờ lệnh vào kho đang dở xong (rồi người gọi xoá kho). */
export async function dungHangCho(): Promise<void> {
  const b = ban;
  if (!b) return;
  b.dung();
  doiBan(null);
  await b.hang.choKho();
}

export const hangChoHienTai = (): HangCho | null => ban?.hang ?? null;

const KHONG: AnhCho[] = [];
const ngheHang = (f: () => void) => {
  let thoi = ban?.hang.subscribe(f);
  const doi = () => {
    thoi?.();
    thoi = ban?.hang.subscribe(f);
    f();
  };
  ngheBan.add(doi);
  return () => {
    ngheBan.delete(doi);
    thoi?.();
  };
};

export function useHangCho(): AnhCho[] {
  return useSyncExternalStore(ngheHang, () => ban?.hang.anh() ?? KHONG, () => KHONG);
}

/** Hàng chờ đang chạy, nhìn qua lúc đổi người (đăng xuất rồi đăng nhập người khác). */
const hangDangChay = { subscribe: ngheHang, soDaTai: (toa: string, ma: string) => ban?.hang.soDaTai(toa, ma) ?? 0 };

/**
 * Ảnh lớn đầu hồ sơ và mục Ảnh: một ảnh của căn này vừa lên máy chủ thì đọc lại danh sách đúng một lần (AC-8); căn khác
 * không đọc lại.
 */
export function useDocLaiKhiDaTai(toa: string, ma: string | null, docLai: () => void) {
  const f = useRef(docLai);
  useEffect(() => {
    f.current = docLai;
  });
  useEffect(() => {
    if (!ma) return;
    return theoDoiDaTai(hangDangChay, toa, ma, () => f.current());
  }, [toa, ma]);
}
