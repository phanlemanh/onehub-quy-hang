// Màn Trường riêng (hàng 47): thân lưu, máy dò và khoá Lưu (E3c); trang thật thay trang tạm (phần màn của E10).
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import type { TruongRieng } from "@quy-hang/core/custom-fields";

import {
  coTheLuu,
  coTheThem,
  doiChu,
  doiChuLuaChon,
  doiKieu,
  doiLoai,
  laNguon,
  loiCuaO,
  manBanDau,
  thanLuu,
  themLuaChon,
  themTruong,
  trungNghia,
  type ManTruong,
} from "./truong-rieng-thuan";

const DAY = dirname(fileURLToPath(import.meta.url));
const khoaMoi = (m: ManTruong) => m.o[m.o.length - 1]!.khoa;

/** Màn viết trước: nhóm hàng có «Căn góc» bool và một ô mới rỗng; nhóm liên hệ có «Nguồn khách» chọn một ba lựa chọn. */
function manMau(): ManTruong {
  let m = manBanDau([]);
  m = themTruong(m, "listing");
  m = doiChu(m, khoaMoi(m), "Căn góc");
  m = themTruong(m, "listing"); // ô rỗng
  m = themTruong(m, "contact");
  const k = khoaMoi(m);
  m = doiChu(m, k, "Nguồn khách");
  m = doiKieu(m, k, "single_select");
  m = doiLoai(m, k, "Buyer", true);
  m = doiLoai(m, k, "Tenant", true);
  const o = m.o.find((x) => x.khoa === k)!;
  m = doiChuLuaChon(m, k, o.options[0]!.khoa, "Zalo");
  m = themLuaChon(m, k);
  m = doiChuLuaChon(m, k, m.o.find((x) => x.khoa === k)!.options[1]!.khoa, "Facebook");
  m = themLuaChon(m, k);
  m = doiChuLuaChon(m, k, m.o.find((x) => x.khoa === k)!.options[2]!.khoa, "Giới thiệu");
  return m;
}

test("màn trường riêng: thân lưu, máy dò và khoá Lưu", () => {
  const m = manMau();
  assert.deepEqual(thanLuu(m), {
    fields: [
      { target: "listing", kind: "bool", label: "Căn góc", options: [] },
      { target: "contact", contactTypes: ["Buyer", "Tenant"], kind: "single_select", label: "Nguồn khách", options: [{ label: "Zalo" }, { label: "Facebook" }, { label: "Giới thiệu" }] },
    ],
  });
  assert.equal(coTheLuu(m), true, "đối chứng: màn hợp lệ lưu được");

  const BANG: [string, (m: ManTruong) => ManTruong, (m: ManTruong) => void][] = [
    ["tên «Hướng»", (x) => doiChu(x, x.o[1]!.khoa, "Hướng"), (x) => {
      assert.equal(trungNghia(x, x.o[1]!.khoa), "Đã có trường «Hướng» — đổi tên ở Cách gọi");
      assert.equal(coTheLuu(x), false);
    }],
    ["số điện thoại", (x) => doiChu(x, x.o[1]!.khoa, "Gọi 0900 000 001"), (x) => {
      assert.match(loiCuaO(x, x.o[1]!.khoa) ?? "", /số điện thoại/);
      assert.equal(coTheLuu(x), false);
    }],
    ["chọn một không lựa chọn", (x) => doiKieu(doiChu(x, x.o[1]!.khoa, "Mức"), x.o[1]!.khoa, "single_select"), (x) => {
      assert.match(loiCuaO(x, x.o[1]!.khoa) ?? "", /ít nhất một lựa chọn/);
      assert.equal(coTheLuu(x), false);
    }],
    ["liên hệ không loại", (x) => { const y = themTruong(x, "contact"); return doiChu(y, khoaMoi(y), "Mức ưu tiên"); }, (x) => {
      assert.match(loiCuaO(x, khoaMoi(x)) ?? "", /loại liên hệ/);
      assert.equal(coTheLuu(x), false);
    }],
  ];
  let dem = 0;
  for (const [ten, doi, kiem] of BANG) {
    kiem(doi(manMau()));
    dem++;
    void ten;
  }
  assert.equal(dem, BANG.length);

  // Đủ 20 trường còn sống → không thêm được.
  const hai_muoi: TruongRieng[] = Array.from({ length: 20 }, (_, i) => ({ code: `t_${i}`, target: "listing", contactTypes: [], kind: "bool", label: `Trường ${i}`, options: [], dataClass: "custom_field", archived: false }));
  assert.equal(coTheThem(manBanDau(hai_muoi)), false);
  assert.equal(coTheThem(manBanDau(hai_muoi.slice(1))), true, "đối chứng: 19 trường còn thêm được");
  // Trường liên hệ có Chủ bán → huy hiệu «Thông tin chủ nhà».
  assert.equal(laNguon({ target: "contact", contactTypes: ["Seller"] }), true);
  assert.equal(laNguon({ target: "contact", contactTypes: ["Buyer"] }), false);
  assert.equal(laNguon({ target: "listing", contactTypes: [] }), false);
});

test("màn trường riêng: trang thật thay trang tạm", () => {
  const trang = join(DAY, "page.tsx");
  assert.ok(existsSync(trang), "thiếu settings/fields/page.tsx");
  assert.match(readFileSync(trang, "utf8"), /chanMucSan\(/, "trang không chặn người không phải quản trị");
  const tam = readFileSync(join(DAY, "../../../../components/shell/placeholder.tsx"), "utf8");
  assert.ok(!tam.includes('"/settings/fields"'), "trang tạm vẫn giữ /settings/fields");
});
