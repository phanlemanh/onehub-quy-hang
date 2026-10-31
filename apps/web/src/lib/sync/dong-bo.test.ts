// Bộ đồng bộ trên máy chủ giả (hàng 13): bốn chỗ dễ vấp của kế hoạch và nhịp thử (AC-9).
import assert from "node:assert/strict";
import { test } from "node:test";
import { taoBoDongBo } from "./dong-bo";
import { taoKhoBoNho } from "./kho";
import { nganTrong } from "./types";
import { dongHoGia, mayChuGia, xa } from "./may-chu-gia.test-helpers";

const ME = { userId: "u-x", roles: ["listing_agent"] };
let ma = 0;
const taoMa = () => `op-${++ma}`;

test("từ chối 404: căn vào cần xem, Bỏ thay đổi trả về thường", async () => {
  const mc = mayChuGia({ userId: ME.userId });
  mc.tao("h", "[Toà A]");
  mc.tao("k", "[Toà A]");
  const bd = taoBoDongBo({ goi: mc.goi, kho: taoKhoBoNho("u-x", new Map()), me: ME, companyId: "s", nhip: false, taoMa });
  await bd.khoiDong();
  mc.datMatMang(true);
  await bd.sua("h", "details_changed", { furnished: "full" });
  await bd.sua("k", "details_changed", { furnished: "basic" });
  await bd.thuNgay();
  // Trong lúc mất mạng, H thành «Chỉ tôi» của người khác với người này (404).
  mc.an("h");
  mc.datMatMang(false);
  const kTruoc = mc.can.get("k")!.length;
  await bd.thuNgay();
  assert.equal(mc.can.get("k")!.length, kTruoc + 1, "K phải lên dù H kẹt");
  assert.deepEqual(bd.canXem().map((r) => [r.listingId, r.kind, r.reason]), [["h", "tu-choi", "căn không còn đọc được"]]);
  assert.equal(bd.chiBao().nhan, "1 căn cần xem");
  assert.equal(bd.ngan().queue.length, 0);
  assert.equal(bd.canXem()[0]!.mine.length, 1, "thao tác của H nằm trong cần xem, không mất");
  await bd.boThayDoi("h");
  assert.deepEqual(bd.canXem(), []);
  assert.notEqual(bd.chiBao().loai, "xem");
});

test("hai tab chung một kho gửi cùng thao tác: một sự kiện, không cần xem", async () => {
  const mc = mayChuGia({ userId: ME.userId });
  mc.tao("h", "[Toà A]");
  const kho = taoKhoBoNho("u-x", new Map());
  const t1 = taoBoDongBo({ goi: mc.goi, kho, me: ME, companyId: "s", nhip: false, taoMa });
  const t2 = taoBoDongBo({ goi: mc.goi, kho, me: ME, companyId: "s", nhip: false, taoMa });
  await t1.khoiDong();
  mc.datMatMang(true);
  await t1.sua("h", "details_changed", { furnished: "full" });
  await t1.thuNgay();
  mc.datMatMang(false);
  // Hai tab cùng đọc hàng đợi rồi cùng gửi.
  await Promise.all([t1.thuNgay(), t2.thuNgay()]);
  assert.equal(mc.can.get("h")!.length, 2, "phải đúng một sự kiện mới");
  assert.deepEqual([...t1.canXem(), ...t2.canXem()], []);
  assert.equal((await kho.read("s")).queue.length, 0);
});

test("đổi sàn giữa lô gửi: kết quả ghi đúng ngăn sàn cũ", async () => {
  const mc = mayChuGia({ userId: ME.userId });
  mc.tao("h", "[Toà A]");
  const kho = taoKhoBoNho("u-x", new Map());
  const bd = taoBoDongBo({ goi: mc.goi, kho, me: ME, companyId: "san-a", nhip: false, taoMa });
  await bd.khoiDong();
  mc.datMatMang(true);
  await bd.sua("h", "details_changed", { furnished: "full" });
  await bd.thuNgay();
  mc.datMatMang(false);
  const lo = bd.thuNgay();
  await bd.doiSan("san-b");
  await lo;
  await xa();
  assert.equal((await kho.read("san-a")).queue.length, 0, "ngăn sàn A phải khép lô");
  assert.equal((await kho.read("san-b")).queue.length, 0);
  assert.equal((await kho.read("san-b")).review.length, 0);
  assert.equal(mc.can.get("h")!.length, 2);
});

