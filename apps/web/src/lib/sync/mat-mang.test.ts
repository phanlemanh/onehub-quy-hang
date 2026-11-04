// Dấu mất mạng trên thao tác (AC-6) và lượt mất mạng (AC-7) trên máy chủ giả, đồng hồ giả, kho bộ nhớ. Luật gửi, kéo, tự
// lành của hàng 13/61 không đổi — các bài của dong-bo.test.ts và tu-lanh.test.ts giữ nguyên.
import assert from "node:assert/strict";
import { test } from "node:test";
import { taoBoDongBo } from "./dong-bo";
import { taoKhoBoNho, type LocalStore } from "./kho";
import { dongHoGia, mayChuGia } from "./may-chu-gia.test-helpers";

const ME = { userId: "u-x", roles: ["listing_agent"] };
let ma = 0;
const taoMa = () => `mm-${++ma}`;

function dung(o: { kho?: LocalStore; dh?: ReturnType<typeof dongHoGia>; mc?: ReturnType<typeof mayChuGia> } = {}) {
  const mc = o.mc ?? mayChuGia({ userId: ME.userId });
  const dh = o.dh ?? dongHoGia();
  const kho = o.kho ?? taoKhoBoNho("u-x", new Map());
  const bd = taoBoDongBo({ goi: mc.goi, kho, me: ME, companyId: "s", nhip: false, dongHo: dh, taoMa, thietBi: () => "mobile" });
  return { mc, dh, kho, bd };
}
/** Thân các lệnh sự kiện máy chủ nhận cho căn `id`. */
const lenhCua = (mc: ReturnType<typeof mayChuGia>, id: string) => mc.lenhNhan.filter((l) => l.listingId === id).map((l) => l.body);
const gio = (dh: ReturnType<typeof dongHoGia>) => new Date(dh.now()).toISOString();

test("mất mạng: thao tác ghi lúc mất mạng mang madeOffline", async () => {
  const { mc, bd } = dung();
  mc.tao("x", "[Toà A]");
  mc.tao("y", "[Toà A]");
  await bd.khoiDong();
  mc.datMatMang(true);
  await bd.thuNgay(); // lượt thử mất mạng
  assert.equal(bd.ngan().lastAttempt, "mang");
  await bd.sua("x", "details_changed", { furnished: "full" });
  await bd.thuNgay();
  mc.datMatMang(false);
  await bd.thuNgay();
  assert.equal(bd.ngan().queue.length, 0);
  assert.deepEqual(lenhCua(mc, "x").map((b) => b.madeOffline), [true], "lệnh của X phải mang madeOffline true");
  // Có mạng: sửa Y và gửi được → lệnh không có khoá madeOffline (vắng khoá, không chỉ false).
  await bd.sua("y", "details_changed", { furnished: "basic" });
  await bd.thuNgay();
  const y = lenhCua(mc, "y");
  assert.equal(y.length, 1);
  assert.equal(Object.hasOwn(y[0]!, "madeOffline"), false, "lệnh của Y không được có khoá madeOffline");
  assert.equal(mc.can.get("y")!.length, 2);
});

test("mất mạng: máy vừa rớt mạng", async () => {
  const { mc, bd } = dung();
  mc.tao("z", "[Toà A]");
  await bd.khoiDong();
  assert.equal(bd.ngan().lastAttempt, "ok", "không dựng sẵn lượt thử lỗi");
  mc.datMatMang(true); // máy vừa rớt mạng: lần thử gần nhất vẫn ok
  await bd.sua("z", "details_changed", { furnished: "full" });
  await bd.thuNgay(); // lượt gửi kế ném lỗi mạng
  assert.equal(bd.ngan().lastAttempt, "mang");
  mc.datMatMang(false);
  await bd.thuNgay();
  assert.equal(bd.ngan().queue.length, 0);
  const z = lenhCua(mc, "z");
  assert.equal(z.length, 1);
  assert.equal(z[0]!.madeOffline, true, `lệnh của Z thiếu khoá madeOffline: ${JSON.stringify(z[0])}`);
});

