// Danh mục đơn vị hành chính (hàng 75, hồ sơ dia-chi-chuan) — E8.
import assert from "node:assert/strict";
import { test } from "node:test";
import { pathToFileURL, fileURLToPath } from "node:url";
import { DANH_MUC_DON_VI_HANH_CHINH as DM, doiChieuBangTrich, kiemDanhMuc, type BangTrichHang73, type DanhMucDonViHanhChinh } from "./danh-muc";

/** Bảng trích của hàng 73, đường suy từ vị trí tệp này (packages/core/src/address). */
const DUONG_TRICH = fileURLToPath(new URL("../../../db/seed/don-vi-hanh-chinh-mau.mjs", import.meta.url));
const napTrich = async (): Promise<BangTrichHang73> =>
  ((await import(pathToFileURL(DUONG_TRICH).href)) as { DON_VI_HANH_CHINH: BangTrichHang73 }).DON_VI_HANH_CHINH;
const banSao = (): DanhMucDonViHanhChinh => structuredClone(DM) as DanhMucDonViHanhChinh;

test("AC-8 danh mục: nguồn, ngày, phạm vi, 34 tỉnh, mã xã, phường cũ trỏ đúng", () => {
  assert.deepEqual(kiemDanhMuc(DM), []);
  const nguonTinh = DM.nguon.find((n) => n.phan === "tinh");
  const nguonCu = DM.nguon.find((n) => n.phan === "xaCu");
  assert.ok(nguonTinh?.vanBan.includes("19/2025/QĐ-TTg"), "nguồn tỉnh phải là Quyết định 19/2025/QĐ-TTg");
  assert.ok(nguonCu?.vanBan.includes("1685/NQ-UBTVQH15"), "nguồn phường cũ phải là Nghị quyết 1685/NQ-UBTVQH15");
  for (const n of DM.nguon) assert.match(n.ngayDoc, /^\d{4}-\d{2}-\d{2}$/);
  assert.ok(DM.phamVi.trim().length > 0);
  assert.equal(DM.tinh.length, 34);
  assert.equal(new Set(DM.tinh.map((t) => t.ma)).size, 34);
  for (const t of DM.tinh) assert.match(t.ma, /^\d{2}$/);
  assert.equal(DM.tinh.find((t) => t.ma === "79")?.ten, "Thành phố Hồ Chí Minh");
  assert.equal(DM.tinh.find((t) => t.ma === "01")?.ten, "Thành phố Hà Nội");
  for (const x of DM.xa) assert.match(x.ma, /^\d{5}$/);
  assert.equal(new Set(DM.xa.map((x) => x.ma)).size, DM.xa.length);
});

test("AC-8 danh mục: bảng trích hàng 73 khớp danh mục lõi", async () => {
  const trich = await napTrich();
  const soTen = trich.tinh.reduce((n, t) => n + 1 + t.phuongMoi.length + t.phuongCu.length, 0);
  assert.ok(soTen > 0, "bảng trích hàng 73 rỗng — phép đối chiếu không đo gì");
  console.log(`AC-8: đối chiếu ${soTen} tên của bảng trích hàng 73`);
  assert.deepEqual(doiChieuBangTrich(DM, trich), []);
});

test("AC-8 danh mục — phá thử: thiếu nguồn, trùng mã, bảng trích lệch đều đỏ", async () => {
  const a = banSao();
  (a as unknown as { nguon: unknown[] }).nguon = [];
  assert.ok(kiemDanhMuc(a).some((l) => l.startsWith("danh mục thiếu nguồn")), "bỏ nguồn phải đỏ «danh mục thiếu nguồn»");

  const b = banSao();
  (b.xa as unknown as { ma: string }[])[1]!.ma = b.xa[0]!.ma;
  assert.ok(kiemDanhMuc(b).some((l) => l.startsWith("mã xã trùng")), "trùng mã xã phải đỏ «mã xã trùng»");

  const c = banSao();
  (c.xaCu as unknown as { vao: string[] }[])[0]!.vao = ["99999"];
  assert.ok(kiemDanhMuc(c).some((l) => l.startsWith("phường cũ trỏ xã mới không có")));

  const trich = structuredClone(await napTrich()) as unknown as { tinh: { phuongCu: { ten: string; quan: string; vao: string[] }[] }[] };
  trich.tinh[0]!.phuongCu.push({ ten: "Bến Nghé", quan: "Quận 1", vao: ["Tân Định"] });
  trich.tinh[0]!.phuongCu = trich.tinh[0]!.phuongCu.filter((p, i, arr) => p.ten !== "Bến Nghé" || i === arr.length - 1);
  assert.deepEqual(doiChieuBangTrich(DM, trich as unknown as BangTrichHang73), ["bảng trích hàng 73 lệch danh mục lõi: Bến Nghé"]);
});
