// Xem trước của màn Gửi (hàng 34: AC-4): trang khách dựng từ bản ra của đúng người nhận.
import assert from "node:assert/strict";
import { test } from "node:test";
import { banRaNgoai, canMoi, type CanRaNgoai, type NguoiNhan } from "@quy-hang/core/redaction";
import type { ComponentProps } from "react";
import { createElement as h } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { TrangKhach } from "./trang-khach";

const MA = "[Mã]-1203";
const can = { ...canMoi(), unitNumber: MA };
const dung = (nguoiNhan: NguoiNhan) =>
  renderToStaticMarkup(h(TrangKhach, { ban: [banRaNgoai(can, { cua: "gui_link", nguoiNhan, today: "2026-11-03" })], nguoiNhan }));

test("xem trước: dựng từ bản ra của người nhận", () => {
  const rieng = dung("khach_rieng");
  const nhom = dung("nhom_moi_gioi");
  assert.ok(!rieng.includes(MA), "trang khách riêng lộ mã căn");
  assert.ok(rieng.includes("Toà Mồi A"), "trang khách riêng thiếu tên toà");
  assert.ok(nhom.includes(MA), "đối chứng: trang nhóm môi giới thiếu mã căn");
  assert.notEqual(rieng, nhom);
  // Kiểu của prop là bản ra: trang không nhận hàng nội bộ.
  type Ban = ComponentProps<typeof TrangKhach>["ban"][number];
  const kieu: [Ban] extends [CanRaNgoai] ? ([CanRaNgoai] extends [Ban] ? true : false) : false = true;
  assert.equal(kieu, true);
});
