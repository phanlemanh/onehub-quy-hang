// Hồ sơ liên hệ: mục trường riêng (hàng 47, E6c).
import assert from "node:assert/strict";
import { test } from "node:test";
import type { TruongRieng } from "@quy-hang/core/custom-fields";

import { CHUA_GHI, chuMucTruong, thanPatch, truongCuaNguoi } from "./truong-rieng";

const BO: TruongRieng[] = [
  { code: "nguon_khach", target: "contact", contactTypes: ["Buyer", "Tenant"], kind: "single_select", label: "Nguồn khách", options: [{ code: "zalo", label: "Zalo" }], dataClass: "custom_field", archived: false },
  { code: "gio_goi_duoc", target: "contact", contactTypes: ["Seller", "Landlord"], kind: "single_select", label: "Giờ gọi được", options: [{ code: "sang", label: "Sáng" }], dataClass: "source", archived: false },
  { code: "da_bo", target: "contact", contactTypes: ["Seller"], kind: "bool", label: "Đã bỏ", options: [], dataClass: "source", archived: true },
  { code: "can_goc", target: "listing", contactTypes: [], kind: "bool", label: "Căn góc", options: [], dataClass: "custom_field", archived: false },
];

test("hồ sơ liên hệ: mục trường riêng", () => {
  const BANG: [string[], string[]][] = [
    [["Seller"], ["gio_goi_duoc"]],
    [["Buyer"], ["nguon_khach"]],
    [["Seller", "Buyer"], ["nguon_khach", "gio_goi_duoc"]],
    [[], []],
  ];
  let dem = 0;
  for (const [loai, mong] of BANG) {
    assert.deepEqual(truongCuaNguoi(BO, loai).map((t) => t.code).sort(), [...mong].sort(), JSON.stringify(loai));
    dem++;
  }
  assert.equal(dem, BANG.length);
  const gio = BO[1]!;
  assert.equal(chuMucTruong(gio, "sang"), "Sáng");
  assert.equal(chuMucTruong(gio, undefined), CHUA_GHI);
  assert.deepEqual(thanPatch("gio_goi_duoc", "sang"), { gio_goi_duoc: "sang" });
});
