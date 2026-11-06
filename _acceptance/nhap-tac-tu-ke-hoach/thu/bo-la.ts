/**
 * Bộ file mẫu LẠ của hàng 68 — đo nền tất định (không AI) trên mẫu file máy chưa từng thấy, để Cổng Phạm vi biết có gác
 * hàng tác tử không (ADR-0011 quyết định 7: «nền đạt mọi ngưỡng thì không dựng tác tử»).
 *
 * «Lạ» định nghĩa bằng máy: MỌI tiêu đề của file nằm ngoài từ điển tiêu đề dựng sẵn (`lookupHeader` trả null) — đúng
 * tình huống «sàn khác, cách gọi khác» mà bộ thử hàng 64 không có (bộ ấy dựng từ chính các cách gọi từ điển đã biết).
 * Dữ liệu và đáp án lấy nguyên từ hai file mẫu sạch của hàng 5 (`sinh.ts`): chỉ đổi dòng tiêu đề, nên mọi chênh số đo so
 * với hai file mẫu là do tiêu đề lạ, không do bẩn trong ô. Chỉ dữ liệu mẫu, không dữ liệu thật.
 */
import { lookupHeader } from "../../../packages/core/src/import/headers";
import type { Grid } from "../../../packages/core/src/import/grid";
import type { ImportContext } from "../../../packages/core/src/import/transforms";
import { chay, doTep, type SoDo, type TiSo } from "../../../packages/core/test/import/do";
import { danhMucMau, HOM_NAY, sinhBoThu, type TepThu } from "../../../packages/core/test/import/sinh";

/** Tiêu đề lạ thay cho dòng tiêu đề của file mẫu — cùng thứ tự cột, cùng nghĩa với `DICH_MAU_A` / `DICH_MAU_B`. */
export const TIEU_DE_LA: Record<string, { goc: "mau-a" | "mau-b"; tieuDe: string[] }> = {
  "la-a-dong-nghia": {
    goc: "mau-a",
    tieuDe: ["Số hiệu căn", "Khối nhà", "Diện tích sử dụng", "Kiểu căn hộ", "Hướng nhìn", "Giá niêm yết (tỷ)", "Chi phí sang tên", "Hiện trạng", "Người ký gửi", "ĐT liên lạc", "Môi giới phụ trách", "Thông tin thêm", "Phân loại"],
  },
  "la-a-tieng-anh": {
    goc: "mau-a",
    tieuDe: ["Unit code", "Building", "Area", "Bedrooms", "Facing", "Asking price (bn)", "Fees", "Sale status", "Owner", "Owner contact", "Agent", "Remarks", "Tag"],
  },
  "la-b-viet-tat": {
    goc: "mau-b",
    tieuDe: ["#", "T.Trạng", "Tên DA", "Tháp", "Vị trí tầng", "Căn hộ số", "DT sàn (m²)", "P.Ngủ", "H.BC", "Giá đăng (VNĐ)", "Phí GD", "CTV", "Họ tên CSH", "ĐTLL", "Ghi nhận", "Loại"],
  },
  "la-b-dong-nghia": {
    goc: "mau-b",
    tieuDe: ["Thứ tự", "Tình hình bán", "Khu đô thị", "Khối tháp", "Tầng thứ", "Mã sản phẩm", "Diện tích sàn (m²)", "Số buồng ngủ", "Hướng mặt tiền", "Giá thả (VNĐ)", "Phí giao dịch", "Nhân sự phụ trách", "Chủ sở hữu", "Hotline chủ", "Diễn giải", "Nhóm"],
  },
};

/** Tiêu đề nào của bộ lạ mà từ điển dựng sẵn vẫn nhận — phải rỗng, không thì file không còn «lạ». */
export function tieuDeDaBiet(): string[] {
  return Object.values(TIEU_DE_LA).flatMap((v) => v.tieuDe.filter((h) => lookupHeader(h) !== null));
}

export function sinhBoLa(): TepThu[] {
  const goc = new Map(sinhBoThu().map((t) => [t.ten, t]));
  return Object.entries(TIEU_DE_LA).map(([ten, v]) => {
    const t = goc.get(v.goc)!;
    const grid: Grid = t.grid!.map((r) => [...r]);
    if (grid[t.dapAn.headerRow]!.length !== v.tieuDe.length) throw new Error(`${ten}: số tiêu đề lạ khác số cột của ${v.goc}`);
    grid[t.dapAn.headerRow] = [...v.tieuDe];
    return { ten, grid, dapAn: t.dapAn };
  });
}

const cong = (a: TiSo, b: TiSo): TiSo => ({ tu: a.tu + b.tu, mau: a.mau + b.mau });

export type SoNenLa = { ghi_chu: string; hom_nay: string; tep: Record<string, SoDo & { cotChoNguoi: TiSo }>; cong: SoDo & { cotChoNguoi: TiSo } };

/** Số nền tất định trên bộ lạ. `cotChoNguoi`: cột máy để «Giữ làm ghi chú» độ tin thấp — phần người phải ghép tay. */
export function tinhSoNenLa(): SoNenLa {
  const ctx: ImportContext = { today: HOM_NAY, catalog: danhMucMau() };
  const tep: SoNenLa["tep"] = {};
  let tong: SoNenLa["cong"] | null = null;
  for (const t of sinhBoLa()) {
    const r = chay(t, ctx);
    const s = doTep(t, r);
    const cho = { tu: r.plan.columns.filter((c) => c.confidence === "low").length, mau: r.plan.columns.length };
    const dong = { ...s, cotChoNguoi: cho };
    tep[t.ten] = dong;
    tong = tong
      ? { ghepCot: cong(tong.ghepCot, s.ghepCot), loiDuocSua: cong(tong.loiDuocSua, s.loiDuocSua), loiLot: cong(tong.loiLot, s.loiLot), hoiNguoi: cong(tong.hoiNguoi, s.hoiNguoi), roNguon: cong(tong.roNguon, s.roNguon), cotChoNguoi: cong(tong.cotChoNguoi, cho) }
      : dong;
  }
  return {
    ghi_chu: "Số nền tất định (không AI) trên bộ file mẫu lạ của hàng 68 — mọi tiêu đề ngoài từ điển dựng sẵn; dữ liệu và đáp án của hai file mẫu hàng 5. Tính bằng _acceptance/nhap-tac-tu-ke-hoach/thu/bo-la.ts.",
    hom_nay: HOM_NAY,
    tep,
    cong: tong!,
  };
}

export const SO_NEN_LA_URL = new URL("../so-nen-la.json", import.meta.url);
