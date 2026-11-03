import assert from "node:assert/strict";
import { test } from "node:test";
import { docDuLieuMau, sinhBoThu } from "../../test/import/sinh";
import { classifyColumns } from "./classify";
import { readTable } from "./grid";
import { buildProfile, MAX_PROFILE_VALUES } from "./profile";

const boThu = sinhBoThu();
const hoSo = (ten: string) => {
  const b = readTable(boThu.find((t) => t.ten === ten)!.grid!);
  return buildProfile(b, classifyColumns(b));
};

test("hồ sơ cột: không giá trị nguồn trên mau-a, mau-b, ban-nguon-giau", () => {
  const d = docDuLieuMau();
  const chiSo = (s: string) => s.replace(/\D/g, "");
  for (const ten of ["mau-a", "mau-b", "ban-nguon-giau"]) {
    // Danh sách cấm theo ĐÁP ÁN của bộ sinh (không theo bộ dò): mỗi người tên + số ở ba dạng; file nguồn giấu thêm số +84,
    // email (nguyên văn, chữ thường), số giấy tờ.
    const cam = boThu.find((t) => t.ten === ten)!.dapAn.camLo;
    for (const p of [...d.chuNha, ...d.lead]) {
      for (const dang of [p.ten, p.soDienThoai, chiSo(p.soDienThoai), chiSo(p.soDienThoai).slice(-9)]) assert.ok(cam.includes(dang), `${ten}: danh sách cấm thiếu «${dang}»`);
    }
    assert.equal(new Set(cam).size, cam.length, `${ten}: danh sách cấm có phần tử trùng`);
    if (ten === "ban-nguon-giau") assert.ok(cam.some((s) => s.startsWith("+84 ")) && cam.some((s) => s.includes("@")) && cam.some((s) => /^0{9}\d{3}$/.test(s)), "thiếu số +84, email hay số giấy tờ cấy");
    const json = JSON.stringify(hoSo(ten));
    let dem = 0;
    for (const s of cam) {
      assert.ok(!json.includes(s), `${ten}: hồ sơ cột chứa «${s}»`);
      dem++;
    }
    assert.equal(dem, cam.length);
    for (const c of hoSo(ten).columns) {
      if (c.cls !== "catalog" && c.cls !== "shareable_listing") assert.equal(c.values, undefined, `${ten}: cột «${c.header}» lớp ${c.cls} mang giá trị`);
      else assert.ok(c.values!.length <= MAX_PROFILE_VALUES);
    }
  }
});

test("hồ sơ cột: cột được mở vẫn mang giá trị", () => {
  const p = hoSo("mau-a");
  const cot = (h: string) => p.columns.find((c) => c.header === h)!;
  assert.ok(cot("Mã căn").values?.includes("A-01.03"), "«Mã căn» phải mang A-01.03");
  assert.ok(cot("Phí CN").values?.includes("BP"), "«Phí CN» phải mang BP");
  // Tên chủ trong cột Toà bị giữ lại, nhưng tên toà thật vẫn đi.
  const toa = hoSo("ban-nguon-giau").columns.find((c) => c.header === "Toà")!;
  assert.ok(toa.values?.includes("Toà A") && toa.shape.withheld > 0, "Toà: giữ tên toà, giữ lại tên chủ");
});
