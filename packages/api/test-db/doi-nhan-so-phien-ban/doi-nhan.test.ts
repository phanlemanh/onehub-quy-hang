// Đổi nhãn tại chỗ qua phép so phiên bản trên Postgres thật (hàng doi-nhan-so-phien-ban — E3, E4, E5). Sàn, người, căn và
// lệnh dựng qua đường ghi thật; kết nối chủ chỉ để đọc bản tính và đếm sự kiện. Số mẫu `0900 000 0xx`, tên «[Tên]».
import assert from "node:assert/strict";
import { after, test } from "node:test";
import { API_ERRORS } from "../../src/errors";
import { appPool, cleanup } from "../helpers";
import { hangCoChu, lenBang, maMoi, sanMoi, send, soMoi, type San } from "../san-thu";

after(cleanup);

const VAI = { tn: { vai: ["team_lead"] }, dc: { vai: ["listing_agent"], khu: ["Toà A"] } };
const NHAN = [
  { label: "Giữ chỗ", anchor: "Pending" },
  { label: "Chờ ký", anchor: "Pending" },
  { label: "Đã sang tên", anchor: "Closed" },
  { label: "Chờ sang tên", anchor: "Closed" },
];
const XUNG_DOT = API_ERRORS.versionConflict.code;
const CHOT = (gia: number) => ({ to: "Closed", closePrice: gia, closeDate: "2026-11-06" });

type Ban = { standard_status: string; status_label: string | null; close_price: string | null; version: number };
const banTinh = async (id: string) =>
  (await appPool.query<Ban>("select standard_status, status_label, close_price, version from listings where id = $1", [id])).rows[0]!;
const demSuKien = async (id: string) => (await appPool.query<{ n: number }>("select count(*)::int n from listing_events where listing_id = $1", [id])).rows[0]!.n;

async function sanCoNhan(): Promise<{ s: San; ma: Record<string, string> }> {
  const s = await sanMoi(VAI);
  const r = await send("PUT", "/api/v1/company/statuses", { labels: NHAN }, s.nguoi.qt!.cookie);
  assert.equal(r.status, 200, await r.clone().text());
  const b = (await r.json()) as { statuses: { status: string; labels: { code: string; label: string }[] }[] };
  const ma = Object.fromEntries(b.statuses.flatMap((d) => d.labels.map((l) => [l.label, l.code])));
  return { s, ma };
}
/** Lệnh hàng với phiên bản khai tường minh (`undefined` = không khai). */
const gui = (s: San, k: string, id: string, type: string, payload: object, v: number | undefined) =>
  send("POST", `/api/v1/listings/${id}/events`, { type, payload, ...(v !== undefined && { expectedVersion: v }) }, s.nguoi[k]!.cookie);
async function duoc(s: San, k: string, id: string, type: string, payload: object) {
  const r = await gui(s, k, id, type, payload, (await banTinh(id)).version);
  assert.equal(r.status, 200, await r.clone().text());
}
/** Căn Đang bán của đầu chủ. */
async function canDangBan(s: San) {
  const id = await hangCoChu(s, "dc", maMoi(s), soMoi(s));
  await lenBang(s, "dc", id);
  return id;
}
const loiCua = async (r: Response) => ((await r.json()) as { error?: string }).error;

/** AC-3: hai người cùng đổi nhãn từ một phiên bản — trả danh sách lỗi. */
async function kiemDungNhau(s: San, id: string, trangThai: string, nhan1: string, nhan2: string): Promise<string[]> {
  const loi: string[] = [];
  const v = (await banTinh(id)).version;
  const n0 = await demSuKien(id);
  const r1 = await gui(s, "dc", id, "status_changed", { to: trangThai, label: nhan1 }, v);
  if (r1.status !== 200) loi.push(`${trangThai}: lệnh đầu ra ${r1.status}, chờ 200`);
  const r2 = await gui(s, "tn", id, "status_changed", { to: trangThai, label: nhan2 }, v);
  if (r2.status !== 409) loi.push(`${trangThai}: lệnh sau ra ${r2.status}, chờ 409`);
  else if ((await loiCua(r2)) !== XUNG_DOT) loi.push(`${trangThai}: lệnh sau sai mã lỗi`);
  const b = await banTinh(id);
  if (b.status_label !== nhan1) loi.push(`${trangThai}: nhãn ${b.status_label}, chờ ${nhan1}`);
  if (b.standard_status !== trangThai) loi.push(`${trangThai}: trạng thái ${b.standard_status}`);
  if ((await demSuKien(id)) !== n0 + 1) loi.push(`${trangThai}: số sự kiện ${await demSuKien(id)}, chờ ${n0 + 1}`);
  return loi;
}

test("AC-3 đổi nhãn đụng nhau: lệnh sau 409, không đè", async () => {
  const { s, ma } = await sanCoNhan();
  const giaoDich = await canDangBan(s);
  await duoc(s, "dc", giaoDich, "status_changed", { to: "Pending" });
  const daBan = await canDangBan(s);
  await duoc(s, "dc", daBan, "status_changed", CHOT(3_400_000_000));
  const ca: [string, string, string, string][] = [
    [giaoDich, "Pending", ma["Giữ chỗ"]!, ma["Chờ ký"]!],
    [daBan, "Closed", ma["Đã sang tên"]!, ma["Chờ sang tên"]!],
  ];
  let dem = 0;
  for (const [id, tt, n1, n2] of ca) {
    assert.deepEqual(await kiemDungNhau(s, id, tt, n1, n2), []);
    dem++;
  }
  assert.equal(dem, 2);
});

