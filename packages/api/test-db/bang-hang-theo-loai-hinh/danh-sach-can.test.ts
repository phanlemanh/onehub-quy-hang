// Danh sách căn ngoài khu cho Bảng hàng trên Postgres thật (hàng 79 bang-hang-theo-loai-hinh — E7b, E8b). Sàn, người, căn,
// hàng dựng qua đường ghi thật. Địa chỉ «Đường Mẫu N» với tỉnh, xã của danh mục đơn vị hành chính công — không địa chỉ thật.
import { SOURCE_KEYS } from "@quy-hang/core/listing";
import assert from "node:assert/strict";
import { after, test } from "node:test";
import { cleanup } from "../helpers";
import { sanMoi, send, type San } from "../san-thu";

after(cleanup);

const VAI = { dc: { vai: ["listing_agent"] }, ts: { vai: ["telesales"] } };
const CAN = "/api/v1/off-compound-units";
const HANG = "/api/v1/listings";
const ck = (s: San, k = "dc") => s.nguoi[k]!.cookie;
const json = async (r: Response) => (await r.json()) as Record<string, unknown>;

/** Ba căn của sàn A (mỗi loại hình một căn) và một căn của sàn B — bảng viết trước. */
const CAN_A = [
  ["Townhouse", "21 Đường Mẫu 3, Phường Phú Xuân, Thành phố Huế"],
  ["Single Family Residence", "22 Đường Mẫu 5, Phường Tân Định, Thành phố Hồ Chí Minh"],
  ["Unimproved Land", "23 Đường Mẫu 7, Phường Tân Định, Thành phố Hồ Chí Minh"],
] as const;
const CAN_B = ["Unimproved Land", "24 Đường Mẫu 7, Phường Tân Định, Thành phố Hồ Chí Minh"] as const;

async function tao(s: San, [loai, diaChi]: readonly [string, string]) {
  const r = await send("POST", CAN, { address: diaChi, propertySubType: loai }, ck(s));
  assert.equal(r.status, 201, await r.clone().text());
  return json(r);
}
type Dong = { id: string; propertySubType: string; unparsedAddress: string };
const doc = async (s: San, k = "dc") => send("GET", CAN, undefined, ck(s, k));

test("E7b danh sách căn ngoài khu: mỗi sàn đúng căn của mình, đúng ba khoá, không khoá nguồn", async () => {
  const a = await sanMoi(VAI);
  const b = await sanMoi(VAI, 60);
  const ca = [];
  for (const c of CAN_A) ca.push(await tao(a, c));
  const cb = await tao(b, CAN_B);

  const ra = await doc(a);
  assert.equal(ra.status, 200);
  const da = ((await json(ra)).units ?? []) as Dong[];
  // Sàn A không thấy căn của B — nêu mã căn lọt.
  const lot = da.filter((d) => d.id === cb.id).map((d) => d.id);
  assert.deepEqual(lot, [], `căn của sàn B lọt sang A: ${lot.join(", ")}`);
  assert.deepEqual(da.map((d) => d.id).sort(), ca.map((c) => String(c.id)).sort());
  for (const [i, d] of da.entries()) {
    assert.deepEqual(Object.keys(d).sort(), ["id", "propertySubType", "unparsedAddress"], `dòng ${i} có khoá ngoài ba khoá`);
    for (const k of SOURCE_KEYS) assert.equal(k in d, false, `dòng ${i} mang khoá nguồn ${k}`);
  }
  assert.deepEqual(da.map((d) => [d.propertySubType, d.unparsedAddress]).sort(), CAN_A.map(([l, dc]) => [l, String(ca.find((c) => c.propertySubType === l)!.unparsedAddress)]).sort());
  assert.ok(CAN_A.every(([, dc]) => ca.some((c) => String(c.unparsedAddress).includes(dc.split(",")[0]!))), "địa chỉ đã gõ không giữ số nhà và tên đường");

  const rb = await doc(b);
  const dbs = ((await json(rb)).units ?? []) as Dong[];
  assert.deepEqual(dbs.map((d) => d.id), [String(cb.id)]);
});

test("E7b đối chứng: sàn chưa có căn ngoài khu nhận danh sách rỗng (200), không phải từ chối", async () => {
  const s = await sanMoi(VAI, 70);
  const r = await doc(s);
  assert.equal(r.status, 200);
  assert.deepEqual(await json(r), { units: [] });
});

test("E7b người không làm việc với Bảng hàng: 403; chưa đăng nhập: 401", async () => {
  const s = await sanMoi(VAI, 80);
  await tao(s, CAN_A[0]);
  const r = await doc(s, "ts");
  assert.equal(r.status, 403);
  const k = await send("GET", CAN);
  assert.equal(k.status, 401);
});

test("E8b màn đọc được loại hình của hàng ngoài khu: offCompoundUnitId của hàng khớp một căn mang Unimproved Land", async () => {
  const s = await sanMoi(VAI, 90);
  const c = await tao(s, CAN_A[2]);
  const rh = await send("POST", HANG, { offCompoundUnitId: c.id }, ck(s));
  assert.equal(rh.status, 201, await rh.clone().text());
  const ds = (await json(await send("GET", HANG, undefined, ck(s)))) as unknown as { listings?: Record<string, unknown>[] } | Record<string, unknown>[];
  const hang = (Array.isArray(ds) ? ds : (ds.listings ?? [])) as Record<string, unknown>[];
  const h = hang.find((x) => x.offCompoundUnitId === c.id);
  assert.ok(h, "hàng ngoài khu không có trong GET /api/v1/listings");
  const can = (((await json(await doc(s))).units ?? []) as Dong[]).find((d) => d.id === h!.offCompoundUnitId);
  assert.equal(can?.propertySubType, "Unimproved Land");
});
