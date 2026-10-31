// Lớp trường nguồn ở lõi (hàng 11: AC-1..AC-4). Bảng 12 ô của AC-2 là tệp dữ liệu viết tay — bộ kiểm cách ly
// (packages/db/tests/isolation.test.mjs) nạp CÙNG tệp để đo luật của cơ sở dữ liệu.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { CEILING } from "../data-classes";
import { SOURCE_KEYS } from "../listing";
import { canSeeSource, checkOwnerFields, findSourceLeaks, OWNER_FIELDS, ownerView, validateOwnerInput, type OwnerRecord } from ".";

type O = { o: string; vai: string[]; giu: boolean; thay: boolean };
const BANG: O[] = JSON.parse(readFileSync(new URL("./bang-xem-nguon.json", import.meta.url), "utf8"));
const NGUOI = "u-nguoi-xem";
const KHAC = "u-dau-chu-khac";

const TEN = "[Tên chủ mẫu]";
const SO = "0900000012";
const GIA_DAY = 3_200_000_000;
const MAU = [TEN, SO, "0900 000 012", "+84900000012", String(GIA_DAY)];
const REC: OwnerRecord = { listingAgentUserId: NGUOI, ownerName: TEN, floorPrice: GIA_DAY, hasPhone: true };

test("trường nguồn: đúng ba trường, lớp source, trần never_leaves_company", () => {
  assert.deepEqual(Object.keys(OWNER_FIELDS).sort(), ["floorPrice", "ownerName", "ownerPhone"]);
  for (const [k, lop] of Object.entries(OWNER_FIELDS)) {
    assert.equal(lop, "source", k);
    assert.equal(CEILING[lop], "never_leaves_company", k);
    assert.ok((SOURCE_KEYS as readonly string[]).includes(k), `${k} không có trong SOURCE_KEYS`);
  }
  assert.deepEqual(checkOwnerFields(OWNER_FIELDS), []);
  // Đối chứng cùng hàm kiểm: một trường lớp khác bị gọi tên.
  assert.deepEqual(checkOwnerFields({ ...OWNER_FIELDS, ghiChu: "company_internal" }), [
    "ghiChu: lớp company_internal, cần source",
    "ghiChu: trần company_only, cần never_leaves_company",
    "ghiChu: không có trong khoá nguồn của lõi hàng",
  ]);
});

test("xem nguồn: bảng 12 ô của AC-2 ở lõi", () => {
  assert.equal(BANG.length, 12);
  let soLanSo = 0;
  for (const o of BANG) {
    const ketQua = canSeeSource({ userId: NGUOI, roles: o.vai }, o.giu ? NGUOI : KHAC);
    assert.equal(ketQua, o.thay, `ô «${o.o}»: ra ${ketQua}, cần ${o.thay}`);
    soLanSo++;
  }
  assert.equal(soLanSo, 12);
});

test("xem nguồn: hàng chưa có đầu chủ — chỉ trưởng nhóm thấy", () => {
  assert.equal(canSeeSource({ userId: NGUOI, roles: ["listing_agent"] }, null), false);
  assert.equal(canSeeSource({ userId: NGUOI, roles: ["team_lead"] }, null), true);
});

test("bản trả cho người thấy: tên, giá đáy, cờ có số, không số", () => {
  const v = ownerView(REC, { userId: NGUOI, roles: ["listing_agent"] });
  assert.deepEqual(v, { visible: true, ownerName: TEN, floorPrice: GIA_DAY, hasPhone: true });
  const chuoi = JSON.stringify(v);
  for (const so of [SO, "0900 000 012", "+84900000012", "012"]) assert.ok(!chuoi.includes(so), `lộ «${so}»`);
});

