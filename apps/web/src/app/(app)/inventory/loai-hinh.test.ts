// Bảng hàng theo loại hình (hàng 79, bang-hang-theo-loai-hinh) — E1–E5. Dữ liệu rút từ bộ mẫu hàng 5 (căn hộ) và bộ mẫu thấp
// tầng hàng 73 (dãy LK, SH, BT, DN; căn ngoài khu NK-xx), không chép tay khuôn danh mục. Bảng «loại hình dùng cột nào» ở đây
// viết tay theo ADR-0016 quyết định 2 — không rút từ bảng của lõi đang đo.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { PROPERTY_SUBTYPE_FIELDS, type CatalogData } from "@quy-hang/core";
import type { ListingView } from "@/lib/sync/types";
import { CHUA_RO, COT_MAC_DINH, chuCuaO, giaTriChon, type CotId, type DongBang } from "./cot";
import { capNhatBanGiuNgoaiKhu, docBanGiuNgoaiKhu, type KhoChu } from "./danh-muc";
import { chiMuc, ghepDanhMuc, type CanNgoaiKhuXem } from "./ghep-danh-muc";
import { docGocNhin, khoaGocNhin } from "./goc-nhin";
import { cotAnTheoLoaiHinh, cotHienTheoLoaiHinh, laKhongDung, tieuDeViTri } from "./loai-hinh";
import { locDong } from "./loc";
import { NHOM_MAC_DINH, nhomDong, type DongLuoi } from "./nhom";

const doc = (rel: string) => JSON.parse(readFileSync(fileURLToPath(new URL(rel, import.meta.url)), "utf8"));
const HANG_5 = doc("../../../../../../packages/db/seed/mau/du-lieu-mau.json") as { danhMuc: CatalogData };
type DonViMau = Record<string, unknown> & { unitNumber: string; propertySubType: string };
const THAP_TANG = doc("../../../../../../packages/db/seed/mau-thap-tang/du-lieu-mau-thap-tang.json") as {
  danhMucThapTang: { subdivisions: { subdivisionKey: string; subdivisionName: string; blocks: { blockKey: string; blockName: string; units: DonViMau[] }[] }[] };
  canNgoaiKhu: { ma: string; propertySubType: string; diaChi: { stateOrProvince: string; wardName: string; streetName: string; streetNumber: string } }[];
};

/** Danh mục như `GET /api/v1/catalog` trả từ hàng 79: khu có toà của hàng 5, rồi khu thấp tầng mang `blocks`, `buildings` rỗng. */
const DANH_MUC: CatalogData = {
  subdivisions: [
    ...HANG_5.danhMuc.subdivisions,
    ...THAP_TANG.danhMucThapTang.subdivisions.map((s) => ({ subdivisionKey: s.subdivisionKey, subdivisionName: s.subdivisionName, complexName: null, buildings: [], blocks: s.blocks })),
  ],
} as unknown as CatalogData;
const KHU = THAP_TANG.danhMucThapTang.subdivisions[0]!;
const NGOAI_KHU: CanNgoaiKhuXem[] = THAP_TANG.canNgoaiKhu.map((c) => ({
  id: c.ma,
  propertySubType: c.propertySubType,
  unparsedAddress: `${c.diaChi.streetNumber} ${c.diaChi.streetName}, ${c.diaChi.wardName}, ${c.diaChi.stateOrProvince}`,
}));

/** Bảng viết tay: loại hình → cột loại hình nó dùng (ADR-0016 quyết định 2). */
const DUNG: Record<string, readonly CotId[]> = {
  Condominium: ["unitType", "livingArea", "floor", "directionFaces"],
  Townhouse: ["unitType", "livingArea", "storiesTotal", "frontageLength", "directionFaces", "lotSizeArea", "accessRoadWidth"],
  "Single Family Residence": ["unitType", "livingArea", "storiesTotal", "frontageLength", "directionFaces", "lotSizeArea", "accessRoadWidth"],
  "Unimproved Land": ["lotSizeArea", "frontageLength", "accessRoadWidth"],
};
const COT_LH: readonly CotId[] = ["unitType", "livingArea", "floor", "directionFaces", "lotSizeArea", "storiesTotal", "frontageLength", "accessRoadWidth"];
const TRUONG_NGUON: Partial<Record<CotId, string>> = { livingArea: "livingArea", floor: "floor", directionFaces: "directionFaces", lotSizeArea: "lotSizeArea", storiesTotal: "storiesTotal", frontageLength: "frontageLength", accessRoadWidth: "accessRoadWidth" };

