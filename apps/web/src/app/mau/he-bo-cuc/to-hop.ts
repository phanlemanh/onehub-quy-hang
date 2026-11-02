import { BO_CUC, type KieuBoCuc } from "@/components/bo-cuc/ma-tran";
import type { LoiMenuTao } from "@/components/shell/menu-tao";

// Tổ hợp của trang mẫu sống (ADR-0024 quyết định 8): bảy bố cục × năm trạng thái × ba khổ, mỗi tổ hợp một địa chỉ để
// máy chụp. Khổ là bề rộng khung xem; trang xem tự dựng ở đúng bề rộng đó nên media query chạy như trên thiết bị thật.

export const TRANG_THAI_MAU = ["mac-dinh", "cho-tai", "rong", "loi", "ngoai-tuyen"] as const;
export type TrangThaiMau = (typeof TRANG_THAI_MAU)[number];

export const TEN_TRANG_THAI: Record<TrangThaiMau, string> = {
  "mac-dinh": "Mặc định",
  "cho-tai": "Chờ tải",
  rong: "Rỗng",
  loi: "Lỗi",
  "ngoai-tuyen": "Ngoại tuyến",
};

export const KHO_MAU = [1440, 1024, 375] as const;
export type KhoMau = (typeof KHO_MAU)[number];

export const TO_HOP = BO_CUC.flatMap((boCuc) =>
  TRANG_THAI_MAU.flatMap((trangThai) => KHO_MAU.map((kho) => ({ boCuc, trangThai, kho }))),
);

export type LoiDauMan = "reui" | "trong-kho" | "ve-moi";

export function diaChiXem(boCuc: KieuBoCuc, trangThai: TrangThaiMau, menuTao?: LoiMenuTao, dauMan?: LoiDauMan): string {
  const q = new URLSearchParams({ "bo-cuc": boCuc, "trang-thai": trangThai });
  if (menuTao) q.set("menu-tao", menuTao);
  if (dauMan) q.set("dau-man", dauMan);
  return `/mau/he-bo-cuc/xem?${q.toString()}`;
}

export function diaChiTrang(boCuc: KieuBoCuc, trangThai: TrangThaiMau, kho: KhoMau): string {
  return `/mau/he-bo-cuc?${new URLSearchParams({ "bo-cuc": boCuc, "trang-thai": trangThai, kho: String(kho) }).toString()}`;
}

const la = <T extends string>(ds: readonly T[], v: unknown, mac: T): T => (ds.includes(v as T) ? (v as T) : mac);

export function docToHop(q: Record<string, string | string[] | undefined>) {
  const mot = (k: string) => (Array.isArray(q[k]) ? q[k]?.[0] : q[k]);
  return {
    boCuc: la(BO_CUC, mot("bo-cuc"), "tran"),
    trangThai: la(TRANG_THAI_MAU, mot("trang-thai"), "mac-dinh"),
    kho: Number(la(KHO_MAU.map(String), mot("kho"), "1440")) as KhoMau,
    menuTao: la(["reui", "trong-kho", "ve-moi"] as const, mot("menu-tao"), "reui"),
    /** Chỉ cho trang ba lối của đầu màn (Hỏi-3 hàng 91). */
    dauMan: la(["reui", "trong-kho", "ve-moi"] as const, mot("dau-man"), "reui"),
  };
}
