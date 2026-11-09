// Bộ cột khi lọc ra rỗng (va-bang-hang-cot-thap-tang-khi-loc-rong: E1–E4b). Dòng dựng qua ghepDanhMuc từ bộ mẫu hàng 5 và 73; mỗi bước
// lọc đi qua đúng hàm màn gọi (tinhBoCot). Mảng cột viết trước, không rút từ hàm đang đo.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import type { CatalogData } from "@quy-hang/core";
import type { ListingView } from "@/lib/sync/types";
import { COT_MAC_DINH, type CotId, type DongBang } from "./cot";
import { chiMuc, ghepDanhMuc } from "./ghep-danh-muc";
import { cotHienTheoLoaiHinh, cotHienTuBoCot, type BoCot } from "./loai-hinh";
import { locDong, tinhBoCot, type BoLocCot } from "./loc";

const doc = (rel: string) => JSON.parse(readFileSync(fileURLToPath(new URL(rel, import.meta.url)), "utf8"));
const HANG_5 = doc("../../../../../../packages/db/seed/mau/du-lieu-mau.json") as { danhMuc: CatalogData };
const THAP_TANG = doc("../../../../../../packages/db/seed/mau-thap-tang/du-lieu-mau-thap-tang.json") as {
  danhMucThapTang: { subdivisions: { subdivisionKey: string; subdivisionName: string; blocks: { blockName: string; units: { unitNumber: string; propertySubType: string }[] }[] }[] };
};
const KHU = THAP_TANG.danhMucThapTang.subdivisions[0]!;
const DANH_MUC = { subdivisions: [...HANG_5.danhMuc.subdivisions, { ...KHU, complexName: null, buildings: [] }] } as unknown as CatalogData;
const IDX = chiMuc(DANH_MUC, []);
const hang = (id: string, p: Partial<ListingView>): ListingView =>
  ({ id, buildingName: null, subdivisionName: null, blockName: null, offCompoundUnitId: null, unitNumber: null, standardStatus: "Active", listPrice: 3_000_000_000, feeInclusion: "included", furnished: null, legalStatus: null, financing: null, occupantType: null, closePrice: null, closeDate: null, withdrawnReason: null, lastConfirmedAt: null, voided: false, version: 1, ...p }) as ListingView;
const lo = (id: string, sub: string) => {
  const b = KHU.blocks.find((x) => x.units[0]!.propertySubType === sub)!;
  return ghepDanhMuc(hang(id, { subdivisionName: KHU.subdivisionName, blockName: b.blockName, unitNumber: b.units[0]!.unitNumber }), IDX);
};
const TOA = HANG_5.danhMuc.subdivisions[0]!.buildings[0]!;
const canHo = (id: string, i: number) => ghepDanhMuc(hang(id, { buildingName: TOA.buildingName, unitNumber: TOA.units[i]!.unitNumber }), IDX);

const DAT = lo("dat", "Unimproved Land");
const NHA_PHO = lo("nha-pho", "Townhouse");
const TRON: DongBang[] = [canHo("ch-1", 0), NHA_PHO, DAT];
const CHI_CAN_HO: DongBang[] = [canHo("ch-1", 0), canHo("ch-2", 1)];

const KHONG_KHOP = ">99999999";
const CHUNG = ["standardStatus", "listPrice", "feeInclusion", "furnished", "legalStatus", "financing", "occupantType", "confirmedAgeDays", "dau-chu", "completeness", "visibility"];
const COT_DAT = ["buildingName", "unitNumber", "propertySubType", "lotSizeArea", "frontageLength", "accessRoadWidth", ...CHUNG];
const COT_TRON = ["buildingName", "unitNumber", "propertySubType", "unitType", "livingArea", "floor", "directionFaces", "lotSizeArea", "storiesTotal", "frontageLength", "accessRoadWidth", ...CHUNG];
const COT_CAN_HO = ["buildingName", "unitNumber", "unitType", "livingArea", "floor", "directionFaces", ...CHUNG];

/** Chạy một dãy bộ lọc như người gõ từng bước: mỗi bước đi qua hàm màn gọi, giữ `giu` sang bước sau. */
function chay(dong: DongBang[], buoc: BoLocCot[]) {
  let giu: BoCot | null = null;
  return buoc.map((loc) => {
    const daLoc = locDong(dong, loc);
    const k: { boCot: BoCot; giu: BoCot | null } = tinhBoCot(giu, dong, daLoc, loc);
    giu = k.giu;
    return { ids: daLoc.map((d) => d.id), cot: cotHienTuBoCot(COT_MAC_DINH as readonly string[], k.boCot, dong), viTri: k.boCot.viTri, boCot: k.boCot };
  });
}
const LOAI_DAT: BoLocCot = { propertySubType: "Unimproved Land" };