let so = 0;
function hang(p: Partial<ListingView>): ListingView {
  so += 1;
  return {
    id: `h-${so}`,
    buildingName: null,
    subdivisionName: null,
    blockName: null,
    offCompoundUnitId: null,
    unitNumber: null,
    standardStatus: "Active",
    listPrice: 3_000_000_000,
    feeInclusion: "included",
    furnished: null,
    legalStatus: null,
    financing: null,
    occupantType: null,
    closePrice: null,
    closeDate: null,
    withdrawnReason: null,
    lastConfirmedAt: null,
    voided: false,
    version: 1,
    ...p,
  } as ListingView;
}
const dayCua = (sub: string) => KHU.blocks.find((b) => b.units[0]!.propertySubType === sub)!;
const hangLo = (sub: string) => {
  const b = dayCua(sub);
  return { l: hang({ subdivisionName: KHU.subdivisionName, blockName: b.blockName, unitNumber: b.units[0]!.unitNumber }), nguon: b.units[0]! as Record<string, unknown> };
};
const hangNgoaiKhu = (sub: string) => {
  const c = NGOAI_KHU.find((x) => x.propertySubType === sub)!;
  return { l: hang({ offCompoundUnitId: c.id }), nguon: null as Record<string, unknown> | null, can: c };
};
const toaA = HANG_5.danhMuc.subdivisions[0]!.buildings[0]!;
const canA = toaA.units[0]! as unknown as Record<string, unknown> & { unitNumber: string; bedroomsTotal: number | null };
const hangCanHo = () => ({ l: hang({ buildingName: toaA.buildingName, unitNumber: canA.unitNumber }), nguon: canA });

/** Mọi sai lệch của một dòng so nguồn: loại hình, giá trị trường dùng, «không có» của trường không dùng. */
function kiemDong(d: DongBang, sub: string | null, nguon: Record<string, unknown> | null): string[] {
  const loi: string[] = [];
  if ((d.propertySubType ?? null) !== sub) loi.push(`loại hình ${d.propertySubType ? d.propertySubType : CHUA_RO}, mong ${sub ?? CHUA_RO}`);
  if (!sub) return loi;
  for (const c of COT_LH) {
    const dung = DUNG[sub]!.includes(c);
    const v = d[c];
    if (!dung) {
      if (v !== null && v !== undefined && v !== "") loi.push(`trường ${c} không thuộc ${sub}`);
      if (chuCuaO(d, c) !== "") loi.push(`ô ${c} của ${sub} phải trống, đang «${chuCuaO(d, c)}»`);
      continue;
    }
    const k = TRUONG_NGUON[c];
    if (k) {
      const mong = nguon ? (nguon[k] ?? null) : null;
      if ((v ?? null) !== mong) loi.push(`${sub}: ${c} = ${String(v)}, nguồn ${String(mong)}`);
    }
  }
  return loi;
}

// Ma trận viết trước: 3 dạng × loại hình (căn hộ chỉ dạng toà) + 2 ca chưa rõ = 9 ca.
const MA_TRAN: [string, () => { l: ListingView; nguon: Record<string, unknown> | null }, string | null][] = [
  ["toà · Condominium", hangCanHo, "Condominium"],
  ["lô · Townhouse", () => hangLo("Townhouse"), "Townhouse"],
  ["lô · Single Family Residence", () => hangLo("Single Family Residence"), "Single Family Residence"],
  ["lô · Unimproved Land", () => hangLo("Unimproved Land"), "Unimproved Land"],
  ["ngoài khu · Townhouse", () => hangNgoaiKhu("Townhouse"), "Townhouse"],
  ["ngoài khu · Single Family Residence", () => hangNgoaiKhu("Single Family Residence"), "Single Family Residence"],
  ["ngoài khu · Unimproved Land", () => hangNgoaiKhu("Unimproved Land"), "Unimproved Land"],
  ["chưa rõ · lô không có trong danh mục", () => ({ l: hang({ subdivisionName: KHU.subdivisionName, blockName: "Dãy LK1", unitNumber: "LK1-99" }), nguon: null }), null],
  ["chưa rõ · căn ngoài khu không có", () => ({ l: hang({ offCompoundUnitId: "khong-co" }), nguon: null }), null],
];

