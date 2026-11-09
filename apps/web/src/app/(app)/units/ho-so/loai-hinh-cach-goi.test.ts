// Hồ sơ căn theo tên riêng của loại hình (hàng loai-hinh-trong-cach-goi: E5, E6, E7b). Căn hộ, lô, ngoài khu rút từ bộ mẫu hàng
// 5 và 73, đi qua moHinhHoSo và chiMuc thật. Đáp án viết trước.
import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import type { CatalogData } from "@quy-hang/core";
import { boTuVung, TU_VUNG_RONG, type TuVung } from "@quy-hang/core/labels";
import type { ListingView } from "@/lib/sync/types";
import type { CanNgoaiKhuXem } from "../../inventory/ghep-danh-muc";
import { moHinhHoSo, type HoSoCo, type VaoHoSo } from "./mo-hinh";

const DAY = dirname(fileURLToPath(import.meta.url));
const docJ = (rel: string) => JSON.parse(readFileSync(join(DAY, rel), "utf8"));
const HANG_5 = docJ("../../../../../../../packages/db/seed/mau/du-lieu-mau.json") as { danhMuc: CatalogData };
const THAP_TANG = docJ("../../../../../../../packages/db/seed/mau-thap-tang/du-lieu-mau-thap-tang.json") as {
  danhMucThapTang: { subdivisions: { subdivisionKey: string; subdivisionName: string; blocks: { blockName: string; units: { unitNumber: string; propertySubType: string }[] }[] }[] };
  canNgoaiKhu: { ma: string; propertySubType: string }[];
};
const KHU = THAP_TANG.danhMucThapTang.subdivisions[0]!;
const DANH_MUC = { subdivisions: [...HANG_5.danhMuc.subdivisions, { ...KHU, complexName: null, buildings: [] }] } as unknown as CatalogData;
const NGOAI_KHU: CanNgoaiKhuXem[] = THAP_TANG.canNgoaiKhu.map((c) => ({ id: c.ma, propertySubType: c.propertySubType, unparsedAddress: `[Mẫu] ${c.ma}` }));
const TOA = HANG_5.danhMuc.subdivisions[0]!.buildings[0]!;
const CAN = TOA.units[0]!;

const hang = (id: string, p: Partial<ListingView>): ListingView =>
  ({ id, buildingName: null, subdivisionName: null, blockName: null, offCompoundUnitId: null, unitNumber: null, standardStatus: "Active", listPrice: null, feeInclusion: null, furnished: null, legalStatus: null, financing: null, occupantType: null, closePrice: null, closeDate: null, withdrawnReason: null, lastConfirmedAt: null, voided: false, version: 1, ...p }) as ListingView;

const vao = (ds: ListingView[], them: Partial<VaoHoSo>): VaoHoSo => ({
  nguoi: "n-1",
  vai: ["listing_agent"],
  ds,
  ngan: { listings: [], history: {}, lastAttempt: null, lastPullAt: null },
  danhMuc: DANH_MUC,
  ngoaiKhu: NGOAI_KHU,
  chon: { ma: "", toa: null, lan: null },
  daKeo: {},
  thieuCua: null,
  ngoaiTuyen: false,
  duong: (c) => `/units/${c.ma}`,
  ...them,
});

const canHo = hang("ch-1", { buildingName: TOA.buildingName, unitNumber: CAN.unitNumber });
const lo = (() => {
  const b = KHU.blocks.find((x) => x.units[0]!.propertySubType === "Townhouse")!;
  return hang("lo-1", { subdivisionName: KHU.subdivisionName, blockName: b.blockName, unitNumber: b.units[0]!.unitNumber });
})();
const nk = hang("nk-1", { offCompoundUnitId: NGOAI_KHU.find((c) => c.propertySubType === "Unimproved Land")!.id });

type Ca = [string, () => VaoHoSo, string, string];
const CA: Ca[] = [
  ["căn hộ", () => vao([canHo], { chon: { ma: canHo.unitNumber!, toa: canHo.buildingName, lan: null } }), "Căn cao tầng", "Căn hộ"],
  ["hàng lô", () => vao([lo], { chon: { ma: lo.unitNumber!, toa: null, lan: lo.id }, khongToa: lo }), "Liền kề", "Nhà phố"],
  ["ngoài khu", () => vao([nk], { chon: { ma: "", toa: null, lan: nk.id }, khongToa: nk }), "Lô đất", "Đất"],
];
const TV: TuVung = boTuVung([
  { key: "labels.value.propertySubType", value: { Condominium: "Căn cao tầng", Townhouse: "Liền kề", "Unimproved Land": "Lô đất" } },
  { key: "labels.field.propertySubType", value: "Dòng sản phẩm" },
]).tuVung;
const co = (v: VaoHoSo) => {
  const m = moHinhHoSo(v);
  assert.equal(m.kind, "co");
  return m as HoSoCo;
};
const dongLH = (m: HoSoCo, tieuDe: string) => {
  assert.equal(m.tt?.kind, "co");
  return m.tt?.kind === "co" ? m.tt.truong.find(([k]) => k === tieuDe)?.[1] : undefined;
};

