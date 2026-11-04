// Trang khách `/s/<mã>` (hàng 35: AC-2, AC-3, AC-6) — dựng bằng renderToStaticMarkup từ bản ra của căn mồi.
import assert from "node:assert/strict";
import { readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { banRaNgoai, canMoi, type CanNoiBo, type CanRaNgoai, type NguoiNhan } from "@quy-hang/core/redaction";
import type { StandardStatus } from "@quy-hang/core/listing";
import { createElement as h } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { docThan } from "./doc";
import { TheCan } from "./the-can";
import { LINK_TAT, TrangKhachCongKhai } from "./trang";

const HOM_NAY = "2026-11-04";
const MA = "AbCdEfGhIjKl";
const ra = (c: CanNoiBo, nguoiNhan: NguoiNhan) => banRaNgoai(c, { cua: "gui_link", nguoiNhan, today: HOM_NAY });
const than = (can: CanRaNgoai[], nguoiNhan: NguoiNhan) => ({ companyName: "[Tên sàn] Mồi", senderName: "[Tên] Người gửi mồi", nguoiNhan, can, listingIds: can.map((_, i) => `L${i}`) });
const dung = (can: CanRaNgoai[], nguoiNhan: NguoiNhan) => renderToStaticMarkup(h(TrangKhachCongKhai, { code: MA, than: than(can, nguoiNhan) }));

test("trang khách: người nhận quyết mã căn", () => {
  const m = canMoi();
  const rieng = dung([ra(m, "khach_rieng")], "khach_rieng");
  const nhom = dung([ra(m, "nhom_moi_gioi")], "nhom_moi_gioi");
  for (const k of [m.unitNumber!, m.stack!]) assert.ok(!rieng.includes(k), `khách riêng thấy ${k}`);
  assert.ok(nhom.includes(m.unitNumber!), "nhóm môi giới không thấy mã căn");
  for (const chu of [rieng, nhom]) assert.ok(chu.includes(m.buildingName), "thiếu tên toà");
});

test("trang khách: giá xác nhận", () => {
  const BANG: [number | null, string | null][] = [
    [0, "Giá xác nhận hôm nay"],
    [3, "Giá xác nhận 3 ngày trước"],
    [null, null],
  ];
  assert.equal(BANG.length, 3, "số dòng bảng viết trước");
  for (const [ngay, mong] of BANG) {
    const b: CanRaNgoai = { ...ra(canMoi(), "khach_rieng"), confirmedAgeDays: ngay };
    const chu = renderToStaticMarkup(h(TheCan, { b, i: 0, code: MA, listingId: "L0" }));
    if (mong) assert.ok(chu.includes(mong), `${ngay}: thiếu «${mong}»`);
    else assert.ok(!chu.includes("Giá xác nhận"), "vắng tuổi mà vẫn có chữ");
  }
});

test("trang khách: căn theo trạng thái", () => {
  const BANG: [StandardStatus, string, boolean, string | null, boolean][] = [
    // [trạng thái, availability, mờ, nhãn, có giá]
    ["Active", "available", false, null, true],
    ["Pending", "under_contract", true, "Đã có người đặt cọc", true],
    ["Hold", "paused", true, "Tạm ngưng", false],
    ["Closed", "unavailable", true, "Không còn", false],
  ];
  assert.equal(BANG.length, 4, "số dòng bảng viết trước");
  const ban = BANG.map(([st]) => ra({ ...canMoi(), standardStatus: st }, "khach_rieng"));
  const chu = dung(ban, "khach_rieng");
  const the = chu.split("<article").slice(1);
  assert.equal(the.length, 4, "số thẻ");
  BANG.forEach(([st, av, mo, nhan, coGia], i) => {
    const t = the[i]!;
    assert.ok(t.includes(`data-trang-thai="${av}"`), `${st}: sai thứ tự hay trạng thái`);
    assert.equal(t.includes("data-mo=\"\""), mo, `${st}: mờ`);
    if (nhan) assert.ok(t.includes(nhan), `${st}: thiếu nhãn`);
    assert.equal(t.includes(" tỷ"), coGia, `${st}: giá`);
    assert.equal(t.includes("Quan tâm"), av === "available", `${st}: nút Quan tâm`);
  });
});

test("trang khách: link không mở được", () => {
  const chu = renderToStaticMarkup(h(TrangKhachCongKhai, { code: MA, than: null }));
  assert.ok(chu.includes(LINK_TAT), "thiếu câu link không mở được");
  assert.equal(LINK_TAT, "Link không còn mở được — hỏi lại người gửi");
  for (const lo of ["[Tên sàn] Mồi", canMoi().buildingName]) assert.ok(!chu.includes(lo), `lộ ${lo}`);
});

test("trang khách: trang không đệm", async () => {
  const trang = await import("./page");
  assert.deepEqual(trang.dynamic, "force-dynamic");
  const goi: { url: string; init: RequestInit }[] = [];
  await docThan(MA, (url, init) => {
    goi.push({ url, init });
    return new Response("{}", { status: 404 });
  });
  assert.deepEqual(goi.map((g) => g.init.cache), ["no-store"]);
});

test("trang khách: chỉ trang thật dưới /s/", () => {
  const goc = join(dirname(fileURLToPath(import.meta.url)), "..");
  assert.deepEqual(readdirSync(goc).sort(), ["[code]"]);
});
