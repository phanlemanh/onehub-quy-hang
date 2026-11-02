/**
 * Bàn phím của chế độ cuộc gọi (hàng 28, AC-6): một bảng phím → lệnh, thuần — màn và bài kiểm cùng đọc. Tab / Shift+Tab
 * đổi nhóm (vòng), phím số chọn lựa chọn của nhóm đang đứng, Delete xoá câu trả lời, G «Đã gọi», Ctrl+Enter «Xong cuộc
 * gọi». Con trỏ ở ô giá: Alt+1 / Alt+2 chọn điều kiện phí, Esc rời ô; phím số và chữ là gõ. Con trỏ ở ô chữ khác (máy
 * tính): chỉ Ctrl+Enter.
 */
import { DANH_SACH_HOI, type MucHoi } from "@quy-hang/core/listing";
import type { FeeInclusion } from "@quy-hang/core/pricing";

export type Phim = { key: string; shiftKey?: boolean; ctrlKey?: boolean; metaKey?: boolean; altKey?: boolean; code?: string };
/** Con trỏ đang ở đâu: ngoài ô chữ, ở ô giá của danh sách, hay ở ô chữ khác. */
export type ChoTro = "khong" | "o-gia" | "o-chu";

export type LenhPhim =
  | { kind: "nhom"; toi: number }
  | { kind: "chon"; ma: Exclude<MucHoi["ma"], "price">; giaTri: string }
  | { kind: "xoa"; ma: MucHoi["ma"] }
  | { kind: "phi"; phi: FeeInclusion }
  | { kind: "roi-o" }
  | { kind: "da-goi" }
  | { kind: "xong" };

const PHI_THEO_SO: Record<string, FeeInclusion> = { "1": "included", "2": "excluded" };

/** Alt+số trên máy Mac đổi `key` thành ký tự khác — đọc `code` trước. */
const soCua = (p: Phim) => (p.code && /^Digit[0-9]$/.test(p.code) ? p.code.slice(5) : p.key);

export function xuLyPhim(p: Phim, cho: ChoTro, nhom: number, ds: readonly MucHoi[] = DANH_SACH_HOI): LenhPhim | null {
  const ctrl = p.ctrlKey || p.metaKey;
  if (ctrl && p.key === "Enter") return { kind: "xong" };
  if (cho === "o-chu") return null;
  if (p.key === "Tab" && !ctrl && !p.altKey) return { kind: "nhom", toi: (nhom + (p.shiftKey ? ds.length - 1 : 1)) % ds.length };
  if (cho === "o-gia") {
    if (p.altKey && PHI_THEO_SO[soCua(p)]) return { kind: "phi", phi: PHI_THEO_SO[soCua(p)]! };
    if (p.key === "Escape") return { kind: "roi-o" };
    return null;
  }
  if (ctrl || p.altKey) return null;
  const muc = ds[nhom];
  if (!muc) return null;
  if (p.key === "g" || p.key === "G") return { kind: "da-goi" };
  if (p.key === "Delete" || p.key === "Backspace") return { kind: "xoa", ma: muc.ma };
  if (/^[1-9]$/.test(p.key) && "luaChon" in muc) {
    const l = muc.luaChon[Number(p.key) - 1];
    return l ? { kind: "chon", ma: muc.ma, giaTri: l.nhan } : null;
  }
  return null;
}

export type HangLuaChon = { luaChon: { nhan: string; phim: number; dangChon: boolean }[]; ngoaiBo: string | null };

/** Hàng lựa chọn của một mục trên giá trị hiện có: giá trị ngoài bộ hiện nguyên, đánh dấu, không lựa chọn nào đang chọn. */
export function hangLuaChon(muc: Extract<MucHoi, { luaChon: unknown }>, giaTri: string | null): HangLuaChon {
  const trong = muc.luaChon.some((l) => l.nhan === giaTri);
  return {
    luaChon: muc.luaChon.map((l, i) => ({ nhan: l.nhan, phim: i + 1, dangChon: l.nhan === giaTri })),
    ngoaiBo: giaTri !== null && giaTri !== "" && !trong ? giaTri : null,
  };
}