const IDX = chiMuc(DANH_MUC, NGOAI_KHU);

test("loại hình của dòng: ma trận 9 ca — mỗi ca so loại hình và từng trường của bảng loại hình", () => {
  assert.equal(MA_TRAN.length, 9);
  for (const [ten, tao, sub] of MA_TRAN) {
    const { l, nguon } = tao();
    assert.deepEqual(kiemDong(ghepDanhMuc(l, IDX), sub, nguon), [], ten);
  }
});

test("loại hình của dòng: mất mạng — bản giữ trên máy của căn ngoài khu cho cùng kết quả", () => {
  const m = new Map<string, string>();
  const kho: KhoChu = { getItem: (k) => m.get(k) ?? null, setItem: (k, v) => void m.set(k, v) };
  assert.deepEqual(capNhatBanGiuNgoaiKhu(kho, "san-1", NGOAI_KHU), NGOAI_KHU);
  const giu = capNhatBanGiuNgoaiKhu(kho, "san-1", null);
  assert.deepEqual(giu, NGOAI_KHU, "đọc mạng lỗi phải trả bản giữ");
  assert.equal(docBanGiuNgoaiKhu(kho, "san-2"), null, "sàn khác không có bản giữ");
  const idxGiu = chiMuc(DANH_MUC, giu);
  for (const [ten, tao, sub] of MA_TRAN) {
    const { l, nguon } = tao();
    assert.deepEqual(kiemDong(ghepDanhMuc(l, idxGiu), sub, nguon), [], `bản giữ — ${ten}`);
  }
});

test("loại hình của dòng — chiều đỏ ghim thông điệp", () => {
  const { l, nguon } = hangLo("Unimproved Land");
  const dat = ghepDanhMuc(l, IDX);
  assert.ok(kiemDong({ ...dat, floor: 5 }, "Unimproved Land", nguon).includes("trường floor không thuộc Unimproved Land"));
  const nk = hangNgoaiKhu("Townhouse");
  assert.ok(kiemDong(ghepDanhMuc(nk.l, chiMuc(DANH_MUC, [])), "Townhouse", null).includes("loại hình Chưa rõ, mong Townhouse"));
});

// ——— E2: bộ cột theo loại hình ———

const LOAI = Object.keys(DUNG);
/** Mọi tập con của bốn loại hình, kể cả tập rỗng (2⁴ = 16). */
const tapCon = [...Array(1 << LOAI.length).keys()].map((m) => LOAI.filter((_, i) => m & (1 << i)));
const dongCua = (subs: readonly string[]): DongBang[] => subs.map((s) => ({ id: s, propertySubType: s }) as DongBang);
/** Cột hiện mong đợi, viết tay: cột chung + hợp cột của loại hình có mặt; tập rỗng đọc như căn hộ. */
function mongCot(subs: readonly string[]): CotId[] {
  const coMat = subs.length ? subs : ["Condominium"];
  const an = COT_LH.filter((c) => !coMat.some((s) => DUNG[s]!.includes(c)));
  const coLoai = subs.some((s) => s !== "Condominium");
  return COT_MAC_DINH.filter((c) => !an.includes(c) && (c !== "propertySubType" || coLoai));
}
/** Danh sách cột của nhánh chính trước hàng 79 — ghim viết trước. */
const COT_TRUOC_79: CotId[] = ["buildingName", "unitNumber", "unitType", "livingArea", "floor", "directionFaces", "standardStatus", "listPrice", "feeInclusion", "furnished", "legalStatus", "financing", "occupantType", "confirmedAgeDays", "dau-chu", "completeness", "visibility"];