test("biết có mạng lại không cần sự kiện trình duyệt", async () => {
  const mc = mayChuGia({ userId: ME.userId });
  mc.tao("h", "[Toà A]");
  const dh = dongHoGia();
  const bd = taoBoDongBo({ goi: mc.goi, kho: taoKhoBoNho("u-x", new Map()), me: ME, companyId: "s", dongHo: dh, taoMa });
  await bd.khoiDong();
  mc.datMatMang(true);
  await bd.sua("h", "details_changed", { furnished: "full" });
  await xa();
  const thu = () => mc.goiQua.length;
  const t0 = thu();
  await dh.tien(14_000);
  assert.equal(thu() - t0, 0, "14 giây: chưa thử");
  await dh.tien(1_000);
  assert.equal(thu() - t0, 1, "15 giây: đúng một lần thử");
  mc.datMatMang(false);
  await dh.tien(15_000);
  assert.equal(bd.ngan().queue.length, 0, "có mạng: thao tác lên");
  assert.equal(mc.can.get("h")!.length, 2);
  const t1 = thu();
  bd.quayLaiTrang();
  await xa();
  assert.ok(thu() - t1 >= 1, "quay lại trang: thử ngay");
  // Yên: 30 giây một lần kéo.
  const t2 = thu();
  await dh.tien(29_000);
  assert.equal(thu() - t2, 0, "yên 29 giây: chưa kéo");
  await dh.tien(1_000);
  assert.equal(thu() - t2, 1, "yên 30 giây: một lần kéo");
  bd.dung();
});

test("đăng xuất giữa lượt đang gửi: kho đã xoá không bị ghi lại", async () => {
  const mc = mayChuGia({ userId: ME.userId });
  mc.tao("h", "[Toà A]");
  let tha!: () => void;
  const cho = new Promise<void>((r) => (tha = r));
  let giu = false;
  const goi: typeof mc.goi = async (...a) => {
    if (giu) await cho;
    return mc.goi(...a);
  };
  const kho = taoKhoBoNho("u-x", new Map());
  const bd = taoBoDongBo({ goi, kho, me: ME, companyId: "s", nhip: false, taoMa });
  await bd.khoiDong();
  await bd.sua("h", "details_changed", { furnished: "full" });
  await xa();
  await bd.sua("h", "details_changed", { furnished: "basic" });
  giu = true;
  const lo = bd.thuNgay(); // lượt đang bay, treo ở lời gọi
  const dx = (async () => {
    await bd.dongHan();
    await kho.wipe();
  })();
  await xa();
  tha();
  await dx;
  await lo;
  await xa();
  assert.deepEqual(await kho.read("s"), nganTrong(), "kho bị dựng lại sau khi xoá");
});

test("sau khi gửi, lịch sử căn đã mở trên máy theo kịp máy chủ", async () => {
  const mc = mayChuGia({ userId: ME.userId });
  mc.tao("h", "[Toà A]");
  const bd = taoBoDongBo({ goi: mc.goi, kho: taoKhoBoNho("u-x", new Map()), me: ME, companyId: "s", nhip: false, taoMa });
  await bd.khoiDong();
  await bd.taiLichSu("h");
  assert.equal(bd.hoSo("h")!.lichSu.length, 1);
  mc.datMatMang(true);
  for (const f of ["a", "b", "c", "d"]) await bd.sua("h", "details_changed", { furnished: f });
  await bd.thuNgay();
  mc.datMatMang(false);
  await bd.thuNgay();
  assert.equal(mc.can.get("h")!.length, 5);
  assert.equal(bd.hoSo("h")!.lichSu.length, 5, "lịch sử trên máy còn cũ sau khi gửi");
});
