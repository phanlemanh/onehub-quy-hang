// Màn Liên hệ (hàng 103: AC-10 — E10): trạng thái màn dựng bằng renderToStaticMarkup, và ô tìm chọn lối.
import assert from "node:assert/strict";
import { test } from "node:test";
import { createElement as h } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { DanhSachLienHe, type TrangThaiDs } from "./danh-sach";
import { HoSoNguoi, type SoDaMo, type TrangThaiHoSo } from "./ho-so";
import { luaTim, type HoSo } from "./lien-he";

const HS: HoSo = {
  contact: { id: "C1", name: "[Tên] Chủ A", contactTypes: ["Seller"], status: "contact", holderName: "[Tên] Đầu chủ 1" },
  phones: [{ phoneId: "P1", label: "Mobile", isPrimary: true, tail: "011" }],
  opportunities: [
    { side: "seller", leadId: "L1", need: "sale", unit: { buildingName: "Toà A", unitNumber: "A-12.05" }, phase: "active", listingId: "H1" },
  ],
  listings: [{ id: "H1", buildingName: "Toà A", unitNumber: "A-12.05", status: "Active", listPrice: 3_200_000_000 }],
  timeline: [{ kind: "phone_revealed", at: "2026-11-05T02:40:00Z" }],
};
const ds = (tt: TrangThaiDs, q = "") =>
  renderToStaticMarkup(h(DanhSachLienHe, { tt, q, loai: "", chon: null, onQ: () => {}, onLoai: () => {}, onChon: () => {}, onThem: () => {}, onThuLai: () => {} }));
const hs = (tt: TrangThaiHoSo, daMo: SoDaMo = {}) => renderToStaticMarkup(h(HoSoNguoi, { tt, daMo, onHienSo: () => {}, onThuLai: () => {} }));

test("liên hệ: trạng thái màn", () => {
  const BANG: [string, string, (s: string) => boolean][] = [
    ["đang tải", ds({ kieu: "dang-tai" }), (s) => s.includes('data-cho-tai="luoi-chi-tiet"')],
    ["trống", ds({ kieu: "xong", ds: [], con: false }), (s) => s.includes("Chưa có liên hệ nào")],
    ["không khớp", ds({ kieu: "xong", ds: [], con: false }, "khongco"), (s) => s.includes("Không tìm thấy «khongco»")],
    ["người khác giữ", ds({ kieu: "nguoi-khac-giu", holderName: "[Tên] Đầu chủ 2" }), (s) => s.includes("đã có trong sàn") && s.includes("[Tên] Đầu chủ 2 đang giữ")],
    ["lỗi", ds({ kieu: "loi" }), (s) => s.includes("Chưa tải được — thử lại") && /<button[^>]*>Thử lại<\/button>/.test(s)],
    ["hồ sơ có dữ liệu", hs({ kieu: "xong", hs: HS }), (s) => ["Số", "Cơ hội", "Căn", "Dòng thời gian", "••• 011", "Đang chào", "Hiện số"].every((x) => s.includes(x))],
    ["hồ sơ không số", hs({ kieu: "xong", hs: { ...HS, phones: [] } }), (s) => s.includes("Chưa có số")],
    ["số đã hiện", hs({ kieu: "xong", hs: HS }, { P1: "0900 000 011" }), (s) => s.includes('href="tel:0900000011"') && s.includes("Gọi")],
    ["mở số lỗi", hs({ kieu: "xong", hs: HS }, { P1: "loi" }), (s) => s.includes("••• 011") && s.includes("Chưa mở được số — thử lại")],
  ];
  let so = 0;
  for (const [ten, s, dung] of BANG) {
    assert.ok(dung(s), `trạng thái «${ten}» dựng sai`);
    so++;
  }
  assert.equal(so, 9, "số dòng bảng viết trước");
});

test("liên hệ: ô tìm", () => {
  const BANG: [string, "so" | "ten"][] = [
    ["0900 000 011", "so"],
    ["+84900000011", "so"],
    ["Nguyễn", "ten"],
    ["0900", "ten"],
  ];
  for (const [s, mong] of BANG) assert.equal(luaTim(s), mong, s);
  assert.equal(BANG.length, 4);
});
