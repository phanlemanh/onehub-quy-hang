// Gõ mã lô thấp tầng (hàng 74, hồ sơ go-ma-lo) — E1–E8.
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { checkLotRuleAgainstSubdivision, LOT_CODE_RULES, readLotCode, type LotCodeRule } from "./lot-code";
import { buildLotIndex, LOT_ATTRIBUTE_CLASS, LOT_ATTRIBUTE_FIELDS, lookupLot, type LotCatalogData, type LotLookupResult } from "./lot-lookup";
import { PROPERTY_SUBTYPE_FIELDS, TYPED_UNIT_FIELDS } from "./property-type";

/** Vật hàng 73, đường suy từ vị trí tệp này (packages/core/src/catalog). */
const THU_MUC = fileURLToPath(new URL("../../../db/seed/", import.meta.url));
const DU_LIEU = JSON.parse(readFileSync(`${THU_MUC}mau-thap-tang/du-lieu-mau-thap-tang.json`, "utf8"));
const DAP_AN = JSON.parse(readFileSync(`${THU_MUC}mau-thap-tang/dap-an-thap-tang.json`, "utf8")).file;
const KHU: LotCatalogData = DU_LIEU.danhMucThapTang;
type Lo = Record<string, unknown> & { unitNumber: string; upi: string; propertySubType: string };
const LO: (Lo & { blockKey: string; blockName: string; nhanSan: string })[] = KHU.subdivisions[0]!.blocks!.flatMap((b) =>
  b.units.map((u) => ({ ...(u as unknown as Lo), blockKey: b.blockKey, blockName: b.blockName, nhanSan: b.nhanSan ?? "" })),
);
const INDEX = buildLotIndex(KHU);
const RULE = LOT_CODE_RULES[0]!;

/** Mười hai kiểu viết viết trước của một lô (mã chuẩn `XXn-ll`). */
function kieuViet(ma: string): [string, string][] {
  const [d, l] = ma.split("-") as [string, string];
  const n = String(Number(l));
  return [
    ["gạch", `${d}-${l}`],
    ["cách", `${d} ${l}`],
    ["chấm", `${d}.${l}`],
    ["gạch chéo", `${d}/${l}`],
    ["gạch dưới", `${d}_${l}`],
    ["liền", `${d}${l}`],
    ["thiếu 0", `${d}-${n}`],
    ["chữ thường", `${d}-${l}`.toLowerCase()],
    ["thừa khoảng trắng", `  ${d} -  ${l} `],
    ["lô … dãy …", `lô ${n} dãy ${d}`],
    ["dãy … lô …", `dãy ${d} lô ${l}`],
    ["Lô <mã>", `Lô ${d}-${l}`],
  ];
}

/** Hàm kiểm: mọi kiểu viết của mọi lô ra đúng lô ấy. */
function kiemMaTran(index = INDEX): string[] {
  const loi: string[] = [];
  for (const lo of LO) {
    for (const [kieu, chu] of kieuViet(lo.unitNumber)) {
      const kq = lookupLot(index, chu);
      if (kq.status !== "found") loi.push(`kiểu viết không đọc ra lô: ${kieu} ${chu}`);
      else if (kq.unit.upi !== lo.upi) loi.push(`hai lô ra một: ${lo.unitNumber} → ${kq.unit.unitNumber}`);
    }
  }
  return [...new Set(loi)];
}

