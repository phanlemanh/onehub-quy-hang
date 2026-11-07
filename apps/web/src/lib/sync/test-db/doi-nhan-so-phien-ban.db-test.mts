// Đổi nhãn tại chỗ qua bộ đồng bộ tới API thật (hàng doi-nhan-so-phien-ban, E6): hai người cùng đổi nhãn thì lệnh sau vào
// «Cần xem» lý do «đụng nhau» (không phải «đã cọc» / «đã bán»); lệnh đổi nhãn xếp hàng không kéo căn đã về Đang bán. Cần
// DATABASE_URL tới Postgres dãy.
import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import { taoBoDongBo } from "../dong-bo";
import { taoKhoBoNho } from "../kho";
import { demSuKien, goiCua, H, nguoi, sanMoi, taoCan, type Nguoi } from "./ha-tang.mjs";

after(H.cleanup);

let A: { companyId: string };
let X: Nguoi;
let Y: Nguoi;
let Z: Nguoi;
const ma: Record<string, string> = {};

before(async () => {
  A = await sanMoi("dnp");
  X = await nguoi("dnp-x", [{ companyId: A.companyId, vai: ["listing_agent"] }]);
  // Quản trị kiêm Đầu khách: đặt bộ nhãn của sàn và có Bảng hàng (bang-quyen-theo-vai).
  Y = await nguoi("dnp-y", [{ companyId: A.companyId, vai: ["company_admin", "buyer_agent"] }]);
  // Trưởng nhóm: đưa căn về Đang bán khi khách bỏ cọc.
  Z = await nguoi("dnp-z", [{ companyId: A.companyId, vai: ["team_lead"] }]);
  const NHAN = [
    { label: "Giữ chỗ", anchor: "Pending" },
    { label: "Chờ ký", anchor: "Pending" },
    { label: "Đã sang tên", anchor: "Closed" },
    { label: "Chờ sang tên", anchor: "Closed" },
  ];
  const r = await Y.goi("PUT", "/api/v1/company/statuses", { labels: NHAN }, A.companyId);
  assert.equal(r.status, 200, JSON.stringify(r.body));
  for (const d of r.body.statuses as { labels: { code: string; label: string }[] }[]) for (const l of d.labels) ma[l.label] = l.code;
});

function boCua(n: Nguoi) {
  const c = goiCua(n, () => A.companyId);
  const bd = taoBoDongBo({ goi: c.goi, kho: taoKhoBoNho(n.userId, new Map()), me: { userId: n.userId, roles: [] }, companyId: A.companyId, nhip: false });
  return { bd, c, tren: (id: string) => bd.danhSach().find((l) => l.id === id)! };
}
const doc = async (id: string) => (await X.goi("GET", `/api/v1/listings/${id}`, undefined, A.companyId)).body as { standardStatus: string; statusLabel: string | null; version: number };
async function lenh(n: Nguoi, id: string, payload: object) {
  const r = await n.goi("POST", `/api/v1/listings/${id}/events`, { type: "status_changed", payload, expectedVersion: (await doc(id)).version }, A.companyId);
  assert.equal(r.status, 200, JSON.stringify(r.body));
}

/** Hai bộ cùng kéo căn ở `trangThai`, cùng đổi nhãn; trả danh sách lỗi theo AC-6. */
async function kiemDungNhau(id: string, trangThai: string, nhan1: string, nhan2: string): Promise<string[]> {
  const loi: string[] = [];
  const b1 = boCua(X);
  const b2 = boCua(Y);
  await b1.bd.khoiDong();
  await b2.bd.khoiDong();
  await b1.bd.sua(id, "status_changed", { to: trangThai, label: nhan1 });
  await b1.bd.thuNgay();
  await b2.bd.sua(id, "status_changed", { to: trangThai, label: nhan2 });
  await b2.bd.thuNgay();
  const xem = b2.bd.canXem().map((r) => [r.listingId, r.kind]);
  if (JSON.stringify(xem) !== JSON.stringify([[id, "dung-nhau"]])) loi.push(`${trangThai}: Cần xem ${JSON.stringify(xem.map((x) => x[1]))}, chờ «dung-nhau»`);
  if (b2.bd.ngan().queue.length !== 0) loi.push(`${trangThai}: hàng đợi còn ${b2.bd.ngan().queue.length}`);
  const g = await doc(id);
  const t = b2.tren(id);
  if (JSON.stringify([t.standardStatus, t.statusLabel]) !== JSON.stringify([g.standardStatus, g.statusLabel])) loi.push(`${trangThai}: máy khác máy chủ`);
  if (JSON.stringify([g.standardStatus, g.statusLabel]) !== JSON.stringify([trangThai, nhan1])) loi.push(`${trangThai}: máy chủ ${g.standardStatus}/${g.statusLabel}, chờ ${trangThai}/${nhan1}`);
  return loi;
}

test("AC-6 đồng bộ: đổi nhãn đụng nhau vào Cần xem lý do đụng nhau", async () => {
  const giaoDich = await taoCan(X, true, A.companyId);
  await lenh(X, giaoDich, { to: "Pending" });
  const daBan = await taoCan(X, true, A.companyId);
  await lenh(X, daBan, { to: "Closed", closePrice: 3_400_000_000, closeDate: "2026-11-06" });
  let so = 0;
  for (const [id, tt, n1, n2] of [
    [giaoDich, "Pending", ma["Giữ chỗ"]!, ma["Chờ ký"]!],
    [daBan, "Closed", ma["Đã sang tên"]!, ma["Chờ sang tên"]!],
  ] as const) {
    assert.deepEqual(await kiemDungNhau(id, tt, n1, n2), []);
    so++;
  }
  assert.equal(so, 2);

  // Đối chứng: người khác đưa căn từ Đang bán vào Đang giao dịch trong lúc máy đổi giá từ bản cũ → «đã cọc» như cũ.
  const id = await taoCan(X, true, A.companyId);
  const b = boCua(X);
  await b.bd.khoiDong();
  await lenh(Y, id, { to: "Pending" });
  await b.bd.sua(id, "price_changed", { listPrice: 3_900_000_000, feeInclusion: "included" });
  await b.bd.thuNgay();
  assert.deepEqual(b.bd.canXem().map((r) => [r.listingId, r.kind]), [[id, "da-coc"]]);
});

test("AC-6 đồng bộ: lệnh đổi nhãn xếp hàng không kéo căn về", async () => {
  const id = await taoCan(X, true, A.companyId);
  await lenh(X, id, { to: "Pending" });
  const b = boCua(X);
  await b.bd.khoiDong();
  // Máy mất mạng: lệnh đổi nhãn nằm trong hàng đợi, soạn trên bản Đang giao dịch.
  b.c.matMang(true);
  await b.bd.sua(id, "status_changed", { to: "Pending", label: ma["Giữ chỗ"]! });
  assert.equal(b.bd.ngan().queue.length, 1, "lệnh phải nằm trong hàng đợi");
  await lenh(Z, id, { to: "Active" });
  b.c.matMang(false);
  const n0 = await demSuKien(id);
  await b.bd.thuNgay();
  const g = await doc(id);
  assert.deepEqual([g.standardStatus, g.statusLabel], ["Active", null], "căn bị kéo về Đang giao dịch");
  assert.equal(await demSuKien(id), n0, "máy chủ không được ghi");
  assert.equal(b.bd.canXem().filter((r) => r.listingId === id).length, 1, `Cần xem: ${JSON.stringify(b.bd.canXem())}`);
  assert.equal(b.bd.ngan().queue.length, 0);
});