test("cột theo loại hình: 15 tập con khác rỗng + tập rỗng = 16 ca", () => {
  assert.equal(tapCon.length, 16);
  for (const subs of tapCon) {
    const d = dongCua(subs);
    assert.deepEqual(cotHienTheoLoaiHinh(COT_MAC_DINH, d, d), mongCot(subs), `tập [${subs.join(", ")}]`);
  }
});

test("cột theo loại hình: toàn căn hộ đúng danh sách cột trước hàng 79; toàn đất không cột tầng, hướng, loại căn, diện tích", () => {
  const canHo = dongCua(["Condominium", "Condominium"]);
  assert.deepEqual(cotHienTheoLoaiHinh(COT_MAC_DINH, canHo, canHo), COT_TRUOC_79);
  const dat = dongCua(["Unimproved Land"]);
  const hien = cotHienTheoLoaiHinh(COT_MAC_DINH, dat, dat);
  for (const c of ["floor", "directionFaces", "unitType", "livingArea"] as CotId[]) assert.ok(!hien.includes(c), `cột ${c} hiện cho tập [Unimproved Land]`);
  for (const c of ["lotSizeArea", "frontageLength", "accessRoadWidth", "propertySubType"] as CotId[]) assert.ok(hien.includes(c), c);
});

test("cột theo loại hình: cột người tắt ở menu Cột vẫn tắt", () => {
  const dat = dongCua(["Unimproved Land"]);
  assert.ok(!cotHienTheoLoaiHinh<CotId>(COT_MAC_DINH.filter((c) => c !== "lotSizeArea"), dat, dat).includes("lotSizeArea"));
});

test("cột theo loại hình — chiều đỏ: thêm floor vào trường của Unimproved Land trên bảng thì ca toàn đất đỏ", () => {
  const f = (PROPERTY_SUBTYPE_FIELDS["Unimproved Land"].fields as unknown as string[]);
  f.push("floor");
  try {
    const dat = dongCua(["Unimproved Land"]);
    const hien = cotHienTheoLoaiHinh(COT_MAC_DINH, dat, dat);
    assert.ok(hien.includes("floor"), "cột floor hiện cho tập [Unimproved Land]");
    assert.notDeepEqual(hien, mongCot(["Unimproved Land"]));
  } finally {
    f.pop();
  }
  assert.deepEqual([...cotAnTheoLoaiHinh(dongCua(["Unimproved Land"]))].includes("floor"), true);
});

test("cột vị trí (Hỏi-1): tiêu đề Toà / Vị trí; ô lô «khu · dãy», ô ngoài khu là địa chỉ đã gõ, ô căn hộ là toà", () => {
  const ch = hangCanHo();
  const lo = hangLo("Townhouse");
  const nk = hangNgoaiKhu("Unimproved Land");
  const dCh = ghepDanhMuc(ch.l, IDX);
  const dLo = ghepDanhMuc(lo.l, IDX);
  const dNk = ghepDanhMuc(nk.l, IDX);
  assert.equal(tieuDeViTri([dCh, dCh]), "Toà");
  assert.equal(tieuDeViTri([dCh, dLo]), "Vị trí");
  assert.equal(tieuDeViTri([dNk]), "Vị trí");
  assert.equal(chuCuaO(dCh, "buildingName"), toaA.buildingName);
  assert.equal(chuCuaO(dLo, "buildingName"), `${KHU.subdivisionName} · ${dayCua("Townhouse").blockName}`);
  assert.equal(chuCuaO(dNk, "buildingName"), nk.can.unparsedAddress);
});

// ——— E3: ô không dùng khác ô chưa rõ ———

