/**
 * Xuất bảng hàng (hàng 43, bất biến 4, design §4): MỌI đầu ra — bài, bảng xem trước, Excel, ảnh, PDF — dựng từ một hàm
 * `xuatBang`, hàm này gọi `banRaNgoai` (cửa `phat_hang`) cho từng căn rồi chỉ đọc bản đã ẩn. Trang web chuyển dòng bảng
 * hàng sang `CanNoiBo` và chỉ vẽ `BanXuat`. Nhập qua `@quy-hang/core/export` — chạy được cả trong trình duyệt (không
 * nhập mô-đun Node nào).
 */
import { nhanTruong, tuVungRaNgoai, type TuVung } from "../labels";
import { banRaNgoai, CAU_HINH_MAC_DINH, truongRa, type CauHinhRa, type KhoaRa } from "../redaction/ban-ra";
import type { NguoiNhan } from "../redaction/cua-ra";
import type { CanNoiBo } from "../redaction/lop-truong";
import { baiFacebook, baiZalo } from "./bai";
import { chuCuaO, cotRa, type CotGocNhin } from "./cot";
import type { MauXuat } from "./mau";
import { bocBai, type MauBai } from "./mau-san";

export * from "./mau";
export * from "./cot";
export * from "./bai";
export * from "./mau-san";
export { chuCot, crc32, ghiXlsx, type OXlsx } from "./xlsx";
export { ghiPdf, type TrangJpeg } from "./pdf";

export type TuyChonXuat = {
  mau: MauXuat;
  nguoiNhan: NguoiNhan;
  cauHinh?: CauHinhRa;
  /** Cột đang hiện của góc nhìn, theo thứ tự góc nhìn. */
  cot: readonly CotGocNhin[];
  /** `YYYY-MM-DD` — lõi không đọc đồng hồ. */
  today: string;
  /** Dòng đầu của bài Facebook. */
  tenSan: string;
  /** Cách gọi riêng của sàn gửi (hàng 45) — lõi cắt về phần theo khoá ra của người nhận trước khi dùng. */
  tuVung?: TuVung;
  /** Mẫu bài theo kênh của sàn (#27) — lời mở đầu, lời kết quanh bài dựng sẵn. */
  mauBai?: MauBai;
};

export type BanXuat = {
  mau: MauXuat;
  nguoiNhan: NguoiNhan;
  soCan: number;
  /** Nhãn cột ra, theo thứ tự góc nhìn. */
  cot: string[];
  /** Khoá ra của từng cột (cùng thứ tự `cot`). */
  khoa: KhoaRa[];
  /** Chữ đã định dạng như bảng hàng; dòng theo thứ tự `can` truyền vào (quy sắp của góc nhìn). */
  dong: string[][];
  /** Nhãn cột của góc nhìn không ra ngoài — dòng «Cột không ra ngoài: …». */
  boQua: string[];
  /** Có khi mẫu là bài (Zalo, Facebook). */
  bai?: string;
};

export function xuatBang(can: readonly CanNoiBo[], tuy: TuyChonXuat): BanXuat {
  const cauHinh = tuy.cauHinh ?? CAU_HINH_MAC_DINH;
  const { ra, boQua } = cotRa(tuy.cot, tuy.nguoiNhan, cauHinh);
  const tv = tuVungRaNgoai(tuy.tuVung, truongRa(tuy.nguoiNhan, cauHinh));
  const dong = can.map((c) => {
    const ban = banRaNgoai(c, { cua: "phat_hang", nguoiNhan: tuy.nguoiNhan, cauHinh, today: tuy.today });
    return ra.map((cot) => chuCuaO(ban, cot.khoa, tv));
  });
  const bang: BanXuat = {
    mau: tuy.mau,
    nguoiNhan: tuy.nguoiNhan,
    soCan: can.length,
    cot: ra.map((c) => nhanTruong(tv, c.khoa, c.nhan)),
    khoa: ra.map((c) => c.khoa),
    dong,
    boQua,
  };
  if (tuy.mau === "post_zalo") bang.bai = bocBai(baiZalo(bang), tuy.mauBai?.zalo);
  else if (tuy.mau === "post_facebook") bang.bai = baiFacebook(bang, tuy.tenSan, tuy.mauBai?.facebook);
  return bang;
}
