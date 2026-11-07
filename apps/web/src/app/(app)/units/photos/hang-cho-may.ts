"use client";

// Hàng chờ ảnh của người đang đăng nhập trên máy này (hàng 41 chup-anh-dien-thoai): MỘT bản cho cả app, sống ngoài mọi
// thành phần — đóng ngăn chụp hay rời hồ sơ vẫn tải tiếp (AC-3). Vỏ (`lib/sync/react.tsx`) khởi động nó khi người đăng
// nhập, dừng và xoá kho khi đăng xuất. Thử lại khi trình duyệt báo có mạng và theo nhịp 15 giây của bộ đồng bộ.
import { useEffect, useRef, useSyncExternalStore } from "react";

import { datTruocKhiXoaKho } from "@/lib/sync/kho-indexeddb";
import { dongHoThat } from "@/lib/sync/mang";
import { noiNhip, taoHangCho, theoDoiDaTai, type AnhCho, type HangCho } from "./hang-cho-anh";
import { taoKhoAnhCho } from "./kho-anh-cho";
import { nguonApi } from "./nguon-api";

type Ban = { userId: string; hang: HangCho; dung: () => void; san: { id: string } };
let ban: Ban | null = null;
const ngheBan = new Set<() => void>();
const doiBan = (b: Ban | null) => {
  ban = b;
  ngheBan.forEach((f) => f());
};

/**
 * Khởi động hàng chờ của người ở sàn đang mở (mở app, đăng nhập lại, đổi sàn): dựng lại từ kho trên máy rồi tải tiếp. Cùng
 * người đổi sàn thì giữ hàng, chỉ đổi sàn — ảnh của sàn kia nằm chờ, ảnh của sàn này tải tiếp (bất biến 2).
 */
export function khoiDongHangCho(userId: string, companyId: string): HangCho {
  if (ban?.userId === userId) {
    if (ban.san.id !== companyId) {
      ban.san.id = companyId;
      doiBan(ban);
      void ban.hang.day();
    }
    return ban.hang;
  }
  // Đổi người trên cùng máy: hàng của người trước dừng hẳn — không lấy ảnh kế để gửi bằng phiên người mới, không ghi kho cũ
  // (AC-4, AC-6).
  if (ban) {
    ban.dung();
    void ban.hang.dung();
  }
  const san = { id: companyId };
  const hang = taoHangCho({
    san: () => san.id,
    // Mọi lời gọi mang sàn lúc chụp: máy chủ từ chối khi phiên đang ở sàn khác (bất biến 2), không chỉ máy khách tự chặn.
    gui: ({ id, san, toa, ma, ngan, tep }) => nguonApi(toa, ma, fetch, san).them(tep, ngan, id),
    daCo: async ({ san, toa, ma, id }) => (await nguonApi(toa, ma, fetch, san).danhSach()).anh.some((p) => p.id === id),
    kho: taoKhoAnhCho(userId),
    onLine: () => navigator.onLine,
    xem: (b) => URL.createObjectURL(b),
  });
  const nhip = noiNhip(hang, dongHoThat);
  const online = () => nhip.quayLaiTrang();
  window.addEventListener("online", online);
  doiBan({
    userId,
    hang,
    san,
    dung: () => {
      nhip.dung();
      window.removeEventListener("online", online);
    },
  });
  // Lỗi mở kho không nuốt: hàng chờ đặt `khoLoi`, ngăn chụp báo ảnh chỉ còn trong bộ nhớ (AC-4).
  void hang.khoiDong();
  return hang;
}

/**
 * Dừng hàng chờ, chờ lệnh vào kho đang dở xong. Gọi trước MỌI lần xoá kho của người (đăng ký ở `xoaKhoCuaNguoi`);
 * `userId` cho trước thì chỉ dừng khi hàng đang chạy là của chính người ấy.
 */
export async function dungHangCho(userId?: string): Promise<void> {
  const b = ban;
  if (!b || (userId !== undefined && b.userId !== userId)) return;
  b.dung();
  doiBan(null);
  // Lượt tải đang bay không được ghi lại vào kho sắp xoá (AC-6).
  await b.hang.dung();
}

datTruocKhiXoaKho((u) => dungHangCho(u));

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

// Ảnh của sàn đang mở thôi: căn trùng toà + mã ở sàn khác không hiện ảnh chờ của sàn này.
let nho: { ds: AnhCho[]; san: string; ra: AnhCho[] } | null = null;
const anhCuaSan = (): AnhCho[] => {
  if (!ban) return KHONG;
  const ds = ban.hang.anh();
  if (nho?.ds !== ds || nho.san !== ban.san.id) nho = { ds, san: ban.san.id, ra: ds.filter((a) => a.san === ban!.san.id) };
  return nho.ra;
};

export function useHangCho(): AnhCho[] {
  return useSyncExternalStore(ngheHang, anhCuaSan, () => KHONG);
}

/** Trạng thái của hàng chờ cho ngăn chụp: có hàng chờ không, kho trên máy có giữ được không. */
export function useTinhHangCho(): "co" | "khong-co" | "kho-loi" {
  return useSyncExternalStore(ngheHang, () => (!ban ? "khong-co" : ban.hang.khoLoi() ? "kho-loi" : "co"), () => "co");
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