test("ô không dùng: trống ở chữ ô, chép ra rỗng, lọc số không khớp; ô dùng chưa có số là «—»", () => {
  const dat = ghepDanhMuc(hangLo("Unimproved Land").l, IDX);
  const canHoTang7 = { ...ghepDanhMuc(hangCanHo().l, IDX), id: "ch-7", floor: 7 };
  const canHoChuaTang = { ...canHoTang7, id: "ch-null", floor: null };
  const bang = [dat, canHoTang7, canHoChuaTang];
  assert.equal(laKhongDung(dat, "floor"), true);
  assert.equal(chuCuaO(dat, "floor"), "");
  assert.equal(giaTriChon(dat, "floor"), "");
  assert.equal(chuCuaO(canHoChuaTang, "floor"), "—");
  assert.equal(chuCuaO(canHoTang7, "lotSizeArea"), "");
  const loc = locDong(bang, { floor: "5-15" }).map((d) => d.id);
  assert.ok(!loc.includes(dat.id), "lọc tầng giữ dòng đất");
  assert.deepEqual(loc, ["ch-7"], "đối chứng: căn hộ tầng 7 qua lọc 5-15");
});

// ——— E4: lọc theo loại hình ———

test("lọc theo loại hình: 4 loại + chưa rõ, mỗi giá trị giữ đúng dòng của nó; chữ hiện mặc định", () => {
  const bang = MA_TRAN.map(([, tao]) => ghepDanhMuc(tao().l, IDX));
  const MONG: [string, number, string][] = [
    ["Condominium", 1, "Căn hộ"],
    ["Townhouse", 2, "Nhà phố"],
    ["Single Family Residence", 2, "Biệt thự"],
    ["Unimproved Land", 2, "Đất"],
    [CHUA_RO, 2, CHUA_RO],
  ];
  for (const [gt, n, chu] of MONG) {
    const ra = locDong(bang, { propertySubType: gt });
    assert.equal(ra.length, n, gt);
    for (const d of ra) assert.equal(chuCuaO(d, "propertySubType"), chu, `${gt}: chữ ô`);
  }
});

// ——— E5: nhóm theo loại hình ———

const dem = (cay: DongLuoi[]) => cay.map((n) => (n.kind === "nhom" ? [n.label, n.soCan] : ["?", 0]));

test("nhóm theo loại hình: nhóm và số căn bằng bảng đếm viết trước; mặc định vẫn Toà → Loại căn", () => {
  const bang = MA_TRAN.map(([, tao]) => ghepDanhMuc(tao().l, IDX));
  assert.equal(NHOM_MAC_DINH, "toa-loai");
  assert.deepEqual(dem(nhomDong(bang, "loai-hinh")), [["Biệt thự", 2], ["Căn hộ", 1], ["Đất", 2], ["Nhà phố", 2], [CHUA_RO, 2]]);
  const lhToa = nhomDong(bang, "loai-hinh-toa");
  const dat = lhToa.find((n) => n.kind === "nhom" && n.label === "Đất");
  assert.ok(dat && dat.kind === "nhom" && dat.subRows.length === 2, "Đất → hai nhóm vị trí (lô, ngoài khu)");
  // Cấp Loại căn: dòng đất đọc nhãn loại hình thay «Chưa rõ».
  const toaLoai = nhomDong([ghepDanhMuc(hangLo("Unimproved Land").l, IDX)], "toa-loai");
  const cap2 = toaLoai[0]!.kind === "nhom" ? toaLoai[0]!.subRows[0] : null;
  assert.equal(cap2?.kind === "nhom" ? cap2.label : null, "Đất");
});

test("góc nhìn: nhận cách nhóm loại hình, góc nhìn cũ đọc như cũ, cách nhóm lạ bị bỏ", () => {
  const m = new Map<string, string>();
  const kho: KhoChu = { getItem: (k) => m.get(k) ?? null, setItem: (k, v) => void m.set(k, v) };
  const ban = (id: string, nhom: string) => ({ id, ten: id, luc: "2026-11-08T00:00:00Z", loc: {}, cot: ["buildingName"], sap: [], nhom });
  m.set(khoaGocNhin("a", "s"), JSON.stringify({ v: 1, ds: [ban("moi", "loai-hinh"), ban("cu", "toa-loai"), ban("la", "khong-co")] }));
  const ds = docGocNhin(kho, "a", "s");
  assert.deepEqual(ds.map((g) => [g.id, g.nhom]), [["moi", "loai-hinh"], ["cu", "toa-loai"]]);
});
