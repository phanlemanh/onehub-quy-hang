// Kho trên máy và đăng xuất (hàng 13: AC-10).
import assert from "node:assert/strict";
import { test } from "node:test";
import { taoKhoBoNho } from "./kho";
import { canHoiKhiDangXuat } from "./trang-thai";
import { nganTrong, type Ngan, type PendingOp } from "./types";

const op = (i: number): PendingOp => ({ opId: `o${i}`, listingId: "h", type: "price_changed", payload: { listPrice: i, feeInclusion: "excluded" }, expectedVersion: i, clientSeq: i, createdAt: "2026-10-31T00:00:00.000Z" });
const day = (soCho: number): Ngan => ({
  ...nganTrong(),
  listings: [],
  history: { h: [] },
  queue: Array.from({ length: soCho }, (_, i) => op(i + 1)),
  lastPullAt: "2026-10-31T00:00:00.000Z",
  lastAttempt: "ok",
});

test("đăng xuất: hỏi đúng n, xoá sạch kho của người đó", async () => {
  const may = new Map<string, unknown>();
  const [A, B, C] = ["u-a", "u-b", "u-c"].map((u) => taoKhoBoNho(u, may));
  await A!.write("san-1", day(3));
  await A!.write("san-2", day(0));
  await B!.write("san-1", day(0));
  await C!.write("san-1", day(2));
  const cTruoc = await C!.read("san-1");

  assert.deepEqual(canHoiKhiDangXuat([await A!.read("san-1"), await A!.read("san-2")]), { hoi: true, n: 3 });
  assert.deepEqual(canHoiKhiDangXuat([await B!.read("san-1")]), { hoi: false, n: 0 });

  await A!.wipe(); // sau khi người chọn «Vẫn đăng xuất»
  for (const s of ["san-1", "san-2"]) assert.deepEqual(await A!.read(s), nganTrong(), `A ${s}`);
  await B!.wipe(); // 0 chờ: không hỏi nhưng vẫn xoá
  assert.deepEqual(await B!.read("san-1"), nganTrong(), "B");
  assert.deepEqual(await C!.read("san-1"), cTruoc, "C không bị đụng");
  // Đối chứng dương: kho của C thật có dữ liệu.
  assert.equal(cTruoc.queue.length, 2);
});

test("kho: mỗi sàn một ngăn", async () => {
  const k = taoKhoBoNho("u-x", new Map());
  await k.write("san-1", day(1));
  assert.equal((await k.read("san-1")).queue.length, 1);
  assert.deepEqual(await k.read("san-2"), nganTrong());
});