test("bản trả không mang số dù bản ghi đọc lên có số", () => {
  // Bản ghi cấy số như một dòng đọc nhầm cả cột số: hàm dựng bản trả phải chọn trường, không chép cả bản ghi.
  const coSo = { ...REC, ownerPhone: SO } as OwnerRecord;
  for (const [ai, viewer] of [
    ["đầu chủ giữ căn", { userId: NGUOI, roles: ["listing_agent"] }],
    ["đầu khách", { userId: KHAC, roles: ["buyer_agent"] }],
  ] as const) {
    const chuoi = JSON.stringify(ownerView(coSo, { userId: viewer.userId, roles: [...viewer.roles] }));
    for (const so of ["ownerPhone", SO, "0900 000 012", "+84900000012"]) assert.ok(!chuoi.includes(so), `${ai}: lộ «${so}»`);
  }
});

test("bản trả cho người không thấy: không khoá, không giá trị nguồn ở mọi cấp", () => {
  const v = ownerView(REC, { userId: KHAC, roles: ["buyer_agent"] });
  assert.deepEqual(v, { visible: false, listingAgentUserId: NGUOI });
  assert.deepEqual(findSourceLeaks(v, MAU), []);
  // Đối chứng dương cùng hàm quét: khoá nguồn lồng và giá trị nguồn đều bị gọi tên đường.
  assert.deepEqual(findSourceLeaks({ a: { ownerPhone: SO } }), ["a.ownerPhone"]);
  assert.deepEqual(findSourceLeaks({ ds: [{ ghi: `gọi ${TEN}` }] }, MAU), ["ds.0.ghi"]);
});

test("khuôn chủ nhà: khoá lạ, số sai dạng, giá đáy sai bị từ chối", () => {
  const CA: [string, unknown, { path: string; reason: string }][] = [
    ["khoá lạ cấp đầu", { ownerName: TEN, ghiChu: "x" }, { path: "ghiChu", reason: "khoá lạ" }],
    ["khoá lạ trong khối lồng", { ownerName: TEN, ownerPhone: { so: SO } }, { path: "ownerPhone", reason: "cần số điện thoại Việt Nam 10 chữ số" }],
    ["thiếu tên", { ownerPhone: SO }, { path: "ownerName", reason: "thiếu" }],
    ["số 9 chữ số", { ownerName: TEN, ownerPhone: "090000001" }, { path: "ownerPhone", reason: "cần số điện thoại Việt Nam 10 chữ số" }],
    ["số chứa chữ", { ownerName: TEN, ownerPhone: "0900abc012" }, { path: "ownerPhone", reason: "cần số điện thoại Việt Nam 10 chữ số" }],
    ["giá đáy 0", { ownerName: TEN, floorPrice: 0 }, { path: "floorPrice", reason: "cần số đồng nguyên dương" }],
    ["giá đáy âm", { ownerName: TEN, floorPrice: -1 }, { path: "floorPrice", reason: "cần số đồng nguyên dương" }],
    ["giá đáy thập phân", { ownerName: TEN, floorPrice: 1.5 }, { path: "floorPrice", reason: "cần số đồng nguyên dương" }],
    ["giá đáy chuỗi", { ownerName: TEN, floorPrice: "3200000000" }, { path: "floorPrice", reason: "cần số đồng nguyên dương" }],
    ["không phải đối tượng", [TEN], { path: "payload", reason: "cần một đối tượng" }],
  ];
  for (const [ten, payload, loi] of CA) {
    const r = validateOwnerInput(payload);
    assert.equal(r.ok, false, ten);
    if (!r.ok) assert.ok(r.errors.some((e) => e.path === loi.path && e.reason === loi.reason), `${ten}: ${JSON.stringify(r.errors)}`);
  }
  for (const viet of ["+84 900 000 012", "0900.000.012", "84900000012", "0900-000-012", SO]) {
    const r = validateOwnerInput({ ownerName: TEN, ownerPhone: viet, floorPrice: GIA_DAY });
    assert.deepEqual(r, { ok: true, value: { ownerName: TEN, ownerPhone: SO, floorPrice: GIA_DAY } }, viet);
  }
});
