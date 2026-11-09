// Bảng hàng theo tên riêng của loại hình (hàng loai-hinh-trong-cach-goi: E4, E7b). Dòng dựng qua ghepDanhMuc từ bộ mẫu thấp
// tầng hàng 73, từ vựng đi đúng đường đọc của màn: dòng đã lưu → boTuVung → bangNhan → tuVungTuBang. Đáp án viết trước.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import type { CatalogData } from "@quy-hang/core";
import { bangNhan, boTuVung, TU_VUNG_RONG, tuVungTuBang, type TuVung } from "@quy-hang/core/labels";
import type { ListingView } from "@/lib/sync/types";
import { CHUA_RO, COT, chuCuaO, nhanCot, type DongBang } from "./cot";
import { chiMuc, ghepDanhMuc, type CanNgoaiKhuXem } from "./ghep-danh-muc";
import { locDong, luaChon, sapDong } from "./loc";
import { nhomDong, type DongLuoi } from "./nhom";

const doc = (rel: string) => JSON.parse(readFileSync(fileURLToPath(new URL(rel, import.meta.url)), "utf8"));
const THAP_TANG = doc("../../../../../../packages/db/seed/mau-thap-tang/du-lieu-mau-thap-tang.json") as {
  danhMucThapTang: { subdivisions: { subdivisionKey: string; subdivisionName: string; blocks: { blockName: string; units: { unitNumber: string; propertySubType: string }[] }[] }[] };
  canNgoaiKhu: { ma: string; propertySubType: string }[];
};
const KHU = THAP_TANG.danhMucThapTang.subdivisions[0]!;
const DANH_MUC = { subdivisions: [{ ...KHU, complexName: null, buildings: [] }] } as unknown as CatalogData;
const NGOAI_KHU: CanNgoaiKhuXem[] = THAP_TANG.canNgoaiKhu.map((c) => ({ id: c.ma, propertySubType: c.propertySubType, unparsedAddress: `[Mẫu] ${c.ma}` }));
const IDX = chiMuc(DANH_MUC, NGOAI_KHU);

const hang = (id: string, p: Partial<ListingView>): ListingView =>
  ({ id, buildingName: null, subdivisionName: null, blockName: null, offCompoundUnitId: null, unitNumber: null, standardStatus: "Active", listPrice: 3_000_000_000, feeInclusion: "included", furnished: null, legalStatus: null, financing: null, occupantType: null, closePrice: null, closeDate: null, withdrawnReason: null, lastConfirmedAt: null, voided: false, version: 1, ...p }) as ListingView;
const lo = (id: string, sub: string) => {
  const b = KHU.blocks.find((x) => x.units[0]!.propertySubType === sub)!;
  return ghepDanhMuc(hang(id, { subdivisionName: KHU.subdivisionName, blockName: b.blockName, unitNumber: b.units[0]!.unitNumber }), IDX);
};
const DONG: DongBang[] = [lo("nha-pho", "Townhouse"), lo("biet-thu", "Single Family Residence"), lo("dat", "Unimproved Land"), ghepDanhMuc(hang("chua-ro", { offCompoundUnitId: "khong-co" }), IDX)];

/** Từ vựng qua đúng đường đọc của màn. */
const tuDong = (dong: { key: string; value: unknown }[]): TuVung => tuVungTuBang(bangNhan(boTuVung(dong).tuVung));
const TV = tuDong([
  { key: "labels.value.propertySubType", value: { Townhouse: "Liền kề", "Unimproved Land": "Lô đất" } },
  { key: "labels.field.propertySubType", value: "Dòng sản phẩm" },
]);
const cot = COT.find((c) => c.id === "propertySubType")!;
const nhan = (cay: DongLuoi[]) => cay.filter((d) => d.kind === "nhom").map((d) => (d as { label: string }).label);

