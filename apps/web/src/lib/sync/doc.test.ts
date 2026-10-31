// Đọc từ kho trên máy, không chờ mạng (hàng 13: AC-2) và lưới nguồn khi kéo về (AC-1, phần thuần).
import assert from "node:assert/strict";
import { test } from "node:test";
import { apTrenMay } from "./ap-tren-may";
import { locDanhSach, moHoSo } from "./doc";
import { taoKhoBoNho } from "./kho";
import { keoVe, LoiKeo } from "./keo";
import { canDangBan, canMau, suKien, NGAY } from "./mau.test-helpers";
import { nganTrong, type Goi, type Ngan } from "./types";

const c = [
  canMau("a1", "[Toà A]"),
  canDangBan("a2", "[Toà A]"),
  canMau("a3", "[Toà A]", [suKien(2, "status_changed", { to: "Hold" })]),
  canMau("b1", "[Toà B]"),
  canDangBan("b2", "[Toà B]"),
  canDangBan("b3", "[Toà B]"),
];

function mangHong(): { goi: Goi; dem: () => number } {
  let n = 0;
  return { goi: async () => { n++; throw new Error("mất mạng"); }, dem: () => n };
}

test("đọc không chờ mạng: lọc, mở hồ sơ, dựng lại từ kho", async () => {
  const kho = taoKhoBoNho("u-x", new Map());
  await kho.write("san", { ...nganTrong(), listings: c.map((x) => x.view), history: { a2: c[1]!.events }, lastPullAt: NGAY, lastAttempt: "ok" });
  const mang = mangHong();
  const doc = async () => {
    const n = await kho.read("san");
    return {
      dangBan: locDanhSach(n, { trangThai: ["Active"] }).map((l) => l.id).sort(),
      toaB: locDanhSach(n, { toa: ["[Toà B]"] }).map((l) => l.id).sort(),
      daMo: moHoSo(n, "a2"),
      chuaMo: moHoSo(n, "b1"),
    };
  };
  const lan1 = await doc();
  assert.deepEqual(lan1.dangBan, ["a2", "b2", "b3"]);
  assert.deepEqual(lan1.toaB, ["b1", "b2", "b3"]);
  assert.equal(lan1.daMo!.lichSu.length, 4);
  assert.equal(lan1.chuaMo!.can.standardStatus, "Incomplete");
  assert.deepEqual(lan1.chuaMo!.lichSu, []);
  assert.equal(mang.dem(), 0, "đọc đã đi qua mạng");
  // Dựng lại từ cùng kho (như tải lại trang): cùng kết quả.
  assert.deepEqual(await doc(), lan1);
  assert.equal(mang.dem(), 0);
  // Đối chứng dương: chủ động kéo thì bộ đếm ghi nhận lời gọi.
  await assert.rejects(keoVe(mang.goi, await kho.read("san"), NGAY));
  assert.equal(mang.dem(), 1);
});

test("kéo về khi còn thao tác chờ: bản trên máy giữ giá vừa sửa", async () => {
  let n: Ngan = { ...nganTrong(), listings: [c[1]!.view], lastPullAt: NGAY, lastAttempt: "ok" };
  for (const [i, gia] of [3_600_000_000, 3_700_000_000].entries()) {
    const r = apTrenMay(n, "a2", "price_changed", { listPrice: gia, feeInclusion: "excluded" }, NGAY, `op-${i}`);
    assert.ok(r.ok);
    n = r.ngan;
  }
  const goi: Goi = async () => ({ status: 200, body: [c[1]!.view] });
  n = await keoVe(goi, n, NGAY);
  assert.equal(moHoSo(n, "a2")!.can.listPrice, 3_700_000_000);
  assert.equal(n.queue.length, 2);
});

test("kéo về: bản ghi mang nguồn bị bắt, kho không ghi", async () => {
  const n0: Ngan = nganTrong();
  const goi: Goi = async () => ({ status: 200, body: [c[0]!.view, { ...c[1]!.view, ownerPhone: "0900 000 012" }] });
  await assert.rejects(keoVe(goi, n0, NGAY), (e: unknown) => e instanceof LoiKeo && /a2 mang nguồn \(ownerPhone\)/.test(e.message));
  // Đối chứng dương: bản sạch thì ghi.
  const sach = await keoVe(async () => ({ status: 200, body: [c[0]!.view] }), n0, NGAY);
  assert.deepEqual(sach.listings!.map((l) => l.id), ["a1"]);
});
