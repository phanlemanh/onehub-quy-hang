// Bàn phím của chế độ cuộc gọi (hàng 28, E6b). Bảng viết trước, đếm bằng assert số.
import assert from "node:assert/strict";
import { test } from "node:test";
import { DANH_SACH_HOI } from "@quy-hang/core/listing";
import { hangLuaChon, xuLyPhim, type ChoTro, type LenhPhim, type Phim } from "./phim";

const CUOI = DANH_SACH_HOI.length - 1;
const NOI_THAT = DANH_SACH_HOI.findIndex((m) => m.ma === "furnished");
const GIA = DANH_SACH_HOI.findIndex((m) => m.ma === "price");

type XuLy = typeof xuLyPhim;
// [tên, phím, con trỏ, nhóm đang đứng, lệnh mong].
const BANG: [string, Phim, ChoTro, number, LenhPhim | null][] = [
  ["Tab ở nhóm cuối về nhóm đầu", { key: "Tab" }, "khong", CUOI, { kind: "nhom", toi: 0 }],
  ["Shift+Tab ở nhóm đầu về nhóm cuối", { key: "Tab", shiftKey: true }, "khong", 0, { kind: "nhom", toi: CUOI }],
  ["2 ở nhóm nội thất chọn lựa chọn thứ hai", { key: "2" }, "khong", NOI_THAT, { kind: "chon", ma: "furnished", giaTri: "Cơ bản" }],
  ["9 khi nhóm chỉ có 3 lựa chọn", { key: "9" }, "khong", NOI_THAT, null],
  ["Delete xoá câu trả lời của nhóm", { key: "Delete" }, "khong", NOI_THAT, { kind: "xoa", ma: "furnished" }],
  ["1 khi con trỏ ở ô chữ", { key: "1" }, "o-chu", NOI_THAT, null],
  ["Ctrl+Enter xong cuộc gọi", { key: "Enter", ctrlKey: true }, "khong", NOI_THAT, { kind: "xong" }],
  ["Alt+1 ở ô giá chọn bao phí", { key: "¡", code: "Digit1", altKey: true }, "o-gia", GIA, { kind: "phi", phi: "included" }],
  ["Alt+1 ở ô môi giới", { key: "1", code: "Digit1", altKey: true }, "o-chu", GIA, null],
  ["Esc ở ô giá về danh sách", { key: "Escape" }, "o-gia", GIA, { kind: "roi-o" }],
];

function caSai(xuLy: XuLy): string[] {
  return BANG.filter(([, p, cho, nhom, mong]) => JSON.stringify(xuLy(p, cho, nhom)) !== JSON.stringify(mong)).map(([ten]) => ten);
}

test("phím: ma trận", () => {
  assert.equal(BANG.length, 10);
  assert.deepEqual(caSai(xuLyPhim), []);
  // Ở ô giá phím số là gõ chữ: không lệnh, ô giữ chữ. Rời ô rồi thì phím số chọn lại được.
  assert.equal(xuLyPhim({ key: "1" }, "o-gia", NOI_THAT), null);
  assert.deepEqual(xuLyPhim({ key: "1" }, "khong", NOI_THAT), { kind: "chon", ma: "furnished", giaTri: "Đủ đồ" });
  assert.deepEqual(xuLyPhim({ key: "g" }, "khong", 0), { kind: "da-goi" });
  assert.equal(xuLyPhim({ key: "g" }, "o-gia", GIA), null);
});

test("phím: đối chứng đỏ — bỏ kiểm ô chữ bị gọi tên", () => {
  const boKiem: XuLy = (p, _cho, nhom, ds) => xuLyPhim(p, "khong", nhom, ds);
  assert.ok(caSai(boKiem).includes("1 khi con trỏ ở ô chữ"));
});

test("giá trị ngoài bộ", () => {
  const noiThat = DANH_SACH_HOI[NOI_THAT]!;
  assert.ok("luaChon" in noiThat);
  const ngoai = hangLuaChon(noiThat, "Nội thất cao cấp");
  assert.equal(ngoai.ngoaiBo, "Nội thất cao cấp");
  assert.deepEqual(ngoai.luaChon.filter((l) => l.dangChon), []);
  const trong = hangLuaChon(noiThat, "Cơ bản");
  assert.equal(trong.ngoaiBo, null);
  assert.deepEqual(trong.luaChon.filter((l) => l.dangChon).map((l) => [l.nhan, l.phim]), [["Cơ bản", 2]]);
  assert.equal(hangLuaChon(noiThat, null).ngoaiBo, null);
});
