/**
 * Quét lại gói ô lạ ở máy chủ — lần chặn thứ hai (ADR-0011 quyết định 2), cùng bộ dò của `quetGoi` (hàng 68). Quét cả
 * `lyDoMa`: lý do mã từ chối chép chữ của ô, nên một ô lọt bộ dò ở trình duyệt cũng lọt vào lý do. Dáng họ tên chỉ quét ở
 * giá trị (tiêu đề viết hoa đầu trùng dáng ấy). Kết quả nêu LOẠI và CHỖ, không bao giờ chuỗi đã trúng.
 */
import { detectPersonal, looksLikePersonName, type PersonalHit } from "../../detect";
import type { GoiOLa } from "./goi";

export type TrungQuetOLa = { trung: PersonalHit | "person_name"; cho: "tieu_de" | "gia_tri" | "ly_do"; id: string };

export function quetGoiOLa(goi: GoiOLa): TrungQuetOLa[] {
  const out: TrungQuetOLa[] = [];
  for (const o of goi.o) {
    const t = detectPersonal(o.tieuDe);
    if (t) out.push({ trung: t, cho: "tieu_de", id: o.id });
    const g = detectPersonal(o.giaTri) ?? (looksLikePersonName(o.giaTri) ? "person_name" : null);
    if (g) out.push({ trung: g, cho: "gia_tri", id: o.id });
    const l = detectPersonal(o.lyDoMa);
    if (l) out.push({ trung: l, cho: "ly_do", id: o.id });
  }
  return out;
}

export const loaiTrungOLa = (t: readonly TrungQuetOLa[]): TrungQuetOLa["trung"][] => [...new Set(t.map((x) => x.trung))].sort();