test("AC-1 bộ thử hàng 73: 24 ô mã lô của file bẩn ra đúng lô và tự điền", () => {
  const doc = spawnSync("python3", ["-I", `${THU_MUC}doc-xlsx.py`, `${THU_MUC}mau-thap-tang/bang-hang-thap-tang.xlsx`], { encoding: "utf8" });
  assert.equal(doc.status, 0, doc.stderr);
  const dong: unknown[][] = JSON.parse(doc.stdout).dong;
  const cot = DAP_AN.cot.findIndex((c: { dich: string }) => c.dich === "unitNumber");
  const maLo = new Set(LO.map((l) => l.unitNumber));
  const o = (DAP_AN.dung as unknown[][]).flatMap((r, i) => (typeof r[cot] === "string" && maLo.has(r[cot] as string) ? [{ i, chu: String(dong[DAP_AN.headerRow + 1 + i]![cot]), dung: r[cot] as string }] : []));
  assert.equal(o.length, 24);
  console.log(`AC-1: ${o.length} ô mã lô`);
  const kiem = (tra: (chu: string) => LotLookupResult, dapAn = o): string[] =>
    dapAn.flatMap(({ i, chu, dung }) => {
      const kq = tra(chu);
      if (kq.status !== "found" || kq.unit.unitNumber !== dung) return [`ra sai lô: dòng ${i}`];
      const lo = LO.find((l) => l.unitNumber === dung)!;
      const loi: string[] = [];
      if (kq.unit.subdivisionName !== KHU.subdivisions[0]!.subdivisionName) loi.push(`thuộc tính lệch danh mục: ${dung} subdivisionName`);
      if (kq.unit.blockName !== lo.blockName) loi.push(`thuộc tính lệch danh mục: ${dung} blockName`);
      for (const f of ["propertySubType", "lotSizeArea", "storiesTotal", "frontageLength"] as const) {
        if (kq.unit[f] !== (lo[f] ?? null)) loi.push(`thuộc tính lệch danh mục: ${dung} ${f}`);
      }
      return loi;
    });
  assert.deepEqual(kiem((c) => lookupLot(INDEX, c)), []);
  // Phá thử: kết quả bản sao đổi diện tích đất một lô; đáp án bản sao trỏ một ô sang lô khác.
  const sai = (c: string): LotLookupResult => {
    const kq = lookupLot(INDEX, c);
    return kq.status === "found" && kq.unit.unitNumber === "BT1-04" ? { ...kq, unit: { ...kq.unit, lotSizeArea: 1 } } : kq;
  };
  assert.ok(kiem(sai).includes("thuộc tính lệch danh mục: BT1-04 lotSizeArea"));
  const dapAnSai = o.map((x, k) => (k === 0 ? { ...x, dung: "LK1-01" } : x));
  assert.ok(kiem((c) => lookupLot(INDEX, c), dapAnSai).includes(`ra sai lô: dòng ${o[0]!.i}`));
});

test("AC-2 ma trận kiểu viết: 12 kiểu × mọi lô ra đúng lô", () => {
  assert.equal(LO.length, 42);
  assert.equal(kieuViet("LK1-02").length, 12);
  console.log(`AC-2: ${LO.length} lô × 12 kiểu = ${LO.length * 12} lần tra`);
  assert.deepEqual(kiemMaTran(), []);
  // Phá thử: cách đọc bản sao lô một chữ số.
  const hep: LotCodeRule = { ...RULE, lotWidth: 1 };
  assert.ok(kiemMaTran(buildLotIndex(KHU, [hep])).some((l) => l.startsWith("kiểu viết không đọc ra lô: liền")));
});

test("AC-3 chưa có trong danh mục: báo rõ, nói dãy có hay không", () => {
  const maTran: [string, string, string, boolean][] = [
    ["LK1-15", "LK1", "LK1-15", true],
    ["lk1 15", "LK1", "LK1-15", true],
    ["BT1-09", "BT1", "BT1-09", true],
    ["DN1.20", "DN1", "DN1-20", true],
    ["LK9-01", "LK9", "LK9-01", false],
    ["SH2-03", "SH2", "SH2-03", false],
  ];
  const kiem = (tra: (c: string) => LotLookupResult): string[] =>
    maTran.flatMap(([chu, d, ma, co]) => {
      const kq = tra(chu);
      if (kq.status === "found") return [`mã ngoài danh mục ra lô khác: ${chu}`];
      if (kq.status !== "not_in_catalog") return [`không báo chưa có: ${chu}`];
      return JSON.stringify(kq.read) === JSON.stringify([{ subdivisionKey: "mau-khu-thap-tang", blockKey: d, unitNumber: ma, blockKnown: co }]) && !("unit" in kq) ? [] : [`đọc sai: ${chu}`];
    });
  assert.deepEqual(kiem((c) => lookupLot(INDEX, c)), []);
  const sai = (c: string): LotLookupResult => (c === "LK1-15" ? (lookupLot(INDEX, "LK1-05") as LotLookupResult) : lookupLot(INDEX, c));
  assert.ok(kiem(sai).includes("mã ngoài danh mục ra lô khác: LK1-15"));
});

test("AC-4 hai lô không ra một", () => {
  assert.equal(new Set(LO.map((l) => l.unitNumber)).size, LO.length);
  assert.deepEqual(kiemMaTran().filter((l) => l.startsWith("hai lô ra một")), []);
  // Phá thử: cách đọc bản sao bỏ số của dãy — LK1 và LK2 không còn tách được.
  const loiDay: LotCodeRule = { ...RULE, blockPattern: "[A-Z]{2}" };
  assert.ok(kiemMaTran(buildLotIndex(KHU, [loiDay])).length > 0);
});

