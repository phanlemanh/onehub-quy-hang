// Căn ngoài khu và hàng trên lô, ngoài khu trên Postgres thật (hàng 76 can-ngoai-khu — E3, E4, E5, E6, E8, E9). Sàn, người,
// căn, hàng dựng qua đường ghi thật; kết nối chủ chỉ để đếm. Địa chỉ «Đường Mẫu N», số nhà sinh; tỉnh, xã lấy từ danh mục
// đơn vị hành chính công — không địa chỉ thật của ai. Lô rút từ danh mục mẫu thấp tầng (hàng 73).
import { docDiaChi } from "@quy-hang/core/address";
import { SOURCE_KEYS } from "@quy-hang/core/listing";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { readFileSync } from "node:fs";
import { after, test } from "node:test";
import { API_ERRORS } from "../../src/errors";
import { LY_DO_KHONG_CO_CAN } from "../../src/listings/store";
import { appPool, cleanup } from "../helpers";
import { sanMoi, send, type San } from "../san-thu";

after(cleanup);

const VAI = { dc: { vai: ["listing_agent"] }, tn: { vai: ["team_lead"] }, ts: { vai: ["telesales"] } };
const CAN = "/api/v1/off-compound-units";
const HANG = "/api/v1/listings";
const ck = (s: San, k = "dc") => s.nguoi[k]!.cookie;

/** Lô của khu mẫu thấp tầng — rút từ dữ liệu mẫu hàng 73, không chép tay. */
const MAU = JSON.parse(readFileSync(new URL("../../../db/seed/mau-thap-tang/du-lieu-mau-thap-tang.json", import.meta.url), "utf8")) as {
  danhMucThapTang: { subdivisions: { subdivisionName: string; blocks: { blockName: string; units: { unitNumber: string; propertySubType: string }[] }[] }[] };
};
const KHU = MAU.danhMucThapTang.subdivisions[0]!;
const DAY = KHU.blocks.find((b) => b.units.some((u) => u.propertySubType === "Townhouse"))!;
const LO = { subdivisionName: KHU.subdivisionName, blockName: DAY.blockName, unitNumber: DAY.units.find((u) => u.propertySubType === "Townhouse")!.unitNumber };

const DIA_CHI = {
  Townhouse: "12 Đường Mẫu 3, Phường Phú Xuân, Thành phố Huế",
  "Single Family Residence": "8 Đường Mẫu 5, Phường Tân Định, Thành phố Hồ Chí Minh",
  "Unimproved Land": "3 Đường Mẫu 7, Phường Tân Định, Thành phố Hồ Chí Minh",
} as const;
type Loai = keyof typeof DIA_CHI;

const json = async (r: Response) => (await r.json()) as Record<string, unknown>;
const demCan = async (s: San) => (await appPool.query<{ n: number }>("select count(*)::int n from off_compound_units where company_id = $1", [s.companyId])).rows[0]!.n;
const demHang = async (s: San) => (await appPool.query<{ n: number }>("select count(*)::int n from listings where company_id = $1", [s.companyId])).rows[0]!.n;
const demSuKien = async (s: San) => (await appPool.query<{ n: number }>("select count(*)::int n from listing_events where company_id = $1", [s.companyId])).rows[0]!.n;
const dem = async (s: San) => [await demCan(s), await demHang(s), await demSuKien(s)];

async function taoCan(s: San, address: string, propertySubType: string, k = "dc") {
  return send("POST", CAN, { address, propertySubType }, ck(s, k));
}
async function canMoi(s: San, loai: Loai): Promise<Record<string, unknown>> {
  const r = await taoCan(s, DIA_CHI[loai], loai);
  assert.equal(r.status, 201, await r.clone().text());
  return json(r);
}

test("AC-3 tạo căn ngoài khu và cùng khoá là một căn", async () => {
  const s = await sanMoi(VAI);
  let so = 0;
  for (const loai of Object.keys(DIA_CHI) as Loai[]) {
    const c = await canMoi(s, loai);
    const d = docDiaChi(DIA_CHI[loai]);
    assert.equal(c.propertySubType, loai);
    assert.equal(c.addressKey, d.khoa, `${loai}: khoá phải bằng khoá lõi tính`);
    assert.equal(c.stateOrProvinceCode, d.stateOrProvince!.ma);
    assert.equal(c.wardCode, (d.wardName as { ma: string }).ma);
    assert.equal(c.streetName, d.streetName);
    assert.equal(c.streetNumber, d.streetNumber);
    so++;
  }
  assert.equal(so, 3);
  // Ba cách viết khác của cùng nhà Townhouse: chữ HOA, «số», tên phường cũ (Đông Ba → Phú Xuân, rút từ danh mục).
  const goc = await json(await taoCan(s, DIA_CHI.Townhouse, "Townhouse"));
  const cu = docDiaChi("12 Đường Mẫu 3, Phường Đông Ba, Thành phố Huế");
  assert.equal((cu.wardName as { tuTenCu?: string }).tuTenCu, "Đông Ba", "phường cũ phải được đọc ra phường mới");
  const truoc = await demCan(s);
  for (const chu of ["12 ĐƯỜNG MẪU 3, PHƯỜNG PHÚ XUÂN, THÀNH PHỐ HUẾ", "số 12 Đường Mẫu 3, Phường Phú Xuân, Thành phố Huế", "12 Đường Mẫu 3, Phường Đông Ba, Thành phố Huế"]) {
    const r = await taoCan(s, chu, "Townhouse");
    assert.equal(r.status, 200, `${chu}: ${await r.clone().text()}`);
    assert.equal((await json(r)).id, goc.id, `${chu}: phải ra đúng căn cũ`);
  }
  assert.equal(await demCan(s), truoc, "số căn của sàn không được tăng");
});

