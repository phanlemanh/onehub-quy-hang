// Phần thuần của tab Tôi (hàng 38): nhóm dòng theo thứ tự hợp đồng, trạng thái cài, dòng thông báo, dòng máy đang đăng
// nhập. Màn chỉ dựng những gì các hàm này trả — bài kiểm gọi thẳng chúng.
import type { TrangThaiThietBi } from "@/lib/push/dang-ky";
import { NHAN_THONG_BAO, type TrangThaiDaBiet } from "@/lib/push/nhan";

export type MaNhom = "ho-so" | "san" | "cai" | "thong-bao" | "may" | "dang-xuat";
export type NhomDong = { ma: MaNhom; nhan: string; doiSan?: boolean };

const NHAN_NHOM: Readonly<Record<MaNhom, string>> = {
  "ho-so": "Hồ sơ",
  san: "Sàn",
  cai: "Cài lên màn hình chính",
  "thong-bao": "Thông báo lead",
  may: "Máy đang đăng nhập",
  "dang-xuat": "Đăng xuất",
};
const THU_TU: readonly MaNhom[] = ["ho-so", "san", "cai", "thong-bao", "may", "dang-xuat"];

/** Sáu nhóm dòng, cùng thứ tự cho mọi vai và mọi thiết bị; «Đổi sàn» khi người thuộc từ hai sàn. */
export function nhomDong(me: { companies: readonly unknown[] }): NhomDong[] {
  return THU_TU.map((ma) => (ma === "san" ? { ma, nhan: NHAN_NHOM[ma], doiSan: me.companies.length >= 2 } : { ma, nhan: NHAN_NHOM[ma] }));
}

export type TrangThaiCai = "da-cai" | "co-nut" | "ios-ba-buoc" | "khac";

/** Thứ tự xét: đã cài thắng mọi điều (kể cả iPhone); trình duyệt đã mời cài; iPhone/iPad chưa cài; còn lại. */
export function phanLoaiCai(d: { daCai: boolean; coLoiMoi: boolean; ios: boolean }): TrangThaiCai {
  if (d.daCai) return "da-cai";
  if (d.coLoiMoi) return "co-nut";
  if (d.ios) return "ios-ba-buoc";
  return "khac";
}

export const NHAN_CAI: Readonly<Record<TrangThaiCai, string>> = {
  "da-cai": "Đã cài",
  "co-nut": "Cài Quỹ hàng lên màn hình chính",
  "ios-ba-buoc": "Cài bằng Safari",
  khac: "Mở bằng Chrome hay Safari để cài",
};

/** Dòng thông báo: cùng bảng chữ với dải bật ở Hôm nay; «chưa bật» có nút «Bật». */
export function dongThongBao(tt: TrangThaiThietBi): { nhan: string; coNut: boolean } | null {
  if (tt === "dang-kiem") return null;
  return { nhan: NHAN_THONG_BAO[tt as TrangThaiDaBiet], coNut: tt === "chua-bat" || tt === "loi-luu" };
}

export type TrangThaiMay =
  | { loai: "dang-doc" }
  | { loai: "loi" }
  | { loai: "mot-may" }
  | { loai: "nhieu-may"; co: number }
  | { loai: "dang-bao"; co: number }
  | { loai: "da-bao"; daThu: number };

/** Dòng máy đang đăng nhập: chỉ có nút «Báo mất máy» khi có từ hai máy. */
export function trangThaiDongMay(s: { dang: "doc" | "san" | "bao" | "xong" | "loi"; soMay: number; daThu?: number }): TrangThaiMay {
  if (s.dang === "doc") return { loai: "dang-doc" };
  if (s.dang === "loi") return { loai: "loi" };
  if (s.dang === "xong") return { loai: "da-bao", daThu: s.daThu ?? 0 };
  if (s.soMay <= 1) return { loai: "mot-may" };
  return s.dang === "bao" ? { loai: "dang-bao", co: s.soMay } : { loai: "nhieu-may", co: s.soMay };
}

export const coNutBaoMat = (t: TrangThaiMay) => t.loai === "nhieu-may" || t.loai === "dang-bao";
export const LOI_DA_BAO = (n: number) => `Đã đăng xuất ${n} máy khác`;
export const HOI_BAO_MAT = "Đăng xuất mọi máy khác và xoá dữ liệu Quỹ hàng trên các máy ấy?";