// Bảng viết trước: [tên, dữ liệu, các bước, cột đang lọc ở bước cuối].
const CA_RONG: [string, DongBang[], BoLocCot[], CotId][] = [
  ["Đất · Diện tích đất", [DAT, NHA_PHO], [LOAI_DAT, { ...LOAI_DAT, lotSizeArea: KHONG_KHOP }], "lotSizeArea"],
  ["Đất · Mặt tiền", [DAT, NHA_PHO], [LOAI_DAT, { ...LOAI_DAT, frontageLength: KHONG_KHOP }], "frontageLength"],
  ["Đất · Lộ giới", [DAT, NHA_PHO], [LOAI_DAT, { ...LOAI_DAT, accessRoadWidth: KHONG_KHOP }], "accessRoadWidth"],
  ["trộn · Diện tích đất", TRON, [{}, { lotSizeArea: KHONG_KHOP }], "lotSizeArea"],
  ["trộn · Số tầng", TRON, [{}, { storiesTotal: KHONG_KHOP }], "storiesTotal"],
  ["trộn đã co theo Số tầng · thêm Diện tích đất", TRON, [{ storiesTotal: ">=1" }, { storiesTotal: ">=1", lotSizeArea: KHONG_KHOP }], "lotSizeArea"],
];

test("lọc rỗng ở cột thấp tầng: bộ cột còn nguyên", () => {
  let chayDu = 0;
  for (const [ten, dong, buoc, cot] of CA_RONG) {
    const ra = chay(dong, buoc);
    const truoc = ra.at(-2)!;
    const rong = ra.at(-1)!;
    assert.ok(truoc.ids.length > 0, `${ten}: bước trước phải còn dòng`);
    assert.deepEqual(rong.ids, [], `${ten}: bảng phải rỗng`);
    assert.deepEqual(rong.cot, truoc.cot, `${ten}: bộ cột đổi khi bảng rỗng`);
    assert.equal(rong.viTri, truoc.viTri, `${ten}: tiêu đề vị trí`);
    assert.ok(rong.cot.includes(cot), `${ten}: cột đang lọc ${cot} phải còn`);
    chayDu++;
  }
  assert.equal(chayDu, 6);
  // Đối chứng dương: tính thẳng từ dòng rỗng (đường cũ) thì cột đang lọc mất.
  assert.ok(!cotHienTheoLoaiHinh(COT_MAC_DINH as readonly string[], [], TRON).includes("lotSizeArea"), "đường cũ phải mất cột lotSizeArea");
});

test("xoá ô lọc: hàng hiện lại", () => {
  const ra = chay([DAT, NHA_PHO], [LOAI_DAT, { ...LOAI_DAT, lotSizeArea: KHONG_KHOP }, LOAI_DAT]);
  assert.deepEqual(ra[1]!.ids, []);
  assert.deepEqual(ra[2]!.ids, ["dat"]);
  assert.deepEqual(ra[2]!.cot, COT_DAT);
});

test("rỗng vì ô lọc cột chung", () => {
  const ra = chay([DAT, NHA_PHO], [{ ...LOAI_DAT, lotSizeArea: ">0" }, { ...LOAI_DAT, lotSizeArea: ">0", listPrice: ">999999999999" }]);
  assert.deepEqual(ra[0]!.ids, ["dat"], "bước trước phải còn hàng đất");
  assert.deepEqual(ra[1]!.ids, []);
  assert.deepEqual(ra[1]!.cot, COT_DAT);
  assert.equal(ra[1]!.viTri, "Vị trí");
  // Đối chứng dương trên cùng dữ liệu: tính thẳng từ dòng rỗng ra bộ cột căn hộ.
  assert.deepEqual(cotHienTheoLoaiHinh(COT_MAC_DINH as readonly string[], [], [DAT, NHA_PHO]).filter((c) => c !== "propertySubType"), COT_CAN_HO);
});

test("không đổi khi có dòng hay chỉ căn hộ", () => {
  const BANG: [string, DongBang[], BoLocCot[], string[], string][] = [
    ["có dòng đất", [DAT, NHA_PHO], [LOAI_DAT], COT_DAT, "Vị trí"],
    ["có dòng trộn", TRON, [{}], COT_TRON, "Vị trí"],
    ["chỉ căn hộ lọc rỗng", CHI_CAN_HO, [{}, { listPrice: ">999999999999" }], COT_CAN_HO, "Toà"],
  ];
  assert.equal(BANG.length, 3);
  for (const [ten, dong, buoc, cot, viTri] of BANG) {
    const cuoi = chay(dong, buoc).at(-1)!;
    assert.deepEqual(cuoi.cot, cot, ten);
    assert.equal(cuoi.viTri, viTri, ten);
  }
});

test("mở bảng đã rỗng, bật tắt cột lúc rỗng", () => {
  const [mo] = chay([DAT, NHA_PHO], [{ ...LOAI_DAT, lotSizeArea: KHONG_KHOP }]);
  assert.deepEqual(mo!.ids, []);
  assert.deepEqual(mo!.cot, COT_DAT, "lần mở đầu theo các dòng chỉ lọc Loại hình");
  const rong = chay([DAT, NHA_PHO], [LOAI_DAT, { ...LOAI_DAT, lotSizeArea: KHONG_KHOP }]).at(-1)!;
  const tat = cotHienTuBoCot((COT_MAC_DINH as readonly string[]).filter((c) => c !== "lotSizeArea"), rong.boCot, [DAT, NHA_PHO]);
  assert.ok(!tat.includes("lotSizeArea"), "cột vừa tắt phải biến mất");
  assert.ok(tat.includes("frontageLength"));
  const bat = cotHienTuBoCot([...(COT_MAC_DINH as readonly string[]), "closePrice"], rong.boCot, [DAT, NHA_PHO]);
  assert.ok(bat.includes("closePrice"), "cột vừa bật phải hiện");
  assert.equal(rong.viTri, "Vị trí");
});
