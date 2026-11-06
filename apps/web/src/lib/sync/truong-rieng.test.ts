// Hàng đợi ngoại tuyến: lệnh trường riêng (hàng 47, E4e) — trên máy chủ giả, đồng hồ giả, kho bộ nhớ. Đường đẩy là
// POST /api/v1/listings/{id}/events, cùng đường lệnh thật (applyCommand kiểm mã trường).
import assert from "node:assert/strict";
import { test } from "node:test";
import { taoBoDongBo } from "./dong-bo";
import { taoKhoBoNho } from "./kho";
import { dongHoGia, mayChuGia } from "./may-chu-gia.test-helpers";

const ME = { userId: "u-x", roles: ["listing_agent"] };
let ma = 0;
const taoMa = () => `tr-${++ma}`;
function dung() {
  const mc = mayChuGia({ userId: ME.userId });
  const dh = dongHoGia();
  const kho = taoKhoBoNho("u-x", new Map());
  const bd = taoBoDongBo({ goi: mc.goi, kho, me: ME, companyId: "s", nhip: false, dongHo: dh, taoMa, thietBi: () => "desktop" });
  return { mc, bd };
}
const customCua = (bd: ReturnType<typeof dung>["bd"], id: string) => bd.danhSach().find((h) => h.id === id)?.custom;

test("hàng đợi ngoại tuyến: lệnh trường riêng", async () => {
  const { mc, bd } = dung();
  mc.tao("x", "[Toà A]");
  mc.tao("y", "[Toà A]");
  await bd.khoiDong();
  mc.datMatMang(true);
  await bd.thuNgay();
  // Lúc mất mạng: bản trên máy hiện giá trị ngay.
  await bd.sua("x", "custom_changed", { can_goc: true });
  assert.deepEqual(customCua(bd, "x"), { can_goc: true }, "bản trên máy chưa hiện giá trị lúc mất mạng");
  // Có mạng lại: hàng đợi gửi đúng một lệnh qua đường lệnh thật.
  mc.datMatMang(false);
  await bd.thuNgay();
  const lenhX = mc.lenhNhan.filter((l) => l.listingId === "x").map((l) => [l.body.type, l.body.payload]);
  assert.deepEqual(lenhX, [["custom_changed", { can_goc: true }]]);
  assert.equal(bd.ngan().queue.length, 0);
  assert.deepEqual(customCua(bd, "x"), { can_goc: true });

  // Trường bị bỏ trong lúc ngoại tuyến: máy chủ trả 400 nêu mã → lệnh rời hàng đợi, bản trên máy về giá trị trước lệnh.
  mc.datMatMang(true);
  await bd.thuNgay();
  await bd.sua("y", "custom_changed", { se_bo: true });
  assert.deepEqual(customCua(bd, "y"), { se_bo: true });
  mc.datMa("POST y", 400, { error: "invalid-payload", reason: "custom.se_bo: không phải trường riêng còn sống của hàng" });
  mc.datMatMang(false);
  await bd.thuNgay();
  assert.equal(bd.ngan().queue.filter((o) => o.listingId === "y").length, 0, "lệnh bị từ chối vẫn kẹt trong hàng đợi");
  assert.deepEqual(customCua(bd, "y") ?? {}, {}, "bản trên máy giữ giá trị máy chủ đã từ chối");
});
