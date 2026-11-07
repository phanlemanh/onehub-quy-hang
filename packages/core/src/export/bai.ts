/**
 * Bài chép theo kênh (hàng 43, Hỏi-4): Zalo — một dòng một căn; Facebook — dòng đầu tên sàn, mỗi căn một khối cách một
 * dòng trống. Không biểu tượng cảm xúc, không `*` hay `_` bao chữ (Zalo, Facebook đều không nhận định dạng đậm). Bài
 * dựng từ bảng đã ẩn (`xuatBang`), không từ căn — nên không có đường nào đọc trường nội bộ. Người tự dán và bấm gửi
 * (bất biến 3): lõi chỉ dựng chữ.
 */
import type { KhoaRa } from "../redaction/ban-ra";
import { KHONG_CO } from "./cot";
import type { LoiMauBai } from "./mau-san";

/** Phần bảng mà bài đọc: khoá ra của từng cột và chữ đã định dạng của từng ô. */
export type BangChoBai = { khoa: readonly KhoaRa[]; dong: readonly (readonly string[])[] };

/** Biểu tượng cảm xúc và ký tự nối của chúng — bỏ khỏi bài dù chữ của căn có mang. */
const BIEU_TUONG = /[\p{Extended_Pictographic}\u{1F1E6}-\u{1F1FF}\u{FE0F}\u{200D}\u{20E3}]/gu;

/** Mảnh bài của một ô: thêm tên trường khi chữ ô đứng một mình dễ nhầm. */
function manh(khoa: KhoaRa, chu: string): string | null {
  if (chu === KHONG_CO || chu === "") return null;
  switch (khoa) {
    case "floor":
      return `Tầng ${chu}`;
    case "directionFaces":
      return `Hướng ${chu}`;
    case "furnished":
      return `Nội thất ${chu}`;
    case "legalStatus":
      return `Pháp lý ${chu}`;
    case "financing":
      return `Tài chính ${chu}`;
    case "confirmedAgeDays":
      return `Xác nhận ${chu.toLocaleLowerCase("vi")}`;
    default:
      return chu;
  }
}

/** Bỏ biểu tượng cảm xúc và khoảng trắng thừa — dùng cho chữ căn và lời mẫu của sàn. */
export const sach = (s: string) => s.replace(BIEU_TUONG, "").replace(/[ \t]+/g, " ").trim();

function manhCuaDong(bang: BangChoBai, dong: readonly string[]): string[] {
  return bang.khoa.flatMap((k, i) => {
    const m = manh(k, dong[i] ?? KHONG_CO);
    const s = m === null ? "" : sach(m);
    return s ? [s] : [];
  });
}

/** Một dòng một căn, các mảnh cách nhau « · ». */
export function baiZalo(bang: BangChoBai): string {
  return bang.dong.map((d) => manhCuaDong(bang, d).join(" · ")).join("\n");
}

/**
 * Dòng đầu tên sàn, rồi lời mở đầu của mẫu (nếu có), rồi mỗi căn một khối (mỗi mảnh một dòng), rồi lời kết; các phần cách
 * nhau một dòng trống. Lời mẫu bỏ biểu tượng; lời rỗng bị bỏ.
 */
export function baiFacebook(bang: BangChoBai, tenSan: string, loi?: LoiMauBai): string {
  const khoi = bang.dong.map((d) => manhCuaDong(bang, d).join("\n"));
  const lai = (x: string | undefined) => (x ? x.split("\n").map(sach).join("\n").trim() : "");
  return [sach(tenSan), lai(loi?.dau), ...khoi, lai(loi?.cuoi)].filter((p) => p !== "").join("\n\n");
}
