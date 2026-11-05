// Hàng 92 (E2, E3): mốc màu ô hạn và bảng nút của dòng việc Hôm nay đầu chủ — ma trận viết trước, cặp hai chiều.
import assert from "node:assert/strict";
import { test } from "node:test";

import { BO_NHOM_MAC_DINH } from "@quy-hang/core/today";

import { mucHan, nutCuaViec, viecCuaDong, type MaViec } from "./viec-dong";

const BAY_GIO = "2026-11-04T10:00:00.000Z";
const sau = (giay: number) => new Date(Date.parse(BAY_GIO) + giay * 1000).toISOString();

test("mucHan: đỏ khi quá, vàng dưới 15 phút, thường từ 15 phút", () => {
  const ca: [string | null, string][] = [
    [sau(-60), "qua"],
    [sau(14 * 60 + 59), "sap"],
    [sau(15 * 60), "thuong"],
    [sau(2 * 3600), "thuong"],
    [null, "khong"],
  ];
  for (const [han, mong] of ca) assert.equal(mucHan(han, BAY_GIO), mong, String(han));
  // Chiều đỏ: ngưỡng 10 phút thì ca 14:59 ra thường — ngưỡng 15 phút là thứ được đo.
  assert.equal(mucHan(sau(14 * 60 + 59), BAY_GIO, 10), "thuong");
});

test("nutCuaViec: đúng một nút chính, mọi việc khác vào ⋯", () => {
  const nhomLead = BO_NHOM_MAC_DINH.find((n) => n.actions.includes("accept"))!;
  const ca: { ten: string; v: Parameters<typeof nutCuaViec>[0]; chinh: MaViec }[] = [
    ...BO_NHOM_MAC_DINH.filter((n) => n.subject === "listing").map((n) => ({
      ten: `căn · ${n.code}`,
      v: { kind: "can" as const, nhom: n },
      chinh: (n.actions.includes("owner_confirmed") ? "con-giu-gia" : "doi-gia-trang-thai") as MaViec,
    })),
    { ten: "lead sent", v: { kind: "lead", nhom: nhomLead, stage: "sent" }, chinh: "nhan" },
    { ten: "lead accepted", v: { kind: "lead", nhom: nhomLead, stage: "accepted" }, chinh: "da-goi" },
    { ten: "lead called", v: { kind: "lead", nhom: nhomLead, stage: "called" }, chinh: "da-goi" },
  ];
  assert.equal(ca.length, BO_NHOM_MAC_DINH.filter((n) => n.subject === "listing").length + 3);
  for (const { ten, v, chinh } of ca) {
    const n = nutCuaViec(v);
    assert.equal(n.chinh, chinh, ten);
    // Không việc nào mất: chính ∪ ⋯ = mọi việc hàng 22 cho dòng ấy.
    assert.deepEqual([n.chinh, ...n.phu].sort(), [...viecCuaDong(v)].sort(), ten);
    assert.ok(!n.phu.includes(chinh), `${ten}: nút chính lặp trong ⋯`);
    if (v.kind === "lead") for (const m of ["tra-lai", "mo-so", "ghi-cuoc-goi"] as const) assert.ok(n.phu.includes(m), `${ten}: ⋯ thiếu ${m}`);
  }
  // Chiều đỏ: bỏ một việc khỏi ⋯ thì phép so tập nêu đúng việc thiếu.
  const v = ca.find((c) => c.ten === "lead sent")!.v;
  const n = nutCuaViec(v);
  const thieu = { ...n, phu: n.phu.filter((m) => m !== "tra-lai") };
  assert.throws(() => assert.deepEqual([thieu.chinh, ...thieu.phu].sort(), [...viecCuaDong(v)].sort(), "thiếu tra-lai"), /thiếu tra-lai/);
});