test("hồ sơ theo tên riêng loại hình: ba dạng hiện tên riêng, tiêu đề theo tên trường riêng", () => {
  assert.equal(CA.length, 3);
  for (const [ten, v, rieng, macDinh] of CA) {
    const r = co({ ...v(), tv: TV });
    assert.equal(dongLH(r, "Dòng sản phẩm"), rieng, ten);
    assert.ok(r.dauCot.includes(rieng), `${ten}: đầu cột «${r.dauCot}»`);
    const d = co({ ...v(), tv: TU_VUNG_RONG });
    assert.equal(dongLH(d, "Loại hình"), macDinh, `${ten} · chưa đặt`);
    assert.ok(d.dauCot.includes(macDinh), `${ten} · chưa đặt: đầu cột «${d.dauCot}»`);
  }
});

test("hồ sơ theo tên riêng loại hình: từ vựng đọc hỏng về tên mặc định, không ném lỗi", () => {
  const hong = boTuVung([{ key: "labels.value.propertySubType", value: { Shophouse: "Shop" } }]).tuVung;
  for (const [ten, v, , macDinh] of CA) assert.equal(dongLH(co({ ...v(), tv: hong }), "Loại hình"), macDinh, ten);
});

test("hồ sơ theo tên riêng loại hình: căn danh mục không mang loại hình hiện «—», đầu cột không chứa «—»", () => {
  const khongLoai = structuredClone(DANH_MUC) as unknown as { subdivisions: { buildings: { units: Record<string, unknown>[] }[] }[] };
  delete khongLoai.subdivisions[0]!.buildings[0]!.units[0]!.propertySubType;
  const m = co({ ...CA[0]![1](), danhMuc: khongLoai as unknown as CatalogData, tv: TV });
  assert.equal(dongLH(m, "Dòng sản phẩm"), "—");
  assert.ok(!m.dauCot.includes("—"), m.dauCot);
});

// ---- E6: mọi chỗ mở hồ sơ nằm trong từ vựng ----
const APP = join(DAY, "../..");
const WEB_SRC = join(APP, "../..");
const doc = (rel: string) => readFileSync(join(APP, rel), "utf8");

/** Trang có phần tử `the` nằm giữa cặp TuVungProvider nhận giá trị đọc từ docTuVung; trả lỗi nêu tên trang. */
function kiemBoc(ten: string, nguon: string, the: string): string[] {
  const loi: string[] = [];
  if (!nguon.includes("docTuVung(")) loi.push(`${ten}: không đọc từ vựng`);
  const cuc = nguon.split(`<${the}`).slice(1);
  if (cuc.length === 0) loi.push(`${ten}: không có <${the}`);
  let i = -1;
  for (let k = 0; k < cuc.length; k++) {
    i = nguon.indexOf(`<${the}`, i + 1);
    const truoc = nguon.slice(0, i);
    if (truoc.lastIndexOf("<TuVungProvider") <= truoc.lastIndexOf("</TuVungProvider>")) loi.push(`${ten}: <${the} nằm ngoài TuVungProvider`);
  }
  return loi;
}
const TRANG: [string, string][] = [
  ["units/[code]/page.tsx", "HoSoToanMan"],
  ["today/page.tsx", "HomNayDauChu"],
  ["inventory/page.tsx", "BangCoHoSo"],
  ["inventory/views/[id]/page.tsx", "BangHang"],
];

test("hồ sơ: bốn đường dựng đều nằm trong từ vựng", () => {
  assert.equal(TRANG.length, 4);
  for (const [t, the] of TRANG) assert.deepEqual(kiemBoc(t, doc(t), the), [], t);
  // Chiều đỏ: bản sao nguồn bỏ thẻ bọc.
  const hong = doc("units/[code]/page.tsx").replace(/<\/?TuVungProvider[^>]*>/g, "");
  assert.deepEqual(kiemBoc("units/[code]/page.tsx", hong, "HoSoToanMan"), ["units/[code]/page.tsx: <HoSoToanMan nằm ngoài TuVungProvider"]);
  // Cột hồ sơ truyền từ vựng của ngữ cảnh vào mô hình.
  const cot = doc("units/ho-so/cot-ho-so.tsx");
  assert.ok(/const tv = useTuVung\(\)/.test(cot) && /moHinhHoSo\(\{[^}]*\btv\b/.test(cot), "cột hồ sơ phải truyền từ vựng vào mô hình");
});

test("hồ sơ: đúng bốn lời gọi cột hồ sơ, thêm chỗ thứ năm thì đỏ", () => {
  const VIET_TRUOC: Record<string, number> = {
    "app/(app)/today/hom-nay-dau-chu.tsx": 1,
    "app/(app)/units/ho-so/bang-co-ho-so.tsx": 2,
    "app/(app)/units/ho-so/ho-so-toan-man.tsx": 1,
  };
  const dem: Record<string, number> = {};
  const di = (d: string) => {
    for (const ten of readdirSync(d)) {
      const p = join(d, ten);
      if (statSync(p).isDirectory()) di(p);
      else if (p.endsWith(".tsx")) {
        const n = readFileSync(p, "utf8").split("<CotHoSo ").length - 1;
        if (n) dem[relative(WEB_SRC, p)] = n;
      }
    }
  };
  di(WEB_SRC);
  assert.deepEqual(dem, VIET_TRUOC);
  assert.notDeepEqual({ ...dem, "app/moi.tsx": 1 }, VIET_TRUOC, "chiều đỏ: chỗ thứ năm khác bảng");
});
