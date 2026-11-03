// Máy bị báo mất (hàng 38: E7b, E8). Một «máy» chung cho hai người: X (bị báo) và Z (người khác cùng máy), mỗi người một
// kho có bản kéo, lịch sử và một thay đổi chờ. Cặp hai ca cùng một kho dựng, khác đúng mã lỗi của 401.
import assert from "node:assert/strict";
import { test } from "node:test";
import { taoBoDongBo } from "./dong-bo";
import { taoKhoBoNho } from "./kho";
import { bocGoiBiBao, dichBiBao, maNguoiBiBao, xoaMayBiBao, type XoaMayDeps } from "./may-bi-bao";
import { mayChuGia } from "./may-chu-gia.test-helpers";

const ME = { userId: "u-x", roles: ["listing_agent"] };
let ma = 0;
const taoMa = () => `bb-${++ma}`;

/** Dựng máy chung: kho X có bản kéo, lịch sử và một thay đổi chờ; kho Z có một ngăn đầy đủ tương tự. */
async function dungMay(ma401: unknown, xoaKhoKhac?: (may: Map<string, unknown>, u: string) => Promise<void>) {
  const may = new Map<string, unknown>();
  const mc = mayChuGia({ userId: ME.userId });
  mc.tao("h", "[Toà A]");
  const daXoa: string[] = [];
  const daHuy: string[] = [];
  const deps: XoaMayDeps = {
    xoaKho: async (u) => {
      daXoa.push(u);
      await (xoaKhoKhac ? xoaKhoKhac(may, u) : taoKhoBoNho(u, may).wipe());
    },
    huyDay: async () => void daHuy.push("huy"),
  };
  let dich: string | null = null;
  let xong: Promise<void> = Promise.resolve();
  const bd = taoBoDongBo({
    goi: bocGoiBiBao(mc.goi, (u) =>
      (xong = (async () => {
        await bd.dongHan();
        await xoaMayBiBao(u, deps);
        dich = dichBiBao(u);
      })()),
    ),
    kho: taoKhoBoNho("u-x", may),
    me: ME,
    companyId: "s",
    nhip: false,
    taoMa,
  });
  await bd.khoiDong();
  mc.datMatMang(true);
  await bd.sua("h", "price_changed", { listPrice: 3_000_000_000, feeInclusion: "excluded" });
  await bd.thuNgay();
  mc.datMatMang(false);
  const khoZ = taoKhoBoNho("u-z", may);
  await khoZ.write("s", { ...(await taoKhoBoNho("u-x", may).read("s")) });
  mc.datMa("* *", 401, ma401);
  mc.datMa("* ds", 401, ma401);
  return { may, mc, bd, daXoa, daHuy, khoZ, dich: () => dich, xong: () => xong };
}

const khoaCua = (may: Map<string, unknown>, u: string) => [...may.keys()].filter((k) => k.startsWith(`${u}|`));

/** Thước của E7b — trả lỗi nêu vế hỏng; đường thật → []. */
async function kiemE7b(xoaKhoKhac?: (may: Map<string, unknown>, u: string) => Promise<void>): Promise<string[]> {
  const m = await dungMay({ error: "device_reported_lost", userId: "u-x" }, xoaKhoKhac);
  const zTruoc = await m.khoZ.read("s");
  assert.equal(zTruoc.queue.length, 1, "kho Z dựng sai");
  await m.bd.thuNgay();
  await m.xong();
  const loi: string[] = [];
  if (khoaCua(m.may, "u-x").length > 0) loi.push("kho X còn");
  if (JSON.stringify(await m.khoZ.read("s")) !== JSON.stringify(zTruoc)) loi.push("kho người khác bị xoá");
  if (m.daHuy.length !== 1) loi.push("đăng ký đẩy chưa huỷ");
  if (m.dich() !== "/login?bi-bao-mat=1&u=u-x") loi.push("không về màn báo");
  return loi;
}

test("E7b 401 mang device_reported_lost: xoá kho của X (cả thay đổi chờ), giữ kho của Z, huỷ đăng ký đẩy, về màn báo", async () => {
  assert.deepEqual(await kiemE7b(), []);
});

test("E8 401 không mã: hàng đợi ở lại, chỉ báo «Hết phiên», không kho nào bị xoá — cùng máy dựng như ca trên", async () => {
  const m = await dungMay({ error: "unauthenticated" });
  await m.bd.thuNgay();
  await m.xong();
  assert.deepEqual(m.daXoa, []);
  assert.equal(m.bd.ngan().queue.length, 1);
  assert.equal(m.bd.chiBao().nhan, "Hết phiên · đăng nhập lại để gửi 1 thay đổi");
  assert.equal(khoaCua(m.may, "u-x").length > 0, true);
  assert.equal(m.dich(), null);
});

test("E7b chiều đỏ: bản xoá mọi kho mất kho Z; bản không xoá gì để lại kho X", async () => {
  assert.deepEqual(await kiemE7b(async (may) => may.clear()), ["kho người khác bị xoá"]);
  assert.deepEqual(await kiemE7b(async () => {}), ["kho X còn"]);
});

test("mã người bị báo: chỉ 401 mang đúng mã và mã người", () => {
  assert.equal(maNguoiBiBao({ status: 401, body: { error: "device_reported_lost", userId: "u-x" } }), "u-x");
  assert.equal(maNguoiBiBao({ status: 401, body: { error: "unauthenticated" } }), null);
  assert.equal(maNguoiBiBao({ status: 403, body: { error: "device_reported_lost", userId: "u-x" } }), null);
  assert.equal(maNguoiBiBao({ status: 401, body: { error: "device_reported_lost" } }), null);
  assert.equal(maNguoiBiBao({ status: 401, body: null }), null);
});
