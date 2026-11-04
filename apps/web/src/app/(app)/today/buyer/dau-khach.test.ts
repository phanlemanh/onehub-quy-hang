// Vùng «Đầu khách» của Hôm nay (hàng 37: AC-5, AC-6 — E5, E6) — phần thuần và phần dựng (renderToStaticMarkup).
import assert from "node:assert/strict";
import { test } from "node:test";
import { createElement as h } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { chuTin, hrefTin, nhanNgay, nhomTheoNgay, type TinDauKhach } from "./dau-khach";
import { DongTinDauKhach, type TrangThaiVung } from "./dong-tin";

const s1 = { id: "S-1", recipient: "[Tên] khách 1" };
const TIN: TinDauKhach[] = [
  { kind: "reaction", at: "2026-11-04T03:24:00Z", day: "2026-11-04", share: s1, opens: 2, interested: [{ id: "L1", name: "Toà A · A-12.05" }] },
  { kind: "changed", at: "2026-11-04T02:40:00Z", day: "2026-11-04", share: s1, listing: { id: "L2", name: "Toà B · B-08.11" }, changed: { price: { from: 3_200_000_000, to: 2_900_000_000 } } },
  { kind: "new_match", at: "2026-11-03T01:15:00Z", day: "2026-11-03", shares: [s1], listing: { id: "L3", name: "Toà C · C-15.03" }, listPrice: 3_400_000_000 },
];

test("hôm nay đầu khách: đích chạm", () => {
  const BANG: [TinDauKhach["kind"], string][] = [
    ["reaction", "/shares?lan=S-1"],
    ["changed", "/shares?lan=S-1"],
    ["new_match", "/shares/new?can=L3"],
  ];
  assert.equal(BANG.length, 3, "số dòng bảng viết trước");
  for (const [kind, href] of BANG) assert.equal(hrefTin(TIN.find((t) => t.kind === kind)!), href, kind);
});

test("hôm nay đầu khách: nhóm ngày và chữ tin", () => {
  assert.deepEqual(nhomTheoNgay(TIN, "2026-11-04").map((n) => [n.nhan, n.tin.length]), [["Hôm nay", 2], ["Hôm qua", 1]]);
  assert.equal(nhanNgay("2026-11-02", "2026-11-04"), "Thứ Hai 2/11");
  assert.deepEqual(chuTin(TIN[0]!), { tieuDe: "[Tên] khách 1", phu: "10:24", chiTiet: "2 mở · quan tâm: Toà A · A-12.05" });
  assert.equal(chuTin(TIN[1]!).chiTiet, "Giá 3,2 tỷ → 2,9 tỷ");
  assert.equal(chuTin(TIN[2]!).chiTiet, "Khớp bộ gửi [Tên] khách 1");
});

test("hôm nay đầu khách: trạng thái vùng", () => {
  const dung = (trang: TrangThaiVung) => renderToStaticMarkup(h(DongTinDauKhach, { trang, homNay: "2026-11-04" }));
  const trong = dung({ kieu: "xong", ds: [] });
  assert.ok(trong.includes("Chưa có gì mới trong 7 ngày"), "trống thiếu chữ");
  assert.ok(/<a[^>]*href="\/inventory\/cards"[^>]*>[^<]*Gửi căn/.test(trong), "trống thiếu nút «Gửi căn»");
  const loi = dung({ kieu: "loi" });
  assert.ok(loi.includes("Chưa tải được — thử lại"), "lỗi thiếu chữ");
  assert.ok(/<button[^>]*>Thử lại<\/button>/.test(loi), "lỗi thiếu nút «Thử lại»");
  assert.ok(dung({ kieu: "dang-tai" }).includes('data-cho-tai="dong-tin"'), "đang tải không dùng khung chờ của bố cục");
  const co = dung({ kieu: "xong", ds: TIN });
  for (const chu of ["Hôm nay", "Khách phản ứng", "Vừa đổi", "Căn mới", 'href="/shares?lan=S-1"', 'href="/shares/new?can=L3"']) assert.ok(co.includes(chu), `có tin thiếu «${chu}»`);
});
