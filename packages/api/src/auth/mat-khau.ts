// Luật mật khẩu do sàn cấp (thiết kế §2 luật 1–2): độ dài theo ký tự Unicode, danh sách phổ biến đóng gói, chuỗi dễ
// đoán theo ngữ cảnh — không luật trộn loại ký tự, không ép đổi định kỳ, không gọi ra ngoài.
import { randomInt } from "node:crypto";
import { BANG_CHU_TAM, MAT_KHAU_MAX, MAT_KHAU_MIN, MAT_KHAU_TAM_DO_DAI } from "./constants";
import { MAT_KHAU_PHO_BIEN } from "./mat-khau-pho-bien";

export type LyDoTuChoi = "password-too-short" | "password-too-long" | "password-common" | "password-guessable";
export type KetQuaKiem = { ok: true } | { ok: false; code: LyDoTuChoi };

/** NFC trước khi đếm, kiểm và băm — cùng mật khẩu gõ từ hai bàn phím (dựng sẵn hay tổ hợp) phải khớp nhau. */
export const chuanHoa = (pw: string): string => pw.normalize("NFC");

/** Chữ thường, bỏ dấu, «đ» thành «d», bỏ dấu cách — để so với danh sách và ngữ cảnh. */
function tron(s: string): string {
  return s.normalize("NFD").replace(/\p{M}/gu, "").replace(/đ/gi, "d").toLowerCase().replace(/\s+/gu, "");
}

const HANG_PHIM = ["1234567890", "qwertyuiop", "asdfghjkl", "zxcvbnm"];
const DAY_PHIM_TOI_THIEU = 6;

/** Cả chuỗi là một dãy đều nhau (tăng hay giảm một) của số hay chữ: «12345678», «hgfedcba». */
function laDay(s: string): boolean {
  if (s.length < MAT_KHAU_MIN) return false;
  const buoc = s.charCodeAt(1) - s.charCodeAt(0);
  if (Math.abs(buoc) !== 1) return false;
  for (let i = 2; i < s.length; i++) if (s.charCodeAt(i) - s.charCodeAt(i - 1) !== buoc) return false;
  return true;
}

function coDayPhim(s: string): boolean {
  for (const hang of HANG_PHIM) {
    for (const h of [hang, [...hang].reverse().join("")]) {
      for (let i = 0; i + DAY_PHIM_TOI_THIEU <= h.length; i++) if (s.includes(h.slice(i, i + DAY_PHIM_TOI_THIEU))) return true;
    }
  }
  return false;
}

/** Kiểm một mật khẩu người tự đặt. `email` để chặn mật khẩu chứa phần trước «@». */
export function kiemMatKhau(pw: string, email: string): KetQuaKiem {
  const n = [...chuanHoa(pw)].length;
  if (n < MAT_KHAU_MIN) return { ok: false, code: "password-too-short" };
  if (n > MAT_KHAU_MAX) return { ok: false, code: "password-too-long" };
  const t = tron(pw);
  if (MAT_KHAU_PHO_BIEN.has(t)) return { ok: false, code: "password-common" };
  const ten = tron(email.split("@")[0] ?? "");
  const deDoan =
    new Set(t).size <= 1 ||
    laDay(t) ||
    coDayPhim(t) ||
    t.includes("quyhang") ||
    (ten.length >= 3 && t.includes(ten));
  return deDoan ? { ok: false, code: "password-guessable" } : { ok: true };
}

/** Mật khẩu tạm 16 ký tự ngẫu nhiên mật mã từ BANG_CHU_TAM — liền một chuỗi; chia nhóm chỉ khi hiển thị. */
export function sinhMatKhauTam(): string {
  let s = "";
  for (let i = 0; i < MAT_KHAU_TAM_DO_DAI; i++) s += BANG_CHU_TAM[randomInt(BANG_CHU_TAM.length)];
  return s;
}

/** «abcdEFGH…» → «abcd-EFGH-…» cho hộp kết quả; đăng nhập nhận cả hai dạng (gạch nối bị bỏ khi so). */
export const nhomBon = (s: string): string => s.match(/.{1,4}/g)?.join("-") ?? s;
