import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { duongCuaVo } from "@quy-hang/core";

import { mucDangChon } from "../../app/(app)/today/mo-nhom";
import { MUC_SAN } from "../../app/(app)/settings/cai-dat";

// Mục sáng theo địa chỉ khai: đưa thẳng kết quả của duongCuaVo vào mucDangChon, như NavList làm.
const NHOM = [
  { label: "Quá hạn", href: "/today?nhom=qua_han" },
  { label: "Gọi lại", href: "/today?nhom=goi_lai" },
];
const sangKhi = (items: Parameters<typeof mucDangChon>[0], vao: Parameters<typeof duongCuaVo>[0]) => {
  const vo = duongCuaVo(vao);
  return mucDangChon(items, vo.duong, vo.thamSo);
};

describe("mục sáng của bản mẫu theo địa chỉ khai", () => {
  it("khai /settings/labels thì sáng Cách gọi", () => {
    assert.equal(sangKhi(MUC_SAN, { pathname: "/proto/x", khai: "/settings/labels" }), "/settings/labels");
  });
  it("khai /today?nhom=goi_lai thì sáng đúng nhóm ấy", () => {
    assert.equal(sangKhi(NHOM, { pathname: "/proto/x", khai: "/today?nhom=goi_lai" }), "/today?nhom=goi_lai");
  });
  it("tham số ?loi= của đường thật không đổi mục sáng", () => {
    assert.equal(sangKhi(NHOM, { pathname: "/proto/x", thamSo: "loi=reui&nhom=qua_han", khai: "/today?nhom=goi_lai" }), "/today?nhom=goi_lai");
  });
  it("màn thật có tham số giữ đúng mục sáng", () => {
    assert.equal(sangKhi(NHOM, { pathname: "/today", thamSo: "nhom=qua_han" }), "/today?nhom=qua_han");
  });
  it("chiều đỏ: dùng đường thật /proto/x thì không mục nào sáng", () => {
    assert.equal(mucDangChon(MUC_SAN, "/proto/x", ""), null);
  });
});