test("AC-5 không đọc được và mã gần trúng: không đoán lô", () => {
  const khongDoc = ["", "   ", "12", "ABC", "A-12.06", "LK"];
  const ganTrung = ["LK1-02A", "LK1-020", "LK1-102", "LK12-01", "LK1-02-1", "LK1-02 xyz"];
  let soAssert = 0;
  for (const chu of khongDoc) {
    const kq = lookupLot(INDEX, chu);
    assert.equal(kq.status, "unreadable", chu);
    assert.deepEqual((kq as { examples: unknown }).examples, [{ subdivisionKey: "mau-khu-thap-tang", subdivisionName: "[Mẫu] Khu thấp tầng thử", example: "LK1-01" }]);
    soAssert++;
  }
  const kiem = (tra: (c: string) => LotLookupResult, ds: string[]): string[] =>
    ds.flatMap((c) => {
      const kq = tra(c);
      return kq.status === "found" ? [ganTrung.includes(c) ? `mã khác ra lô có sẵn: ${c} → ${kq.unit.unitNumber}` : `đoán lô cho chữ không đọc được: ${c}`] : [];
    });
  assert.deepEqual(kiem((c) => lookupLot(INDEX, c), ganTrung), []);
  soAssert += ganTrung.length;
  assert.equal(soAssert, khongDoc.length + ganTrung.length);
  console.log(`AC-5: ${khongDoc.length} dòng không đọc được, ${ganTrung.length} dòng gần trúng`);
  assert.equal(lookupLot(INDEX, "LK1-02").status, "found");
  assert.deepEqual(lookupLot(buildLotIndex({ subdivisions: [] }), "LK1-02"), { status: "unreadable", input: "LK1-02", examples: [] });
  // Phá thử: bộ tra bản sao bỏ neo cuối.
  const khongNeo = (c: string): LotLookupResult => {
    const m = /^([A-Z]{2}\d)-(\d{2})/.exec(c.toUpperCase());
    return m ? lookupLot(INDEX, `${m[1]}-${m[2]}`) : lookupLot(INDEX, c);
  };
  assert.ok(kiem(khongNeo, ganTrung).includes("mã khác ra lô có sẵn: LK1-02A → LK1-02"));
  assert.ok(kiem((c) => (c === "12" ? lookupLot(INDEX, "LK1-02") : lookupLot(INDEX, c)), ["12"]).includes("đoán lô cho chữ không đọc được: 12"));
});

/** Danh mục hai khu trùng mã: bản sao khu mẫu đổi khoá khu và UPI. */
function haiKhu(): LotCatalogData {
  const s = KHU.subdivisions[0]!;
  const ban = structuredClone(s) as unknown as { subdivisionKey: string; blocks: { units: { upi: string }[] }[] };
  ban.subdivisionKey = "mau-khu-thap-tang-2";
  for (const b of ban.blocks) for (const u of b.units) u.upi = u.upi.replace(":mau:", ":mau2:");
  return { subdivisions: [s, ban as unknown as LotCatalogData["subdivisions"][number]] };
}

test("AC-6 trùng mã hai khu: mọi kiểu viết ra nhiều lô, không chọn hộ", () => {
  const coDoc = buildLotIndex(haiKhu(), [RULE, { ...RULE, subdivisionKey: "mau-khu-thap-tang-2" }]);
  const khongDoc = buildLotIndex(haiKhu(), [RULE]);
  const kiem = (tra: (c: string) => LotLookupResult, ds: string[] = kieuViet("LK1-02").map(([, c]) => c)): string[] =>
    ds.flatMap((chu) => {
      const kq = tra(chu);
      if (kq.status !== "ambiguous") return [`chọn hộ khi trùng mã: ${chu}`];
      const khu = kq.candidates.map((c) => c.subdivisionKey);
      return kq.candidates.length === 2 && khu[0] === "mau-khu-thap-tang" && khu[1] === "mau-khu-thap-tang-2" ? [] : [`ứng viên sai: ${chu}`];
    });
  let dem = 0;
  for (const idx of [coDoc, khongDoc]) {
    assert.deepEqual(kiem((c) => lookupLot(idx, c)), []);
    dem += 12;
  }
  console.log(`AC-6: ${dem} lần tra trên hai cấu hình`);
  const chon = lookupLot(coDoc, "LK1-02", "mau-khu-thap-tang-2");
  assert.equal(chon.status, "found");
  assert.equal((chon as { unit: { upi: string } }).unit.upi, "urn:onehub:upi:mau2:LK1-02");
  assert.deepEqual(lookupLot(coDoc, "LK1-02", "khong-co"), { status: "unknown_subdivision", subdivisionKey: "khong-co" });
  // Phá thử: bộ tra bản sao chọn sẵn ứng viên đầu.
  const chonHo = (c: string): LotLookupResult => {
    const kq = lookupLot(khongDoc, c);
    return kq.status === "ambiguous" ? { status: "found", unit: kq.candidates[0]! } : kq;
  };
  assert.ok(kiem(chonHo, ["lk1 02"]).includes("chọn hộ khi trùng mã: lk1 02"));
  assert.ok(kiem(chonHo).length > 0);
});