test("lượt mất mạng: mở một lần, khép khi có mạng, gửi một lần", async () => {
  const { mc, dh, bd } = dung();
  mc.tao("h", "[Toà A]");
  await bd.khoiDong();
  // 1 thao tác chờ có từ trước lượt: máy chủ trục trặc giữ nó trong hàng đợi.
  mc.datMa("POST h", 503);
  await bd.sua("h", "details_changed", { furnished: "full" });
  await bd.thuNgay();
  assert.equal(bd.ngan().queue.length, 1);
  assert.equal(bd.ngan().offlineSince ?? null, null);
  mc.datMa("POST h", null);
  await dh.tien(15_000);
  const t1 = gio(dh);
  mc.datMatMang(true);
  await bd.thuNgay(); // lượt thử mất mạng đầu: mở lượt
  await bd.sua("h", "details_changed", { furnished: "basic" });
  await bd.sua("h", "details_changed", { furnished: "none" });
  await bd.thuNgay();
  await dh.tien(15_000);
  const t2 = gio(dh);
  await bd.thuNgay(); // vẫn mất mạng: lượt vẫn mở
  assert.equal(bd.ngan().offlineSince?.at, t1, `lượt phải mở ở t1, không ở t2 (${t2})`);
  await dh.tien(15_000);
  const t3 = gio(dh);
  mc.datMatMang(false);
  await bd.thuNgay(); // có mạng: khép và gửi
  assert.equal(bd.ngan().queue.length, 0);
  assert.equal(mc.luotMatMang.length, 1, "máy chủ phải nhận đúng một lượt");
  const l = mc.luotMatMang[0]!;
  assert.equal(l.startedAt, t1, `startedAt phải là t1, nhận ${String(l.startedAt)} (t2 = ${t2})`);
  assert.equal(l.endedAt, t3);
  assert.equal(l.queuedOps, 2, `queuedOps phải là 2 (không đếm thao tác có từ trước), nhận ${String(l.queuedOps)}`);
  assert.deepEqual(l, { startedAt: t1, endedAt: t3, device: "mobile", queuedOps: 2 });
  assert.equal(bd.ngan().offlineSince, null);
  assert.deepEqual(bd.ngan().offlineOutbox, []);
  await bd.thuNgay();
  assert.equal(mc.luotMatMang.length, 1, "lượt kế không gửi lại");
  // Lượt mất mạng không thao tác nào → queuedOps 0.
  await dh.tien(15_000);
  const t4 = gio(dh);
  mc.datMatMang(true);
  await bd.thuNgay();
  await dh.tien(15_000);
  const t5 = gio(dh);
  mc.datMatMang(false);
  await bd.thuNgay();
  assert.deepEqual(mc.luotMatMang[1], { startedAt: t4, endedAt: t5, device: "mobile", queuedOps: 0 });
  assert.equal(mc.luotMatMang.length, 2);
});

test("lượt mất mạng: gửi lỗi thì giữ, gửi lại không trùng", async () => {
  const { mc, dh, bd } = dung();
  mc.tao("h", "[Toà A]");
  await bd.khoiDong();
  const t1 = gio(dh);
  mc.datMatMang(true);
  await bd.thuNgay();
  await dh.tien(15_000);
  const t2 = gio(dh);
  mc.datMatMang(false);
  mc.luot503LanToi();
  await bd.thuNgay(); // khép lượt, gửi gặp 503
  assert.equal(mc.luotMatMang.length, 0);
  assert.deepEqual(bd.ngan().offlineOutbox, [{ startedAt: t1, endedAt: t2, device: "mobile", queuedOps: 0 }], "lượt phải ở lại hộp gửi");
  await dh.tien(15_000);
  await bd.thuNgay(); // lượt kế: gửi được
  assert.equal(mc.luotMatMang.length, 1);
  assert.deepEqual(bd.ngan().offlineOutbox, []);
  await bd.thuNgay();
  assert.equal(mc.luotMatMang.length, 1, "máy chủ có một dòng");
  // Gửi lại đúng lượt ấy (tab khác, phản hồi mất): máy chủ trả 200, không thêm dòng.
  const r = await mc.goi("POST", "/api/v1/sync/offline-sessions", mc.luotMatMang[0]);
  assert.equal(r.status, 200);
  assert.equal(mc.luotMatMang.length, 1);
});

test("lượt mất mạng: tải lại trang giữa lượt", async () => {
  const kho = taoKhoBoNho("u-x", new Map());
  const dh = dongHoGia();
  const mc = mayChuGia({ userId: ME.userId });
  mc.tao("h", "[Toà A]");
  const a = dung({ kho, dh, mc });
  await a.bd.khoiDong();
  const t1 = gio(dh);
  mc.datMatMang(true);
  await a.bd.thuNgay();
  await a.bd.sua("h", "details_changed", { furnished: "full" });
  await a.bd.thuNgay();
  a.bd.dung();
  // Tải lại trang: dựng lại bộ đồng bộ trên cùng kho, lượt đang mở.
  await dh.tien(15_000);
  const b = dung({ kho, dh, mc });
  await b.bd.khoiDong(); // vẫn mất mạng
  assert.deepEqual(b.bd.ngan().offlineSince, { at: t1, device: "mobile", ops: 1 }, "lượt mở phải còn với startedAt t1");
  await dh.tien(15_000);
  const t3 = gio(dh);
  mc.datMatMang(false);
  await b.bd.thuNgay();
  assert.deepEqual(mc.luotMatMang, [{ startedAt: t1, endedAt: t3, device: "mobile", queuedOps: 1 }]);
  assert.equal(b.bd.ngan().offlineSince, null);
  assert.deepEqual(lenhCua(mc, "h").map((x) => x.madeOffline), [true]);
});
