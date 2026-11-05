// Luật mật khẩu (E12): bảng viết trước mật khẩu × kết quả, và máy sinh mật khẩu tạm.
import assert from "node:assert/strict";
import { test } from "node:test";
import { BANG_CHU_TAM, MAT_KHAU_TAM_DO_DAI } from "./constants";
import { chuanHoa, kiemMatKhau, nhomBon, sinhMatKhauTam, type LyDoTuChoi } from "./mat-khau";

const EMAIL = "ten-thu@example.test";
const DAI_128 = "Mây trôi lững lờ qua đồi xa; ".repeat(10).slice(0, 128);
const NFD = "Hà Nội đẹp".normalize("NFD");

const BANG: [ten: string, pw: string, ket: "nhận" | LyDoTuChoi][] = [
  ["7 ký tự", "bienxan", "password-too-short"],
  ["8 ký tự chữ thường", "bientrua", "nhận"],
  ["129 ký tự", DAI_128 + "x", "password-too-long"],
  ["128 ký tự", DAI_128, "nhận"],
  ["có dấu cách và chữ có dấu 8 ký tự", "mưa rơi!", "nhận"],
  ["một ký tự lặp 8 lần", "aaaaaaaa", "password-guessable"],
  ["dãy số", "12345678", "password-common"],
  ["dãy số không có trong danh sách", "23456789", "password-guessable"],
  ["dãy bàn phím", "qwertyui", "password-common"],
  ["dãy bàn phím giữa chữ khác", "nhaqwertyzz", "password-guessable"],
  ["chứa phần trước «@» của email", "Ten-Thu-2026!", "password-guessable"],
  ["chứa quỹ hàng", "quyhangquyhang1", "password-guessable"],
  ["quỹ hàng có dấu và cách", "Quỹ Hàng của tôi", "password-guessable"],
  ["một dòng của danh sách phổ biến", "matkhau123", "password-common"],
  ["chữ có dấu tổ hợp (NFD) 10 ký tự", NFD, "nhận"],
];

test("luật mật khẩu: bảng viết trước", () => {
  assert.ok(BANG.length >= 10, "bảng phải có ít nhất mười dòng");
  for (const [ten, pw, ket] of BANG) {
    const r = kiemMatKhau(pw, EMAIL);
    assert.equal(r.ok ? "nhận" : r.code, ket, `dòng «${ten}»`);
  }
});

test("luật mật khẩu: độ dài đếm theo ký tự Unicode, không theo byte", () => {
  // «ữữữữữữữ»: 7 ký tự nhưng 21 byte UTF-8 — vẫn ngắn.
  assert.equal(Buffer.byteLength("ữữữữữữữ"), 21);
  assert.deepEqual(kiemMatKhau("ữữữữữữữ", EMAIL), { ok: false, code: "password-too-short" });
  // NFD dài hơn theo đơn vị mã nhưng đếm sau NFC.
  assert.equal([...chuanHoa(NFD)].length, 10);
  assert.equal(chuanHoa(NFD), chuanHoa("Hà Nội đẹp".normalize("NFC")));
});

test("mật khẩu tạm: bảng chữ và độ dài", () => {
  const seen = new Set<string>();
  for (let i = 0; i < 1000; i++) {
    const t = sinhMatKhauTam();
    assert.equal(t.length, MAT_KHAU_TAM_DO_DAI);
    for (const ch of t) assert.ok(BANG_CHU_TAM.includes(ch), `ký tự ngoài bảng: ${ch}`);
    seen.add(t);
  }
  assert.equal(seen.size, 1000, "mật khẩu tạm trùng nhau");
  for (const ch of "0Oo1lI") assert.ok(!BANG_CHU_TAM.includes(ch), `bảng chữ còn ký tự dễ nhầm ${ch}`);
  assert.equal(nhomBon("abcdEFGHjkmn2345"), "abcd-EFGH-jkmn-2345");
});
