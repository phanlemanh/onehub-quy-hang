// Chỉ báo đồng bộ (hàng 13: AC-8) — bảng viết tay, không sinh từ hàm đang kiểm.
import assert from "node:assert/strict";
import { test } from "node:test";
import { suyChiBao } from "./trang-thai";
import { nganTrong, type NeedsReview, type Ngan, type PendingOp } from "./types";

const luc1042 = new Date(2026, 9, 31, 10, 42).toISOString();
const op = (i: number): PendingOp => ({ opId: `o${i}`, listingId: "h", type: "price_changed", payload: {}, expectedVersion: i, clientSeq: i, createdAt: luc1042 });
const xem = (id: string): NeedsReview => ({ listingId: id, kind: "dung-nhau", mine: [] });
const ngan = (p: Partial<Ngan>): Ngan => ({ ...nganTrong(), ...p });

test("chỉ báo: bảng trạng thái → chữ", () => {
  const BANG: [string, Ngan, number, string][] = [
    ["chưa có bản kéo", ngan({}), 0, "Đang tải lần đầu"],
    ["0 chờ, kéo cuối thành công 10:42", ngan({ listings: [], lastPullAt: luc1042, lastAttempt: "ok" }), 0, "Đã đồng bộ · 10:42"],
    ["đang gửi 3", ngan({ listings: [], lastPullAt: luc1042, lastAttempt: "ok", queue: [op(1), op(2), op(3)] }), 3, "Đang gửi 3 thay đổi"],
    ["lỗi mạng, 5 chờ", ngan({ listings: [], lastPullAt: luc1042, lastAttempt: "mang", queue: [1, 2, 3, 4, 5].map(op) }), 0, "Mất mạng · 5 thay đổi chờ gửi"],
    ["lỗi mạng, 0 chờ", ngan({ listings: [], lastPullAt: luc1042, lastAttempt: "mang" }), 0, "Mất mạng · đang xem bản trên máy"],
    ["2 căn cần xem cộng lỗi mạng", ngan({ listings: [], lastAttempt: "mang", queue: [op(1)], review: [xem("a"), xem("b")] }), 0, "2 căn cần xem"],
  ];
  let so = 0;
  for (const [ten, n, gui, mong] of BANG) {
    assert.equal(suyChiBao(n, gui).nhan, mong, ten);
    so++;
  }
  assert.equal(so, BANG.length);
});

test("chỉ báo: sàn chưa có căn nào vẫn là đã đồng bộ", () => {
  assert.equal(suyChiBao(ngan({ listings: [], lastPullAt: luc1042, lastAttempt: "ok" }), 0).nhan, "Đã đồng bộ · 10:42");
});
