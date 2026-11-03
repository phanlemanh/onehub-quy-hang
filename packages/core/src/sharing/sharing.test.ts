// Lần gửi ở lõi (hàng 86: AC-9). Phong bì công khai không mang nhu cầu, liên hệ, tên khách, số.
import assert from "node:assert/strict";
import { test } from "node:test";
import { MAX_SHARE_LISTINGS, newShareCode, publicEnvelope, SHARE_CODE, SHARE_PUBLIC_KEYS, validateShareInput, type ShareRecord } from ".";

const ma = (n: number) => `00000000-0000-4000-8000-${String(n).padStart(12, "0")}`;
/** Máy dò số: bỏ ký tự không phải chữ số, tìm chín chữ số cuối của từng số. */
const doSo = (chu: string, so: string[]) => so.filter((x) => chu.replace(/\D/g, "").includes(x.replace(/\D/g, "").slice(-9))).length;

test("Lần gửi: phong bì công khai", () => {
  const SO = "0900 000 012";
  const rec: ShareRecord = {
    code: "AbCdEfGhIjKl",
    audience: "client",
    listingIds: [ma(3), ma(1), ma(2)],
    senderUserId: "u-dau-khach",
    prospectId: "pppppppp-0000-4000-8000-000000000001",
    contactId: "cccccccc-0000-4000-8000-000000000001",
    displayName: "[Tên]",
    phone: SO,
    criteria: { BedroomsTotalMin: 2 },
  };
  // Đối chứng dương: máy dò bắt được số trên bản ghi gốc.
  assert.equal(doSo(JSON.stringify(rec), [SO]), 1, "đối chứng: máy dò không bắt được số trên bản ghi gốc");
  const p = publicEnvelope(rec);
  assert.deepEqual([...SHARE_PUBLIC_KEYS], ["code", "audience", "listingIds", "senderUserId"]);
  assert.deepEqual(Object.keys(p), [...SHARE_PUBLIC_KEYS], "khoá thừa hay thiếu trong phong bì");
  assert.deepEqual(p.listingIds, [ma(3), ma(1), ma(2)], "thứ tự căn");
  const json = JSON.stringify(p);
  for (const x of ["[Tên]", "pppppppp-0000-4000-8000-000000000001", "cccccccc-0000-4000-8000-000000000001", "BedroomsTotalMin"]) {
    assert.ok(!json.includes(x), `phong bì lộ ${x}`);
  }
  assert.equal(doSo(json, [SO]), 0, "phong bì lộ số");
});

test("Lần gửi: khuôn nhập", () => {
  const P = ma(99);
  // [tên dòng, thân, path lỗi mong đợi — null là hợp lệ]
  const BANG: [string, unknown, string | null][] = [
    ["client có nhu cầu + 1 căn", { audience: "client", prospectId: P, listingIds: [ma(1)] }, null],
    ["agents không nhu cầu", { audience: "agents", listingIds: [ma(1), ma(2)] }, null],
    ["khán giả lạ", { audience: "group", listingIds: [ma(1)] }, "audience"],
    ["client thiếu nhu cầu", { audience: "client", listingIds: [ma(1)] }, "prospectId"],
    ["agents có nhu cầu", { audience: "agents", prospectId: P, listingIds: [ma(1)] }, "prospectId"],
    ["0 căn", { audience: "agents", listingIds: [] }, "listingIds"],
    ["31 căn", { audience: "agents", listingIds: Array.from({ length: MAX_SHARE_LISTINGS + 1 }, (_, i) => ma(i)) }, "listingIds"],
    ["căn trùng", { audience: "agents", listingIds: [ma(1), ma(1)] }, "listingIds"],
    ["mã căn không phải uuid", { audience: "agents", listingIds: ["A-12-03"] }, "listingIds"],
    ["khoá lạ", { audience: "agents", listingIds: [ma(1)], note: "x" }, "note"],
  ];
  let so = 0;
  for (const [ten, than, loi] of BANG) {
    const r = validateShareInput(than);
    if (loi === null) assert.ok(r.ok, `${ten}: ${JSON.stringify(r)}`);
    else {
      assert.ok(!r.ok, `${ten}: khuôn nhận thân sai`);
      if (!r.ok) assert.deepEqual(r.errors.map((e) => e.path), [loi], ten);
    }
    so++;
  }
  assert.equal(so, 10);
  assert.equal(MAX_SHARE_LISTINGS, 30);
});

test("Lần gửi: mã link", () => {
  const thay = new Set<string>();
  for (let i = 0; i < 1000; i++) {
    const m = newShareCode();
    assert.match(m, SHARE_CODE);
    assert.match(m, /^[A-Za-z0-9_-]{12}$/);
    thay.add(m);
  }
  assert.equal(thay.size, 1000, "mã link trùng");
});
