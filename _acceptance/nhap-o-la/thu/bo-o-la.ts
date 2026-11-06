/**
 * Bộ ô lạ có đáp án của hàng 69 (AC-8, E8): một bảng sinh tất định, chữ ô viết tay theo bốn nhóm — giá dải, giá và phí về
 * tay, trạng thái lạ, và ô đối chứng không có cách đọc chắc nào («thương lượng»). Mỗi dòng mang đúng MỘT ô lạ; ô còn lại
 * của dòng đọc được ngay. Cột Chủ nhà, SĐT mang giá trị mồi (`CAM_LO`) để đo rò nguồn trên gói. Không dữ liệu thật.
 */
import type { Grid } from "../../../packages/core/src/import/grid";
import type { StandardStatus } from "../../../packages/core/src/listing/status";

export type DapAn =
  | { loai: "dai"; tu: number; den: number }
  | { loai: "ve-tay"; veTay: number }
  | { loai: "phi-ve-tay" }
  | { loai: "trang-thai"; chap: StandardStatus[] }
  | { loai: "doi-chung" };
export type NhomO = "dai" | "ve-tay" | "trang-thai" | "doi-chung";
export type OCo = { cot: "gia" | "phi" | "trangThai"; chu: string; nhom: NhomO; dapAn: DapAn };

const TY = 1_000_000_000;
export const TIEU_DE = ["Toà", "Mã căn", "Giá (tỷ)", "Phí", "Trạng thái", "Chủ nhà", "SĐT chủ"] as const;
export const CHI_SO = { gia: 2, phi: 3, trangThai: 4 } as const;
export const CAM_LO = ["[Tên] mồi ô lạ", "0900 000 069", "0900000069"];

const dai = (chu: string, tu: number, den: number): OCo => ({ cot: "gia", chu, nhom: "dai", dapAn: { loai: "dai", tu: tu * TY, den: den * TY } });
const veTay = (chu: string, x: number): OCo => ({ cot: "gia", chu, nhom: "ve-tay", dapAn: { loai: "ve-tay", veTay: Math.round(x * TY) } });
const phiVeTay = (chu: string): OCo => ({ cot: "phi", chu, nhom: "ve-tay", dapAn: { loai: "phi-ve-tay" } });
const tt = (chu: string, ...chap: StandardStatus[]): OCo => ({ cot: "trangThai", chu, nhom: "trang-thai", dapAn: { loai: "trang-thai", chap } });
const dc = (cot: OCo["cot"], chu: string): OCo => ({ cot, chu, nhom: "doi-chung", dapAn: { loai: "doi-chung" } });

export const O_LA: readonly OCo[] = [
  dai("4.6–4.8 tỷ", 4.6, 4.8),
  dai("4,6 - 4,8", 4.6, 4.8),
  dai("4.6 đến 4.8 tỷ", 4.6, 4.8),
  dai("4600~4800tr", 4.6, 4.8),
  dai("3,2-3,5 tỷ", 3.2, 3.5),
  dai("5 – 5,5 tỷ", 5, 5.5),
  dai("2.9~3.1 tỷ", 2.9, 3.1),
  dai("6,2 đến 6,5", 6.2, 6.5),
  veTay("thu về 4.2", 4.2),
  veTay("chủ thu về 3,95 tỷ", 3.95),
  veTay("về tay 5 tỷ", 5),
  veTay("thu ve 2.8", 2.8),
  veTay("chủ nhận về tay 3.6 tỷ", 3.6),
  veTay("thu về 6,1 tỷ", 6.1),
  phiVeTay("thu về"),
  phiVeTay("chủ thu về"),
  tt("đang đàm phán", "Pending"),
  tt("giữ chỗ", "Pending"),
  tt("hết hàng", "Closed"),
  tt("đã sang tên", "Closed"),
  tt("còn trống", "Active"),
  tt("đang chào bán", "Active"),
  tt("tạm dừng bán", "Hold"),
  tt("chủ không bán nữa", "Withdrawn"),
  dc("gia", "thương lượng"),
  dc("gia", "liên hệ"),
  dc("gia", "thỏa thuận"),
  dc("trangThai", "xem ghi chú"),
];

/** Lưới của bộ: mỗi ô lạ một dòng; ô khác của dòng đọc được ngay. */
export function luoiOLa(): Grid {
  const g: Grid = [[...TIEU_DE]];
  for (const [i, o] of O_LA.entries()) {
    const r: (string | number | null)[] = ["Toà A", `A-${String(1001 + i)}`, "4 tỷ", "BP", "Đang bán", CAM_LO[0]!, CAM_LO[1]!];
    r[CHI_SO[o.cot]] = o.chu;
    g.push(r);
  }
  return g;
}
