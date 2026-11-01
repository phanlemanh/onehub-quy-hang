// Hoàn tác lô (hàng 16) — E3. Ma trận viết tay của hàm quyết.
import assert from "node:assert/strict";
import { test } from "node:test";
import { lenhHoanTac } from "../cell-edit/hoan-tac";
import type { HangSua, Lenh } from "../cell-edit/lenh";
import { chuHoanTacLo, dungLo, xetHoanTacLo, type BanGhiLo } from "./hoan-tac-lo";

const VE_ACTIVE: Lenh = { type: "status_changed", payload: { to: "Active" } };
const lo = (): BanGhiLo => ({ muc: [{ id: "1", lenh: VE_ACTIVE, phienBanSau: 5 }, { id: "2", lenh: VE_ACTIVE, phienBanSau: 8 }, { id: "3", lenh: VE_ACTIVE, phienBanSau: 2 }], daDung: false });
const HIEN: Record<string, number | undefined> = { "1": 5, "2": 9, "3": undefined };

test("E3 bù đúng căn chưa có lần sửa sau, đếm căn bỏ qua", () => {
  const kq = xetHoanTacLo(lo(), (id) => HIEN[id]);
  assert.deepEqual(kq, { ok: true, bu: [{ id: "1", lenh: VE_ACTIVE, coSo: 5 }], suaSau: 2, khongDao: 0 });
  assert.ok(kq.ok);
  assert.equal(chuHoanTacLo(kq, 1), "Đã hoàn tác 1 căn · 2 căn đã có lần sửa sau — bỏ qua");
});

test("E3 lệnh bù lấy từ lenhHoanTac của trình sửa trên ô (về nấc cũ)", () => {
  const truoc: HangSua = { id: "1", unitNumber: "B-1", listPrice: 1, feeInclusion: "excluded", standardStatus: "Active", legalStatus: "a", occupantType: "b" };
  assert.deepEqual(lenhHoanTac(truoc, { type: "status_changed", payload: { to: "Hold" } }), VE_ACTIVE);
});

test("E3 lô đã dùng → «Đã hoàn tác rồi», không lệnh", () => {
  const b = lo();
  assert.ok(dungLo(b, (id) => HIEN[id]).ok);
  assert.deepEqual(dungLo(b, (id) => HIEN[id]), { ok: false, loi: "Đã hoàn tác rồi" });
});

test("E3 căn chuyển không đảo được → bỏ qua, đếm riêng", () => {
  const kq = xetHoanTacLo({ muc: [{ id: "1", lenh: null, phienBanSau: 3 }], daDung: false }, () => 3);
  assert.deepEqual(kq, { ok: true, bu: [], suaSau: 0, khongDao: 1 });
});

test("E3 đối chứng đỏ: bỏ so phiên bản thì căn 2 bị bù", () => {
  const xetSai = (b: BanGhiLo) => b.muc.filter((m) => m.lenh).map((m) => m.id);
  assert.ok(xetSai(lo()).includes("2"), "bản bỏ so phiên bản phải bù căn 2 — căn đã có lần sửa sau");
  const that = xetHoanTacLo(lo(), (id) => HIEN[id]);
  assert.ok(that.ok && !that.bu.some((x) => x.id === "2"), "bản thật không bù căn 2");
});
