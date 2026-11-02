// Kết quả cuộc gọi ép giá (hàng 29, E4, E7). Bảng viết trước, đếm bằng assert số.
import assert from "node:assert/strict";
import { test } from "node:test";
import type { ChoTro, Phim } from "../phim";
import { lenhBan, xuLyPhimKetQua, type KetQua, type LenhKetQua } from "./ket-qua";

type XuLy = typeof xuLyPhimKetQua;
const BANG: [string, Phim, ChoTro, KetQua | null, LenhKetQua | null][] = [
  ["h ngoài ô chữ chọn hạ giá", { key: "h" }, "khong", null, { kind: "chon", kq: "ha-gia" }],
  ["G chọn giữ giá", { key: "G" }, "khong", null, { kind: "chon", kq: "giu-gia" }],
  ["b chọn đã cọc / bán", { key: "b" }, "khong", null, { kind: "chon", kq: "ban" }],
  ["k chọn không nghe máy", { key: "k" }, "khong", null, { kind: "chon", kq: "khong-nghe" }],
  ["h khi con trỏ ở ô chữ", { key: "h" }, "o-chu", null, null],
  ["Escape bỏ chọn", { key: "Escape" }, "khong", "ban", { kind: "bo" }],
  ["2 ở ba lối chọn sàn mình bán", { key: "2" }, "khong", "ban", { kind: "loi-ban", loi: "san-ban" }],
  ["4 ở ba lối", { key: "4" }, "khong", "ban", null],
  ["Ctrl+Enter về Hôm nay", { key: "Enter", ctrlKey: true }, "khong", null, { kind: "ve-hom-nay" }],
];
const caSai = (f: XuLy) => BANG.filter(([, p, c, d, m]) => JSON.stringify(f(p, c, d)) !== JSON.stringify(m)).map(([t]) => t);

test("kết quả gọi: phím", () => {
  assert.equal(BANG.length, 9);
  assert.deepEqual(caSai(xuLyPhimKetQua), []);
});

test("kết quả gọi: đối chứng đỏ — bỏ kiểm ô chữ bị gọi tên", () => {
  const boKiem: XuLy = (p, _c, d) => xuLyPhimKetQua(p, "khong", d);
  assert.ok(caSai(boKiem).includes("h khi con trỏ ở ô chữ"));
});

type LenhBan = typeof lenhBan;
const NGAY = new Date(2026, 10, 2, 9, 0);
const BA_LOI_BANG: [string, (f: LenhBan) => boolean][] = [
  ["đã cọc", (f) => JSON.stringify(f("Active", "da-coc")) === JSON.stringify({ ok: true, payload: { to: "Pending" } })],
  [
    "sàn mình bán",
    (f) => JSON.stringify(f("Active", "san-ban", { giaChot: "2,75 tỷ", ngay: "2026-11-02" })) === JSON.stringify({ ok: true, payload: { to: "Closed", closePrice: 2_750_000_000, closeDate: "2026-11-02" } }),
  ],
  ["thiếu giá chốt", (f) => JSON.stringify(f("Active", "san-ban", {})) === JSON.stringify({ ok: false, loi: "Cần giá chốt" })],
  ["chủ bán nơi khác", (f) => JSON.stringify(f("Active", "chu-ban-noi-khac")) === JSON.stringify({ ok: true, payload: { to: "Withdrawn", withdrawnReason: "sold_elsewhere" } })],
  ["Tạm ngừng", (f) => { const k = f("Hold", "da-coc"); return !k.ok && k.loi === "Tạm ngừng không chuyển sang Đang giao dịch"; }],
  ["ngày bán mặc định hôm nay", (f) => { const k = f("Active", "san-ban", { giaChot: "2,75 tỷ" }, NGAY); return k.ok && k.payload.to === "Closed" && k.payload.closeDate === "2026-11-02"; }],
];
const caSaiBan = (f: LenhBan) => BA_LOI_BANG.filter(([, k]) => !k(f)).map(([t]) => t);

test("đã cọc / bán: ba lối", () => {
  assert.equal(BA_LOI_BANG.length, 6);
  assert.deepEqual(caSaiBan(lenhBan), []);
});

test("đã cọc / bán: đối chứng đỏ — bỏ kiểm bảng chuyển bị gọi tên", () => {
  const boKiem: LenhBan = (_tu, loi, them, bg) => lenhBan("Active", loi, them, bg);
  assert.ok(caSaiBan(boKiem).includes("Tạm ngừng"));
});
