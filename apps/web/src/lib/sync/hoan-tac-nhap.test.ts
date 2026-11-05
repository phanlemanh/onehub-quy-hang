// Căn đã gỡ khi hoàn tác lần nhập (hàng 66 nhap-hoan-tac, AC-7, E7c): máy chủ bỏ căn khỏi `GET /listings` và trả 404 cho
// lệnh lên căn ấy — bộ đồng bộ trên máy bỏ căn khỏi kho ở lượt kéo kế, lệnh chờ sang «cần xem», không gửi lặp.
import assert from "node:assert/strict";
import { test } from "node:test";
import { taoBoDongBo } from "./dong-bo";
import { taoKhoBoNho } from "./kho";
import { mayChuGia } from "./may-chu-gia.test-helpers";

const ME = { userId: "u-nhap", roles: ["listing_agent"] };
let ma = 0;
const taoMa = () => `op-gỡ-${++ma}`;

test("đồng bộ trên máy: hàng đã gỡ ra khỏi máy", async () => {
  const mc = mayChuGia({ userId: ME.userId });
  mc.tao("h1", "[Toà A]");
  mc.tao("h2", "[Toà A]");
  const bd = taoBoDongBo({ goi: mc.goi, kho: taoKhoBoNho("u-nhap", new Map()), me: ME, companyId: "s", nhip: false, taoMa });
  await bd.khoiDong();
  assert.deepEqual(bd.ngan().listings!.map((l) => l.id).sort(), ["h1", "h2"], "trước khi gỡ: máy có hai căn");
  mc.datMatMang(true);
  await bd.sua("h1", "details_changed", { furnished: "full" });
  await bd.thuNgay();
  // Trong lúc máy mất mạng, người nhập hoàn tác lần nhập: h1 rời danh sách, lệnh lên h1 nhận 404.
  mc.an("h1");
  mc.datMatMang(false);
  await bd.thuNgay();
  assert.deepEqual(bd.ngan().listings!.map((l) => l.id), ["h2"], "máy chỉ còn h2");
  assert.equal(bd.ngan().history.h1, undefined, "lịch sử h1 bỏ khỏi máy");
  assert.equal(bd.ngan().queue.length, 0, "lệnh chờ của h1 rời hàng đợi gửi");
  assert.deepEqual(bd.canXem().map((r) => [r.listingId, r.reason]), [["h1", "căn không còn đọc được"]], "lệnh của h1 sang cần xem");
  const daGui = mc.lenhNhan.length;
  await bd.thuNgay();
  assert.equal(mc.lenhNhan.length, daGui, "vòng kế không gửi lặp lệnh h1");
  assert.equal(mc.can.get("h2")!.length, 1, "đối chứng: h2 giữ nguyên");
});