test("AC-7 thân trả đúng trường; trường không hợp loại hình là null", () => {
  const cam = /price|gia|owner|chuNha|phone|note|ghiChu/i;
  const tap = (o: object) => Object.keys(o).sort().join("|");
  const kiem = (unit: Record<string, unknown>, lo: Lo): string[] => {
    const loi: string[] = [];
    for (const k of Object.keys(unit)) if (!(LOT_ATTRIBUTE_FIELDS as readonly string[]).includes(k)) loi.push(`trường ngoài danh sách: ${k}`);
    if (tap(unit) !== [...LOT_ATTRIBUTE_FIELDS].sort().join("|")) loi.push(`thiếu trường: ${lo.unitNumber}`);
    for (const k of Object.keys(unit)) if (cam.test(k)) loi.push(`trường cấm: ${k}`);
    const dung = (PROPERTY_SUBTYPE_FIELDS as Record<string, { fields: readonly string[] }>)[lo.propertySubType]!.fields;
    for (const f of TYPED_UNIT_FIELDS) {
      if (!(f in unit)) continue;
      if (!dung.includes(f) && unit[f] !== null) loi.push(`trường không dùng có giá trị: ${lo.unitNumber} ${f}`);
      if (dung.includes(f) && unit[f] !== (lo[f] ?? null)) loi.push(`trường lệch danh mục: ${lo.unitNumber} ${f}`);
    }
    return loi;
  };
  assert.equal(tap(LOT_ATTRIBUTE_CLASS), [...LOT_ATTRIBUTE_FIELDS].sort().join("|"));
  for (const f of LOT_ATTRIBUTE_FIELDS) assert.equal(LOT_ATTRIBUTE_CLASS[f], "catalog");
  let o = 0;
  for (const lo of LO) {
    const kq = lookupLot(INDEX, lo.unitNumber);
    assert.equal(kq.status, "found");
    assert.deepEqual(kiem((kq as { unit: Record<string, unknown> }).unit, lo), [], lo.unitNumber);
    o += TYPED_UNIT_FIELDS.filter((f) => f in (kq as { unit: object }).unit).length;
  }
  const amb = lookupLot(buildLotIndex(haiKhu()), "LK1-02");
  assert.equal(amb.status, "ambiguous");
  for (const c of (amb as { candidates: Record<string, unknown>[] }).candidates) assert.deepEqual(kiem(c, LO.find((l) => l.unitNumber === "LK1-02")!), []);
  console.log(`AC-7: ${LO.length} lô, ${o} ô trường loại hình`);
  const sh = lookupLot(INDEX, "SH1-01");
  assert.equal((sh as { unit: { blockLabel: string } }).unit.blockLabel, "Shophouse");
  // Phá thử.
  const lk = (lookupLot(INDEX, "LK1-01") as { unit: Record<string, unknown> }).unit;
  assert.ok(kiem({ ...lk, listPrice: 1 }, LO[0]!).includes("trường ngoài danh sách: listPrice"));
  const dn = (lookupLot(INDEX, "DN1-01") as { unit: Record<string, unknown> }).unit;
  assert.ok(kiem({ ...dn, livingArea: 100 }, LO.find((l) => l.unitNumber === "DN1-01")!).includes("trường không dùng có giá trị: DN1-01 livingArea"));
});

test("AC-8 cách đọc khớp danh mục", () => {
  const khu = KHU.subdivisions[0]!;
  assert.deepEqual(checkLotRuleAgainstSubdivision(RULE, khu), []);
  console.log(`AC-8: đối chiếu ${LO.length} lô`);
  for (const lo of LO) assert.equal(readLotCode(RULE, lo.unitNumber)?.unitNumber, lo.unitNumber);
  // Phá thử: chuyển LK1-03 sang dãy LK2; khuôn mã bỏ gạch.
  const ban = structuredClone(khu) as unknown as { blocks: { blockKey: string; units: { unitNumber: string }[] }[] };
  const lk1 = ban.blocks.find((b) => b.blockKey === "LK1")!;
  const lo3 = lk1.units.splice(lk1.units.findIndex((u) => u.unitNumber === "LK1-03"), 1)[0]!;
  ban.blocks.find((b) => b.blockKey === "LK2")!.units.push(lo3);
  assert.deepEqual(checkLotRuleAgainstSubdivision(RULE, ban), [{ unitNumber: "LK1-03", field: "block", expected: "LK2", actual: "LK1" }]);
  const lienMa = checkLotRuleAgainstSubdivision({ ...RULE, template: "{d}{l}" }, khu);
  assert.equal(lienMa.filter((m) => m.field === "unitNumber").length, LO.length);
});