test("AC-4 địa chỉ chưa chắc và loại hình sai bị từ chối", async () => {
  const s = await sanMoi(VAI);
  // Tên phường cũ tách vào nhiều xã mới (rút từ danh mục): lõi đọc ra «cần người chọn».
  const tach = "12 Đường Mẫu 3, Phường Đa Kao, Quận 1, Thành phố Hồ Chí Minh";
  assert.equal(docDiaChi(tach).trangThai, "can-nguoi-chon");
  const BANG: [string, { address: string; propertySubType: string }, string][] = [
    ["cần người chọn xã", { address: tach, propertySubType: "Townhouse" }, "cần chọn xã"],
    ["thiếu tỉnh", { address: "12 Đường Mẫu 3", propertySubType: "Townhouse" }, "tỉnh"],
    ["thiếu xã", { address: "12 Đường Mẫu 3, Thành phố Hồ Chí Minh", propertySubType: "Townhouse" }, "thiếu xã, phường"],
    ["thiếu đường", { address: "Phường Tân Định, Thành phố Hồ Chí Minh", propertySubType: "Townhouse" }, "thiếu tên đường"],
    ["chưa có trong danh mục", { address: "12 Đường Mẫu 3, Phường Không Có, Thành phố Hồ Chí Minh", propertySubType: "Townhouse" }, "chưa có trong danh mục"],
    ["loại hình căn hộ", { address: DIA_CHI.Townhouse, propertySubType: "Condominium" }, "căn ngoài khu cần một trong"],
  ];
  const truoc = await demCan(s);
  const loi: string[] = [];
  for (const [ten, than, cho] of BANG) {
    const r = await send("POST", CAN, than, ck(s));
    const b = await json(r);
    if (r.status !== 400 || !String(b.reason).includes(cho)) loi.push(`${ten}: ${r.status} ${String(b.reason)}`);
  }
  assert.deepEqual(loi, []);
  assert.equal(BANG.length, 6);
  assert.equal(await demCan(s), truoc);
  // Đối chứng dương: địa chỉ chắc thì tạo được.
  assert.equal((await taoCan(s, DIA_CHI.Townhouse, "Townhouse")).status, 201);
});

test("AC-5 thiếu số nhà", async () => {
  const s = await sanMoi(VAI);
  const chu = "Đường Mẫu 9, Phường Tân Định, Thành phố Hồ Chí Minh";
  const truoc = await demCan(s);
  const a = await taoCan(s, chu, "Unimproved Land");
  assert.equal(a.status, 201, await a.clone().text());
  const ca = await json(a);
  assert.deepEqual([ca.addressKey, ca.streetNumber], [null, null]);
  const b = await taoCan(s, chu, "Unimproved Land");
  assert.equal(b.status, 201);
  assert.notEqual((await json(b)).id, ca.id, "căn không số nhà không gộp theo địa chỉ");
  assert.equal(await demCan(s), truoc + 2);
});

test("AC-6 hai sàn cùng địa chỉ", async () => {
  const a = await sanMoi(VAI);
  const b = await sanMoi(VAI);
  const ca = await canMoi(a, "Townhouse");
  const cb = await canMoi(b, "Townhouse");
  assert.notEqual(ca.id, cb.id);
  assert.equal(ca.addressKey, cb.addressKey);
  const truoc = await dem(a);
  const ngauNhien = randomUUID();
  const loi: string[] = [];
  for (const [ten, goi] of [
    ["đọc căn", (ma: string) => send("GET", `${CAN}/${ma}`, undefined, ck(a))],
    ["tạo hàng", (ma: string) => send("POST", HANG, { offCompoundUnitId: ma }, ck(a))],
  ] as const) {
    const rb = await goi(String(cb.id));
    const rn = await goi(ngauNhien);
    const [tb, tn] = [await rb.text(), await rn.text()];
    if (rb.status === 201 || rb.status === 200) loi.push(`A ${ten} trên căn của B: ${rb.status}`);
    if (rb.status !== rn.status || tb !== tn) loi.push(`${ten}: căn của B «${rb.status} ${tb}» khác mã không có «${rn.status} ${tn}»`);
  }
  // Tạo hàng trên căn không thấy được: đúng câu từ chối của lệnh (không phải lỗi hệ thống của khoá ngoại tầng dữ liệu).
  const rb = await send("POST", HANG, { offCompoundUnitId: cb.id }, ck(a));
  if (rb.status !== 400) loi.push(`A tạo hàng trên căn của B: ${rb.status}`);
  else assert.deepEqual(await json(rb), { error: API_ERRORS.invalidPayload.code, details: [{ path: "offCompoundUnitId", reason: LY_DO_KHONG_CO_CAN }] });
  assert.deepEqual(loi, [], "A tạo hàng trên căn của B");
  assert.deepEqual(await dem(a), truoc);
});

