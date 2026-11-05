// Màn Cách gọi (hàng 45): thân lưu, lỗi từng ô, khoá Lưu (E3c); trang gọi chặn mục sàn (E9b).
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { bangNhan } from "@quy-hang/core/labels";

import { coTheLuu, loiCuaO, oBanDau, oGiaTri, oTruong, thanLuu } from "./cach-goi-thuan";

const DAY = dirname(fileURLToPath(import.meta.url));

test("màn cách gọi: thân lưu và khoá Lưu", () => {
  const bo = bangNhan(null);
  const o = { ...oBanDau(bo), [oTruong("feeInclusion")]: "Phí CN", [oGiaTri("feeInclusion", "included")]: "BP", [oTruong("legalStatus")]: "" };
  assert.deepEqual(thanLuu(bo, o), {
    fields: [{ field: "feeInclusion", label: "Phí CN" }],
    values: [{ field: "feeInclusion", value: "included", label: "BP" }],
  });
  assert.equal(coTheLuu(o), true);
  // Ô chỉ khoảng trắng = rỗng: không gửi, không lỗi.
  const trang = { ...o, [oTruong("furnished")]: "   " };
  assert.deepEqual(thanLuu(bo, trang).fields.map((f) => f.field), ["feeInclusion"]);
  assert.equal(loiCuaO(oTruong("furnished"), "   "), null);
  // Số điện thoại, dài quá: lỗi gắn ô, Lưu khoá.
  const soDt = { ...o, [oTruong("legalStatus")]: "Gọi 0900 000 001" };
  assert.equal(loiCuaO(oTruong("legalStatus"), "Gọi 0900 000 001"), "Chứa số điện thoại");
  assert.equal(coTheLuu(soDt), false);
  assert.equal(loiCuaO(oGiaTri("feeInclusion", "excluded"), "x".repeat(41)), "Dài hơn 40 ký tự");
  assert.equal(coTheLuu({ ...o, [oGiaTri("feeInclusion", "excluded")]: "x".repeat(41) }), false);
});

test("màn cách gọi: ô ban đầu theo tên đã lưu", () => {
  const bo = bangNhan({ truong: { feeInclusion: "Phí CN" }, giaTri: { feeInclusion: { included: "BP" } } });
  const o = oBanDau(bo);
  assert.equal(o[oTruong("feeInclusion")], "Phí CN");
  assert.equal(o[oTruong("listPrice")], "");
  assert.equal(o[oGiaTri("feeInclusion", "included")], "BP");
  assert.equal(o[oGiaTri("feeInclusion", "excluded")], "");
});

test("màn cách gọi: trang gọi chặn mục sàn", () => {
  const chanTruocApi = (nguon: string) => {
    const chan = nguon.indexOf("chanMucSan(");
    const api = nguon.indexOf("/api/v1/company/");
    return chan > 0 && api > chan;
  };
  // Đối chứng dương: trang Người dùng chặn trước khi đọc API.
  assert.equal(chanTruocApi(readFileSync(join(DAY, "..", "users", "page.tsx"), "utf8")), true);
  const trang = readFileSync(join(DAY, "page.tsx"), "utf8");
  assert.equal(chanTruocApi(trang), true, "settings/labels/page.tsx phải gọi chanMucSan trước khi đọc API");
  // Chiều đỏ trên bản sao: bỏ dòng chặn thì phép đo đỏ.
  assert.equal(chanTruocApi(trang.replace(/chanMucSan\(/g, "boChan(")), false);
});
