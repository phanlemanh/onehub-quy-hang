// Góc nhìn lưu trên máy theo người và sàn (hàng 14) — E7. Kho giả là Map thay bộ nhớ trình duyệt.
import assert from "node:assert/strict";
import { test } from "node:test";
import { CACH_XEM_MAC_DINH, daDoi, docGocNhin, doiTen, khoaGocNhin, luuDe, luuMoi, xoa, type CachXem, type KhoChu } from "./goc-nhin";

function khoGia(): KhoChu & { m: Map<string, string> } {
  const m = new Map<string, string>();
  return { m, getItem: (k) => m.get(k) ?? null, setItem: (k, v) => void m.set(k, v) };
}
const CX: CachXem = { loc: { standardStatus: "Active", listPrice: "<=5" }, cot: ["buildingName", "unitNumber", "listPrice"], sap: [{ id: "listPrice", desc: false }], nhom: "toa" };
const LUC = "2026-10-31T00:00:00Z";

test("góc nhìn: lưu rồi đọc lại đúng bốn phần qua chính hàm ghi và hàm đọc", () => {
  const k = khoGia();
  const kq = luuMoi(k, "nguoi-a", "san-1", "  2PN dưới 5 tỷ ", CX, "g1", LUC);
  assert.ok(kq.ok);
  const [g] = docGocNhin(k, "nguoi-a", "san-1");
  assert.equal(g?.ten, "2PN dưới 5 tỷ");
  assert.deepEqual({ loc: g?.loc, cot: g?.cot, sap: g?.sap, nhom: g?.nhom }, CX);
});

test("góc nhìn: khoá theo người và sàn — người khác, sàn khác đọc ra rỗng", () => {
  const k = khoGia();
  luuMoi(k, "nguoi-a", "san-1", "Của A", CX, "g1", LUC);
  assert.equal(docGocNhin(k, "nguoi-b", "san-1").length, 0, "người B không thấy góc nhìn của A");
  assert.equal(docGocNhin(k, "nguoi-a", "san-2").length, 0, "sàn khác không thấy góc nhìn của sàn 1");
  assert.equal(docGocNhin(k, "nguoi-a", "san-1").length, 1);
});

test("đối chứng đỏ: khoá bỏ phần sàn thì ca sàn khác lộ ra", () => {
  const khoaSai = (n: string) => `qh:goc-nhin:v1:${n}`;
  assert.equal(khoaSai("nguoi-a"), khoaSai("nguoi-a"));
  assert.notEqual(khoaGocNhin("nguoi-a", "san-1"), khoaGocNhin("nguoi-a", "san-2"), "khoá phải chứa sàn — thiếu thì hai sàn dùng chung một khoá");
});

test("góc nhìn: tên rỗng, khoảng trắng, quá dài, trùng không phân biệt hoa thường bị từ chối", () => {
  const k = khoGia();
  luuMoi(k, "a", "s", "2PN dưới 5 tỷ", CX, "g1", LUC);
  for (const [ten, lyDo] of [
    ["", "Đặt tên cho góc nhìn"],
    ["   ", "Đặt tên cho góc nhìn"],
    ["x".repeat(61), "Tên dài tối đa 60 ký tự"],
    ["2pn DƯỚI 5 TỶ", "Đã có góc nhìn tên này"],
  ] as const) {
    const kq = luuMoi(k, "a", "s", ten, CX, "g2", LUC);
    assert.deepEqual(kq, { ok: false, lyDo }, `tên «${ten.slice(0, 10)}»`);
  }
  assert.equal(docGocNhin(k, "a", "s").length, 1, "không lần từ chối nào ghi vào kho");
  assert.ok(luuMoi(k, "a", "s", "x".repeat(60), CX, "g3", LUC).ok, "đúng 60 ký tự thì được");
});

test("góc nhìn: lưu đè, đổi tên, xoá", () => {
  const k = khoGia();
  luuMoi(k, "a", "s", "Một", CX, "g1", LUC);
  luuMoi(k, "a", "s", "Hai", CX, "g2", LUC);
  assert.ok(luuDe(k, "a", "s", "g1", { ...CX, loc: {} }, LUC));
  assert.deepEqual(docGocNhin(k, "a", "s")[0]?.loc, {});
  assert.deepEqual(doiTen(k, "a", "s", "g1", "hai"), { ok: false, lyDo: "Đã có góc nhìn tên này" });
  assert.ok(doiTen(k, "a", "s", "g1", "Một mới").ok);
  assert.ok(doiTen(k, "a", "s", "g1", "một MỚI").ok, "đổi hoa thường của chính nó thì được");
  xoa(k, "a", "s", "g2");
  assert.deepEqual(docGocNhin(k, "a", "s").map((g) => g.id), ["g1"]);
  assert.equal(luuDe(k, "a", "s", "khong-co", CX, LUC), false);
});

test("góc nhìn: bản ghi hỏng hay phiên bản lạ đọc ra rỗng, không ném", () => {
  const k = khoGia();
  for (const raw of ["{không phải json", JSON.stringify({ v: 2, ds: [] }), JSON.stringify({ v: 1, ds: "x" }), JSON.stringify(null)]) {
    k.m.set(khoaGocNhin("a", "s"), raw);
    assert.deepEqual(docGocNhin(k, "a", "s"), []);
  }
  k.m.set(khoaGocNhin("a", "s"), JSON.stringify({ v: 1, ds: [{ id: "g", ten: "T", loc: { cotLa: "x", listPrice: "<5" }, cot: ["buildingName", "cotLa"], sap: [], nhom: "toa" }] }));
  const [g] = docGocNhin(k, "a", "s");
  assert.deepEqual(g?.loc, { listPrice: "<5" }, "ô lọc của cột lạ bị bỏ");
  assert.deepEqual(g?.cot, ["buildingName"]);
});

test("góc nhìn: «đã đổi» — cùng trạng thái false, khác một ô lọc true, ô lọc rỗng không tính", () => {
  assert.equal(daDoi(CX, { ...CX }), false);
  assert.equal(daDoi(CX, { ...CX, loc: { ...CX.loc, listPrice: "" } }), true);
  assert.equal(daDoi({ ...CX, loc: { ...CX.loc, unitNumber: "" } }, CX), false);
  assert.equal(daDoi(CX, { ...CX, nhom: "khong" }), true);
  assert.equal(daDoi(CACH_XEM_MAC_DINH, { ...CACH_XEM_MAC_DINH, cot: CACH_XEM_MAC_DINH.cot.slice(1) }), true);
});
