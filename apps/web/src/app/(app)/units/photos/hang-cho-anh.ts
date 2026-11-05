// Hàng chờ ảnh chụp trên điện thoại (hàng 41 chup-anh-dien-thoai, bản bấm được của bước thiết kế). Ảnh chụp xong vào hàng
// chờ ngay — người không phải đứng đợi; máy tải lên ở nền theo thứ tự chụp, mất mạng thì ảnh nằm chờ và tự tải khi có mạng
// (nhịp thử của bộ đồng bộ, `lib/sync/mang.ts`). Tải đi đúng đường của mục Ảnh (`nguonApi`), nên quyền thêm ảnh và ẩn ngăn
// Nội bộ vẫn do API và luật theo dòng quyết.
// Bản này giữ hàng chờ trong bộ nhớ của trang; giữ qua lúc đóng app (IndexedDB) và mã ảnh chống trùng khi gửi lại là phần
// của bước dựng (hợp đồng AC-3, AC-4).
import type { Compartment } from "@quy-hang/core/photos";

import type { TepSanSang } from "./tai-len";

export type TrangThaiCho = "cho-mang" | "dang-tai" | "da-tai" | "loi";

export const NHAN_TRANG_THAI_CHO: Readonly<Record<TrangThaiCho, string>> = {
  "cho-mang": "Chờ mạng — tự tải khi có mạng",
  "dang-tai": "Đang tải lên…",
  "da-tai": "Đã tải lên",
  loi: "Không tải được — thử lại",
};

export type AnhCho = {
  key: string;
  toa: string;
  ma: string;
  ngan: Compartment;
  tep: TepSanSang;
  /** Đường xem bản nhẹ trên máy, trước khi máy chủ có ảnh. */
  xem: string;
  trangThai: TrangThaiCho;
};

export type GuiAnh = (o: { toa: string; ma: string; ngan: Compartment; tep: TepSanSang }) => Promise<void>;

/** Lỗi khi gửi: mất mạng (gửi lại ở nhịp sau) hay máy chủ không nhận (người thử lại). */
export const laMatMang = (e: unknown, onLine: boolean) => !onLine || e instanceof TypeError;

export function taoHangCho(o: { gui: GuiAnh; onLine: () => boolean; xem: (b: Blob) => string }) {
  let ds: AnhCho[] = [];
  const nghe = new Set<() => void>();
  const daTai = new Map<string, number>();
  let dangChay = false;
  const bao = () => nghe.forEach((f) => f());
  const dat = (key: string, trangThai: TrangThaiCho) => {
    ds = ds.map((a) => (a.key === key ? { ...a, trangThai } : a));
    bao();
  };

  async function day() {
    if (dangChay) return;
    dangChay = true;
    try {
      for (const a of ds) {
        if (a.trangThai !== "cho-mang") continue;
        if (!o.onLine()) return;
        dat(a.key, "dang-tai");
        try {
          await o.gui(a);
          const k = `${a.toa}|${a.ma}`;
          daTai.set(k, (daTai.get(k) ?? 0) + 1);
          dat(a.key, "da-tai");
        } catch (e) {
          dat(a.key, laMatMang(e, o.onLine()) ? "cho-mang" : "loi");
          if (laMatMang(e, o.onLine())) return;
        }
      }
    } finally {
      dangChay = false;
    }
  }

  return {
    subscribe(f: () => void) {
      nghe.add(f);
      return () => nghe.delete(f);
    },
    anh: () => ds,
    /** Số ảnh của căn đã lên máy chủ — ảnh lớn đầu hồ sơ đọc lại danh sách khi số này đổi. */
    soDaTai: (toa: string, ma: string) => daTai.get(`${toa}|${ma}`) ?? 0,
    them(toa: string, ma: string, ngan: Compartment, tep: TepSanSang) {
      ds = [...ds, { key: `${Date.now()}-${ds.length}`, toa, ma, ngan, tep, xem: o.xem(tep.thumb), trangThai: "cho-mang" }];
      bao();
      void day();
    },
    thuLai(key: string) {
      dat(key, "cho-mang");
      void day();
    },
    day,
  };
}

export type HangCho = ReturnType<typeof taoHangCho>;
