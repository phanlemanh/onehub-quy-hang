// Đồng bộ tự lành trên API thật (hàng 61: AC-7, AC-3, AC-9): hết phiên thật (401), ghi rồi 503, «Giữ của tôi» sau khi sửa
// tiếp căn đang Cần xem. Cần DATABASE_URL tới Postgres dãy.
import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import { taoBoDongBo } from "../dong-bo";
import { taoKhoBoNho } from "../kho";
import { demSuKien, goiCua, H, nguoi, sanMoi, suKienMoi, taoCan, type Nguoi } from "./ha-tang.mjs";

after(H.cleanup);

let A: { companyId: string };
let X: Nguoi, T: Nguoi;

before(async () => {
  A = await sanMoi("tu-lanh");
  X = await nguoi("tl-x", [{ companyId: A.companyId, vai: ["listing_agent"] }]);
  T = await nguoi("tl-t", [{ companyId: A.companyId, vai: ["team_lead"] }]);
});

function boCua(n: Nguoi) {
  const c = goiCua(n, () => A.companyId);
  const bd = taoBoDongBo({ goi: c.goi, kho: taoKhoBoNho(n.userId, new Map()), me: { userId: n.userId, roles: [] }, companyId: A.companyId, nhip: false });
  return { ...c, bd };
}
const gia = (trieu: number) => ({ listPrice: trieu * 1_000_000, feeInclusion: "excluded" });

test("hết phiên trên API thật: hàng đợi ở lại, đăng nhập lại thì lên đúng thứ tự", async () => {
  const [hh, kk] = [await taoCan(X, true), await taoCan(X, true)];
  const bo = boCua(X);
  await bo.bd.khoiDong();
  const [h0, k0] = [await demSuKien(hh), await demSuKien(kk)];
  bo.boPhien(true);
  await bo.bd.sua(hh, "price_changed", gia(3610));
  await bo.bd.sua(kk, "price_changed", gia(3710));
  await bo.bd.sua(hh, "price_changed", gia(3620));
  await bo.bd.thuNgay();
  assert.equal(await demSuKien(hh), h0, "401 thật: H không được lên");
  assert.equal(await demSuKien(kk), k0);
  assert.equal(bo.bd.ngan().queue.length, 3);
  assert.deepEqual(bo.bd.canXem(), [], "401 thật thành Cần xem");
  assert.equal(bo.bd.chiBao().nhan, "Hết phiên · đăng nhập lại để gửi 3 thay đổi");
  bo.boPhien(false);
  await bo.bd.thuNgay();
  assert.equal(await demSuKien(hh), h0 + 2);
  assert.equal(await demSuKien(kk), k0 + 1);
  assert.deepEqual((await suKienMoi(hh, h0)).map((e) => e.payload.listPrice), [3_610_000_000, 3_620_000_000]);
  assert.deepEqual((await suKienMoi(kk, k0)).map((e) => e.payload.listPrice), [3_710_000_000]);
  assert.deepEqual(bo.bd.canXem(), []);
  assert.equal(bo.bd.ngan().queue.length, 0);
});

test("ghi rồi trả 503 trên API thật: một sự kiện", async () => {
  const hh = await taoCan(X, true);
  const bo = boCua(X);
  await bo.bd.khoiDong();
  const h0 = await demSuKien(hh);
  bo.ghiRoi503LanToi();
  await bo.bd.sua(hh, "price_changed", gia(3630));
  await bo.bd.thuNgay();
  assert.equal(await demSuKien(hh), h0 + 1, "API thật phải đã ghi");
  assert.equal(bo.bd.ngan().queue.length, 1, "503: thao tác ở lại chờ gửi lại");
  await bo.bd.thuNgay();
  assert.equal(await demSuKien(hh), h0 + 1, "gửi lại sau 503 thành sự kiện thứ hai");
  assert.equal(bo.bd.ngan().queue.length, 0);
  assert.deepEqual(bo.bd.canXem(), []);
});

test("Giữ của tôi trên API thật: cũ rồi mới, giá cuối lần sau cùng", async () => {
  const hh = await taoCan(X, true);
  const bo = boCua(X);
  await bo.bd.khoiDong();
  bo.matMang(true);
  await bo.bd.sua(hh, "price_changed", gia(2000));
  await bo.bd.thuNgay();
  const v = (await T.goi("GET", `/api/v1/listings/${hh}`)).body.version;
  assert.equal((await T.goi("POST", `/api/v1/listings/${hh}/events`, { type: "price_changed", payload: gia(9000), expectedVersion: v })).status, 200);
  bo.matMang(false);
  await bo.bd.thuNgay();
  assert.deepEqual(bo.bd.canXem().map((r) => r.kind), ["dung-nhau"]);
  const truoc = await demSuKien(hh);
  const kq = await bo.bd.sua(hh, "price_changed", gia(3000));
  assert.equal(kq.ok, true);
  await bo.bd.thuNgay();
  assert.equal(await demSuKien(hh), truoc, "thao tác 3 tỷ lên trước khi chọn lối");
  await bo.bd.giuCuaToi(hh);
  await bo.bd.thuNgay();
  assert.equal(await demSuKien(hh), truoc + 2);
  assert.deepEqual((await suKienMoi(hh, truoc)).map((e) => e.payload.listPrice), [2_000_000_000, 3_000_000_000], "giá cuối 2 tỷ — thứ tự đảo");
  assert.deepEqual(bo.bd.canXem(), []);
  assert.equal(bo.bd.ngan().queue.length, 0);
});
