/**
 * Quét lại gói đề xuất ở máy chủ — lần chặn thứ hai (ADR-0011 quyết định 2: «máy chủ quét lại trước khi gửi … trúng là
 * không gửi»). Dùng đúng các bộ dò mà hồ sơ cột dùng để che: tiêu đề qua `detectPersonal` (số điện thoại, email, số giấy
 * tờ); giá trị qua `detectPersonal` và `looksLikePersonName`. Dáng họ tên KHÔNG quét ở tiêu đề: tiêu đề viết hoa đầu
 * («Unit Code», «Khối Tháp») trùng dáng ấy và sẽ chặn mọi gói của file lạ (phản biện P1, dòng sổ S1). Kết quả chỉ nêu
 * LOẠI và CHỖ trúng, không bao giờ chuỗi đã trúng — nó đi vào sổ sự cố.
 */
import { detectPersonal, looksLikePersonName, type PersonalHit } from "../detect";
import type { GoiDeXuat } from "./goi";

export type TrungQuet = { trung: PersonalHit | "person_name"; cho: "tieu_de" | "gia_tri"; cot: number };

export function quetGoi(goi: GoiDeXuat): TrungQuet[] {
  const out: TrungQuet[] = [];
  for (const c of goi.cot) {
    const h = detectPersonal(c.tieuDe);
    if (h) out.push({ trung: h, cho: "tieu_de", cot: c.cot });
    for (const v of c.giaTri ?? []) {
      const g = detectPersonal(v) ?? (looksLikePersonName(v) ? "person_name" : null);
      if (g) out.push({ trung: g, cho: "gia_tri", cot: c.cot });
    }
  }
  return out;
}

/** Các loại trúng, không lặp — thứ được ghi vào `ai_usage.blocked_kinds`. */
export const loaiTrung = (t: readonly TrungQuet[]): TrungQuet["trung"][] => [...new Set(t.map((x) => x.trung))].sort();