test("AC-4 lệnh cũ không kéo căn về Đang giao dịch", async () => {
  const { s, ma } = await sanCoNhan();
  const id = await canDangBan(s);
  await duoc(s, "dc", id, "status_changed", { to: "Pending" });
  const v = (await banTinh(id)).version;
  await duoc(s, "tn", id, "status_changed", { to: "Active" });
  const sau = await banTinh(id);
  const n0 = await demSuKien(id);
  const LENH: [string, object][] = [
    ["(a)", { to: "Pending", label: ma["Giữ chỗ"] }],
    ["(b)", { to: "Pending" }],
  ];
  const loi: string[] = [];
  for (const [t, p] of LENH) {
    const r = await gui(s, "dc", id, "status_changed", p, v);
    if (r.status !== 409) loi.push(`${t} ra ${r.status}, căn thành ${(await banTinh(id)).standard_status}`);
    else if ((await loiCua(r)) !== XUNG_DOT) loi.push(`${t} sai mã lỗi`);
  }
  assert.deepEqual(loi, []);
  const b = await banTinh(id);
  assert.deepEqual([b.standard_status, b.status_label], ["Active", sau.status_label]);
  assert.equal(await demSuKien(id), n0);
});

test("AC-5 thắng ngay giữ nguyên, đổi nhãn đúng phiên bản nhận", async () => {
  const { s, ma } = await sanCoNhan();
  const GIA = { listPrice: 3_300_000_000, feeInclusion: "included" };
  const a = await canDangBan(s);
  const b = await canDangBan(s);
  const va = (await banTinh(a)).version;
  const vb = (await banTinh(b)).version;
  await duoc(s, "tn", a, "price_changed", GIA);
  await duoc(s, "tn", b, "price_changed", GIA);
  const ra = await gui(s, "dc", a, "status_changed", { to: "Pending" }, va);
  assert.equal(ra.status, 200, await ra.clone().text());
  const rb = await gui(s, "dc", b, "status_changed", CHOT(3_400_000_000), vb);
  assert.equal(rb.status, 200, await rb.clone().text());
  assert.deepEqual([(await banTinh(a)).standard_status, (await banTinh(b)).standard_status], ["Pending", "Closed"]);

  await duoc(s, "dc", a, "status_changed", { to: "Pending", label: ma["Giữ chỗ"] });
  assert.equal((await banTinh(a)).status_label, ma["Giữ chỗ"]);
  const khongKhai = await gui(s, "dc", a, "status_changed", { to: "Pending", label: ma["Chờ ký"] }, undefined);
  assert.equal(khongKhai.status, 409);
  assert.equal(await loiCua(khongKhai), XUNG_DOT);
  assert.equal((await banTinh(a)).status_label, ma["Giữ chỗ"]);
  // Đối chứng: lệnh đổi giá không khai phiên bản cũng 409 — cùng luật.
  const gia = await gui(s, "dc", a, "price_changed", GIA, undefined);
  assert.equal(gia.status, 409);
  assert.equal(await loiCua(gia), XUNG_DOT);
});

test("AC-5 cùng đưa vào: lệnh sau bị từ chối", async () => {
  const { s, ma } = await sanCoNhan();
  const a = await canDangBan(s);
  const b = await canDangBan(s);
  const loi: string[] = [];
  const va = (await banTinh(a)).version;
  const na = await demSuKien(a);
  assert.equal((await gui(s, "dc", a, "status_changed", { to: "Pending" }, va)).status, 200);
  const a2 = await gui(s, "tn", a, "status_changed", { to: "Pending" }, va);
  if (a2.status === 200) loi.push("A: lệnh không nhãn ra 200");
  const a3 = await gui(s, "tn", a, "status_changed", { to: "Pending", label: ma["Chờ ký"] }, va);
  if (a3.status !== 409) loi.push(`A: lệnh có nhãn ra ${a3.status}, nhãn bị đè`);
  else if ((await loiCua(a3)) !== XUNG_DOT) loi.push("A: lệnh có nhãn sai mã lỗi");
  const vb = (await banTinh(b)).version;
  const nb = await demSuKien(b);
  assert.equal((await gui(s, "dc", b, "status_changed", CHOT(3_400_000_000), vb)).status, 200);
  const b2 = await gui(s, "tn", b, "status_changed", CHOT(3_100_000_000), vb);
  if (b2.status === 200) loi.push("B: lệnh chốt sau ra 200");
  assert.deepEqual(loi, []);
  const A = await banTinh(a);
  const B = await banTinh(b);
  assert.deepEqual([A.standard_status, A.status_label], ["Pending", null]);
  assert.equal(Number(B.close_price), 3_400_000_000);
  assert.deepEqual([await demSuKien(a), await demSuKien(b)], [na + 1, nb + 1]);
});
