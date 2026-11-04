// Lượt mở và lượt quan tâm của trang khách (hàng 35: AC-4, AC-5) — phần thuần, không React. Lượt mở gửi từ trình duyệt
// sau khi trang chạy (Zalo lấy ảnh xem trước không chạy mã trang nên không thành lượt mở — luật đợt 21).
import { SU_KIEN_LAN_GUI } from "@quy-hang/core/sharing";

export type Goi = (url: string, init: RequestInit) => Promise<{ ok: boolean; status: number }>;
export type KhoMay = { getItem(k: string): string | null; setItem(k: string, v: string): void };

const KHOA_MAY = "qh-ma-may";
const sinhMa = () => {
  const b = new Uint8Array(12);
  globalThis.crypto.getRandomValues(b);
  return btoa(String.fromCharCode(...b)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
};

/** Mã máy ngẫu nhiên giữ ở máy khách; kho ném lỗi (chế độ riêng tư) → mã tạm của lần mở này. */
export function maMay(kho: KhoMay | null): string {
  try {
    const co = kho?.getItem(KHOA_MAY);
    if (co && /^[A-Za-z0-9_-]{8,64}$/.test(co)) return co;
    const moi = sinhMa();
    kho?.setItem(KHOA_MAY, moi);
    return moi;
  } catch {
    return sinhMa();
  }
}

const duong = (code: string) => `/api/v1/public/shares/${code}/events`;
const than = (o: object): RequestInit => ({ method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(o), cache: "no-store" });

/** Báo một lượt mở — gọi bao nhiêu lần trong một phiên trang cũng chỉ gửi một lời. */
export function taoBaoMo(dep: { goi: Goi; kho: KhoMay | null; code: string }) {
  let daGui = false;
  return async () => {
    if (daGui) return;
    daGui = true;
    await dep.goi(duong(dep.code), than({ type: SU_KIEN_LAN_GUI.mo, visitor: maMay(dep.kho) })).catch(() => undefined);
  };
}

export type TrangThaiQuanTam = "chua" | "dang" | "da" | "loi";
export const NHAN_QUAN_TAM: Readonly<Record<TrangThaiQuanTam, string>> = {
  chua: "Quan tâm",
  dang: "Quan tâm",
  da: "Đã báo quan tâm",
  loi: "Chưa gửi được — thử lại",
};

/** Bấm «Quan tâm» một căn: khoá sau lần ghi được; lỗi mạng → «thử lại», bấm lại được. */
export function taoQuanTam(dep: { goi: Goi; kho: KhoMay | null; code: string; listingId: string; doi: (t: TrangThaiQuanTam) => void }) {
  let tt: TrangThaiQuanTam = "chua";
  const dat = (t: TrangThaiQuanTam) => {
    tt = t;
    dep.doi(t);
  };
  return async () => {
    if (tt === "da" || tt === "dang") return;
    dat("dang");
    try {
      const r = await dep.goi(duong(dep.code), than({ type: SU_KIEN_LAN_GUI.quanTam, listingId: dep.listingId, visitor: maMay(dep.kho) }));
      dat(r.ok ? "da" : "loi");
    } catch {
      dat("loi");
    }
  };
}
