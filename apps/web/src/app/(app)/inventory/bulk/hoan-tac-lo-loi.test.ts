// Đường lỗi của hoàn tác lô (va-duong-loi-hoan-tac) — E1, E2, E5. `sua` giả tiêm lỗi theo mã căn viết trước.
import assert from "node:assert/strict";
import { test } from "node:test";
import type { GhiFn, Lenh, LoiGhi } from "../cell-edit/lenh";
import { chayHoanTacLo, chuHoanTacLo, type BanGhiLo, type ThongBaoLo } from "./hoan-tac-lo";

const VE_ACTIVE: Lenh = { type: "status_changed", payload: { to: "Active" } };
const MA = ["A-01", "A-02", "A-03", "A-04", "A-05", "A-06", "A-07", "A-08"];
const lo = (n: number): BanGhiLo => ({ muc: MA.slice(0, n).map((m, i) => ({ id: `id-${i}`, lenh: VE_ACTIVE, phienBanSau: 10 + i, nhan: m })), daDung: false });
const phienBan = (b: BanGhiLo) => (id: string) => b.muc.find((m) => m.id === id)?.phienBanSau;

/** `sua` giả: căn trong `hong` trả lỗi đã định; còn lại ghi được. Ghi lại id từng lần gọi. */
function suaGia(hong: Record<string, LoiGhi>) {
  const goi: string[] = [];
  const sua: GhiFn = async (id, _type, _payload, coSo) => {
    goi.push(id);
    const loi = hong[id];
    return loi ? { ok: false, loi } : { ok: true, op: { expectedVersion: coSo ?? 0 } };
  };
  return { sua, goi };
}
const KHO: LoiGhi = { kind: "kho" };

test("hoàn tác lô: 2 trong 5 căn không ghi được", async () => {
  const b = lo(5);
  const { sua } = suaGia({ "id-1": KHO, "id-3": KHO });
  const tb = await chayHoanTacLo(b, phienBan(b), sua);
  assert.equal(tb.loai, "trung-tinh", "loại thông báo");
  assert.equal(tb.chu, "Đã hoàn tác 3 căn · 2 căn chưa hoàn tác được");
  assert.equal(tb.moTa, "A-02 (Máy chưa lưu được lần sửa — thử lại) · A-04 (Máy chưa lưu được lần sửa — thử lại)");
  for (const ve of ["A-01", "A-03", "A-05"]) assert.ok(!tb.moTa!.includes(ve), `mô tả kể căn đã về ${ve}`);
  assert.deepEqual(tb.tichLai, ["id-1", "id-3"]);
});

test("hoàn tác lô: liệt tối đa năm mã", async () => {
  const b = lo(7);
  const { sua } = suaGia(Object.fromEntries(b.muc.map((m) => [m.id, KHO])));
  const tb = await chayHoanTacLo(b, phienBan(b), sua);
  assert.equal(tb.moTa, ["A-01", "A-02", "A-03", "A-04", "A-05"].map((m) => `${m} (Máy chưa lưu được lần sửa — thử lại)`).concat("và 2 căn khác").join(" · "));
  assert.equal(tb.tichLai.length, 7);
  assert.equal(tb.chu, "Đã hoàn tác 0 căn · 7 căn chưa hoàn tác được");
});

test("hoàn tác lô: bấm lại chỉ ghi căn chưa về", async () => {
  const b = lo(5);
  const lan1 = suaGia({ "id-1": KHO, "id-3": KHO });
  const tb1 = await chayHoanTacLo(b, phienBan(b), lan1.sua);
  assert.ok(tb1.thuLai);
  const lan2 = suaGia({});
  const tb2 = await chayHoanTacLo(tb1.thuLai, phienBan(b), lan2.sua);
  assert.deepEqual(lan2.goi, ["id-1", "id-3"]);
  assert.equal(tb2.loai, "thanh-cong");
  assert.equal(tb2.chu, "Đã hoàn tác 2 căn");
  assert.deepEqual(await chayHoanTacLo(tb1.thuLai, phienBan(b), lan2.sua), { loai: "loi", chu: "Đã hoàn tác rồi", thuLai: null, tichLai: [] } satisfies ThongBaoLo);
});

test("hoàn tác lô: căn chưa về có lần sửa sau", async () => {
  const b = lo(5);
  const tb1 = await chayHoanTacLo(b, phienBan(b), suaGia({ "id-1": KHO, "id-3": KHO }).sua);
  // id-3 có lần sửa sau trước khi bấm lại: phiên bản trên máy đổi.
  const hien = (id: string) => (id === "id-3" ? 99 : phienBan(b)(id));
  const lan2 = suaGia({});
  const tb2 = await chayHoanTacLo(tb1.thuLai!, hien, lan2.sua);
  assert.deepEqual(lan2.goi, ["id-1"]);
  assert.ok(tb2.chu.includes("1 căn đã có lần sửa sau — bỏ qua"), tb2.chu);
});

test("hoàn tác lô: loại lỗi nào được bấm lại", async () => {
  const BANG: [LoiGhi, boolean][] = [
    [{ kind: "kho" }, true],
    [{ kind: "bat-ngo" }, true],
    [{ kind: "not-found" }, false],
    [{ kind: "invalid-transition", reason: "không chuyển được" }, false],
    [{ kind: "missing-requirement", missing: [] }, false],
  ];
  for (const [loi, bamLai] of BANG) {
    const b = lo(2);
    const tb = await chayHoanTacLo(b, phienBan(b), suaGia({ "id-0": loi }).sua);
    assert.equal(tb.thuLai !== null && tb.thuLai.muc.some((m) => m.id === "id-0"), bamLai, `${loi.kind}: vào bản ghi bấm lại`);
    if (!bamLai) assert.ok(tb.chu.includes("1 căn không hoàn tác được"), `${loi.kind}: ${tb.chu}`);
  }
  assert.equal(BANG.length, 5);
});

test("hoàn tác lô: mọi căn về như cũ", async () => {
  const b = lo(5);
  const tb = await chayHoanTacLo(b, phienBan(b), suaGia({}).sua);
  assert.deepEqual(tb, { loai: "thanh-cong", chu: "Đã hoàn tác 5 căn", thuLai: null, tichLai: [] } satisfies ThongBaoLo);
  // Lần sửa sau và chuyển không đảo được: đúng chuỗi của chuHoanTacLo cũ.
  const c: BanGhiLo = { muc: [{ id: "x", lenh: VE_ACTIVE, phienBanSau: 1 }, { id: "y", lenh: VE_ACTIVE, phienBanSau: 1 }, { id: "z", lenh: null, phienBanSau: 1 }], daDung: false };
  const tc = await chayHoanTacLo(c, (id) => (id === "y" ? 2 : 1), suaGia({}).sua);
  assert.equal(tc.chu, chuHoanTacLo({ ok: true, bu: [], suaSau: 1, khongDao: 1 }, 1));
  assert.equal(tc.chu, "Đã hoàn tác 1 căn · 1 căn đã có lần sửa sau — bỏ qua · 1 căn không hoàn tác được");
});