test("AC-6 không Bảng hàng", async () => {
  const s = await sanMoi(VAI);
  const truoc = await demCan(s);
  const tao = await taoCan(s, DIA_CHI.Townhouse, "Townhouse", "ts");
  const hang = await send("POST", HANG, { buildingName: "[Toà A]" }, ck(s, "ts"));
  assert.deepEqual([tao.status, await tao.text()], [hang.status, await hang.text()], "tạo căn phải bị từ chối như tạo hàng");
  const c = await canMoi(s, "Townhouse");
  const doc = await send("GET", `${CAN}/${String(c.id)}`, undefined, ck(s, "ts"));
  assert.equal(doc.status, API_ERRORS.notFound.status);
  assert.equal(await demCan(s), truoc + 1, "chỉ người có Bảng hàng tạo được căn");
});

test("AC-8 tạo hàng bốn loại hình", async () => {
  const s = await sanMoi(VAI);
  const loi: string[] = [];
  for (const loai of Object.keys(DIA_CHI) as Loai[]) {
    const c = await canMoi(s, loai);
    const r = await send("POST", HANG, { offCompoundUnitId: c.id }, ck(s));
    if (r.status !== 201) {
      loi.push(`${loai}: ${r.status} ${await r.text()}`);
      continue;
    }
    const h = await json(r);
    const g = await json(await send("GET", `${HANG}/${String(h.id)}`, undefined, ck(s)));
    if (g.standardStatus !== "Incomplete" || g.buildingName !== null || g.offCompoundUnitId !== c.id) loi.push(`${loai}: đọc lại lệch ${JSON.stringify(g)}`);
    const cc = await json(await send("GET", `${CAN}/${String(g.offCompoundUnitId)}`, undefined, ck(s)));
    if (cc.propertySubType !== loai) loi.push(`${loai}: căn của hàng ra ${String(cc.propertySubType)}`);
  }
  const rl = await send("POST", HANG, LO, ck(s));
  assert.equal(rl.status, 201, await rl.clone().text());
  const gl = await json(await send("GET", `${HANG}/${String((await json(rl)).id)}`, undefined, ck(s)));
  assert.deepEqual([gl.subdivisionName, gl.blockName, gl.unitNumber, gl.buildingName, gl.standardStatus], [LO.subdivisionName, LO.blockName, LO.unitNumber, null, "Incomplete"]);
  // Đối chứng: hàng có toà tạo như cũ.
  const rt = await send("POST", HANG, { buildingName: "[Toà A]", unitNumber: "A-01.01" }, ck(s));
  assert.equal(rt.status, 201);
  const gt = await json(rt);
  assert.deepEqual([gt.buildingName, gt.subdivisionName, gt.blockName, gt.offCompoundUnitId], ["[Toà A]", null, null, null]);
  assert.deepEqual(loi, []);
});

test("AC-9 khoá nguồn bị từ chối", async () => {
  const s = await sanMoi(VAI);
  const c = await canMoi(s, "Townhouse");
  const GIA: Record<string, unknown> = { ownerName: "[Tên]", ownerPhone: "0900 000 001", floorPrice: 1, titleDeedPhoto: "x" };
  const truoc = await dem(s);
  const loi: string[] = [];
  let so = 0;
  for (const k of SOURCE_KEYS) {
    for (const [ten, duong, than] of [
      ["có toà", HANG, { buildingName: "[Toà A]" }],
      ["lô", HANG, LO],
      ["ngoài khu", HANG, { offCompoundUnitId: c.id }],
      ["tạo căn", CAN, { address: DIA_CHI.Townhouse, propertySubType: "Townhouse" }],
    ] as const) {
      so++;
      const r = await send("POST", duong, { ...than, [k]: GIA[k] }, ck(s));
      const b = await json(r);
      const details = (b.details as { path: string }[] | undefined) ?? [];
      if (r.status !== 400 || !details.some((d) => d.path === k)) loi.push(`${ten} + ${k}: ${r.status} ${JSON.stringify(b)}`);
    }
  }
  assert.equal(so, 16);
  assert.deepEqual(loi, []);
  assert.deepEqual(await dem(s), truoc);
});
