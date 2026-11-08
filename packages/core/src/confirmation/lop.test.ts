import assert from "node:assert/strict";
import { test } from "node:test";
import { LOP_TRUONG } from "../redaction/lop-truong";
import { KHOA_RIENG, kiemLopKhoa, LOP_TRUONG_KHUON } from "./khuon";

test("khoá phát ra đều lớp danh mục", () => {
  assert.deepEqual(kiemLopKhoa(KHOA_RIENG, LOP_TRUONG_KHUON, LOP_TRUONG), []);
  assert.deepEqual(Object.keys(LOP_TRUONG_KHUON), ["buildingKey", "skippedFloors", "stacks"]);
  assert.deepEqual(
    Object.keys(LOP_TRUONG_KHUON).filter((k) => k in LOP_TRUONG),
    [],
    "bảng lớp của khuôn rời bảng lớp của luật ẩn",
  );
  // Đối chứng âm cùng hàm kiểm: khoá giá và khoá hai nơi.
  const loiGia = kiemLopKhoa({ ...KHOA_RIENG, unit_attributes: [...KHOA_RIENG.unit_attributes, "listPrice"] }, LOP_TRUONG_KHUON, LOP_TRUONG);
  assert.ok(loiGia.includes("listPrice: lớp shareable_listing"), JSON.stringify(loiGia));
  const loiHaiNoi = kiemLopKhoa(KHOA_RIENG, { ...LOP_TRUONG_KHUON, unitNumber: "catalog" }, LOP_TRUONG);
  assert.ok(loiHaiNoi.some((l) => l.startsWith("unitNumber: khoá hai nơi")), JSON.stringify(loiHaiNoi));
});