// Bảng viết trước: [mặt, chữ khi có tên riêng, chữ khi không có].
const nhanCuaLuaChon = (tv: TuVung) => luaChon(DONG, "propertySubType", tv).map((o) => o.label).sort();
const MAT: [string, (tv: TuVung) => unknown, unknown, unknown][] = [
  ["ô cột", (tv) => chuCuaO(DONG[0]!, "propertySubType", tv), "Liền kề", "Nhà phố"],
  ["ô cột đất", (tv) => chuCuaO(DONG[2]!, "propertySubType", tv), "Lô đất", "Đất"],
  ["lựa chọn ô lọc có tên", (tv) => nhanCuaLuaChon(tv).includes("Liền kề"), true, false],
  ["lựa chọn ô lọc mặc định", (tv) => nhanCuaLuaChon(tv).includes("Nhà phố"), false, true],
  ["nhóm theo loại hình", (tv) => nhan(nhomDong(DONG, "loai-hinh", tv)).includes("Liền kề"), true, false],
  ["nhóm theo loại hình, mặc định", (tv) => nhan(nhomDong(DONG, "loai-hinh", tv)).includes("Nhà phố"), false, true],
];

test("bảng hàng theo tên riêng loại hình: mỗi mặt đúng chữ riêng, và đúng chữ mặc định khi chưa đặt", () => {
  assert.equal(MAT.length, 6);
  for (const [ten, doc, rieng, macDinh] of MAT) {
    assert.deepEqual(doc(TV), rieng, `${ten} · có tên riêng`);
    assert.deepEqual(doc(TU_VUNG_RONG), macDinh, `${ten} · chưa đặt`);
  }
});

test("bảng hàng theo tên riêng loại hình: cấp Loại căn của đất đọc tên riêng", () => {
  const cac = (tv: TuVung) => {
    const ra: string[] = [];
    const di = (ds: DongLuoi[]) => {
      for (const d of ds) if (d.kind === "nhom") (ra.push(d.label), di(d.subRows as DongLuoi[]));
    };
    di(nhomDong([DONG[2]!], "toa-loai", tv));
    return ra;
  };
  assert.ok(cac(TV).includes("Lô đất"), cac(TV).join(", "));
  assert.ok(cac(TU_VUNG_RONG).includes("Đất"), "đối chứng: chưa đặt thì tên mặc định");
});

test("bảng hàng theo tên riêng loại hình: lọc theo giá trị chuẩn, sắp theo chữ đang hiện, «Chưa rõ» giữ nguyên", () => {
  assert.deepEqual(locDong(DONG, { propertySubType: "Townhouse" }).map((d) => d.id), ["nha-pho"]);
  const id = (tv: TuVung) => sapDong(DONG.slice(0, 3), [{ id: "propertySubType", desc: false }], tv).map((d) => d.id);
  // Chữ đang hiện: Biệt thự < Liền kề < Lô đất; mặc định: Biệt thự < Đất < Nhà phố — hai thứ tự khác nhau.
  assert.deepEqual(id(TV), ["biet-thu", "nha-pho", "dat"]);
  assert.deepEqual(id(TU_VUNG_RONG), ["biet-thu", "dat", "nha-pho"]);
  assert.equal(chuCuaO(DONG[3]!, "propertySubType", TV), CHUA_RO);
});

test("bảng hàng theo tên riêng loại hình: tiêu đề cột theo tên trường riêng", () => {
  assert.equal(nhanCot(cot, TV), "Dòng sản phẩm");
  assert.equal(nhanCot(cot, TU_VUNG_RONG), "Loại hình");
});

test("bảng hàng theo tên riêng loại hình: từ vựng đọc hỏng về tên mặc định", () => {
  const hong = tuDong([{ key: "labels.value.propertySubType", value: { Shophouse: "Shop" } }, { key: "labels.value.propertySubType", value: "khong-phai-doi-tuong" }]);
  assert.equal(chuCuaO(DONG[0]!, "propertySubType", hong), "Nhà phố");
  assert.ok(nhan(nhomDong(DONG, "loai-hinh", hong)).includes("Nhà phố"));
});
