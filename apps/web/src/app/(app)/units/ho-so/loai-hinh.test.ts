// Hồ sơ căn theo loại hình (hàng 79, bang-hang-theo-loai-hinh) — E6. Lô và căn ngoài khu rút từ bộ mẫu thấp tầng hàng 73,
// căn hộ từ bộ mẫu hàng 5. Danh sách nhãn mỗi loại hình viết trước ở đây, không rút từ mã đang đo.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import type { CatalogData } from "@quy-hang/core";
import type { ListingView } from "@/lib/sync/types";
import { chiMuc, ghepDanhMuc, type CanNgoaiKhuXem } from "../../inventory/ghep-danh-muc";
import { docCot, moHang, thuocTinh, thuocTinhKhongToa, timHang } from "./ho-so";

const doc = (rel: string) => JSON.parse(readFileSync(fileURLToPath(new URL(rel, import.meta.url)), "utf8"));
const HANG_5 = doc("../../../../../../../packages/db/seed/mau/du-lieu-mau.json") as { danhMuc: CatalogData };
const THAP_TANG = doc("../../../../../../../packages/db/seed/mau-thap-tang/du-lieu-mau-thap-tang.json") as {
  danhMucThapTang: { subdivisions: { subdivisionKey: string; subdivisionName: string; blocks: { blockName: string; units: { unitNumber: string; propertySubType: string }[] }[] }[] };
  canNgoaiKhu: { ma: string; propertySubType: string }[];
};
const DANH_MUC = {
  subdivisions: [
    ...HANG_5.danhMuc.subdivisions,
    ...THAP_TANG.danhMucThapTang.subdivisions.map((s) => ({ ...s, complexName: null, buildings: [] })),
  ],
} as unknown as CatalogData;
const KHU = THAP_TANG.danhMucThapTang.subdivisions[0]!;
const NGOAI_KHU: CanNgoaiKhuXem[] = THAP_TANG.canNgoaiKhu.map((c) => ({ id: c.ma, propertySubType: c.propertySubType, unparsedAddress: `[Mẫu] ${c.ma}` }));
const IDX = chiMuc(DANH_MUC, NGOAI_KHU);

/** Nhãn mục thuộc tính viết trước theo loại hình (ADR-0016 quyết định 2). */
const NHAN: Record<string, string[]> = {
  "Unimproved Land": ["Loại hình", "Diện tích đất", "Mặt tiền", "Lộ giới"],
  Townhouse: ["Loại hình", "Diện tích đất", "Diện tích sàn", "Số tầng", "Mặt tiền", "Lộ giới", "Phòng ngủ", "Hướng"],
  "Single Family Residence": ["Loại hình", "Diện tích đất", "Diện tích sàn", "Số tầng", "Mặt tiền", "Lộ giới", "Phòng ngủ", "Hướng"],
};
const NHAN_CAN_HO = ["Loại căn", "Diện tích", "Tầng", "Hướng", "Toà", "Khu", "Loại hình"];

let so = 0;
const hang = (p: Partial<ListingView>): ListingView =>
  ({ id: `h-${++so}`, buildingName: null, subdivisionName: null, blockName: null, offCompoundUnitId: null, unitNumber: null, standardStatus: "Active", version: 1, ...p }) as ListingView;
const hangLo = (sub: string) => {
  const b = KHU.blocks.find((x) => x.units[0]!.propertySubType === sub)!;
  return hang({ subdivisionName: KHU.subdivisionName, blockName: b.blockName, unitNumber: b.units[0]!.unitNumber });
};
const hangNk = (sub: string) => hang({ offCompoundUnitId: NGOAI_KHU.find((c) => c.propertySubType === sub)!.id });

/** Lỗi mở hồ sơ: hàng không toà mà đường mở theo toà + mã. */
function kiemMo(h: ListingView, theoHang: boolean | undefined): string[] {
  const d = ghepDanhMuc(h, IDX);
  const q = new URLSearchParams(moHang(new URLSearchParams(), { id: d.id, buildingName: d.buildingName, unitNumber: d.unitNumber, theoHang }));
  const c = docCot(q);
  return c && "hang" in c && c.hang === h.id ? [] : ["hồ sơ hàng lô phải mở theo hàng"];
}

const LOAI = ["Townhouse", "Single Family Residence", "Unimproved Land"];

test("hồ sơ theo loại hình: hàng lô và hàng ngoài khu mỗi loại hình mở theo hàng, tìm ra «không toà»", () => {
  for (const sub of LOAI) {
    for (const [dang, h] of [["lô", hangLo(sub)], ["ngoài khu", hangNk(sub)]] as const) {
      assert.deepEqual(kiemMo(h, ghepDanhMuc(h, IDX).theoHang), [], `${dang} · ${sub}`);
      assert.equal(timHang([h], h.id).kind, "khong-toa", `${dang} · ${sub}`);
    }
  }
});

test("hồ sơ theo loại hình: mục thuộc tính ra đúng nhãn viết trước cho mỗi loại hình, đất không có Tầng, Trục, Toà", () => {
  for (const sub of LOAI) {
    for (const [dang, h] of [["lô", hangLo(sub)], ["ngoài khu", hangNk(sub)]] as const) {
      const tt = thuocTinhKhongToa(IDX, h);
      assert.equal(tt.kind, "co", `${dang} · ${sub}`);
      if (tt.kind !== "co") continue;
      assert.deepEqual(tt.truong.map(([k]) => k), NHAN[sub], `${dang} · ${sub}`);
      if (sub === "Unimproved Land") for (const k of ["Tầng", "Trục", "Toà"]) assert.ok(!tt.truong.some(([n]) => n === k), `đất có ${k}`);
    }
  }
  // Lô có số của danh mục dãy; căn ngoài khu chưa có chỗ lưu trường thấp tầng nên «—».
  const lo = thuocTinhKhongToa(IDX, hangLo("Unimproved Land"));
  assert.ok(lo.kind === "co" && lo.truong.some(([k, v]) => k === "Diện tích đất" && v.endsWith("m²")));
  const nk = thuocTinhKhongToa(IDX, hangNk("Unimproved Land"));
  assert.ok(nk.kind === "co" && nk.truong.find(([k]) => k === "Diện tích đất")?.[1] === "—");
});

test("hồ sơ theo loại hình: căn hộ giữ đúng bảy nhãn hôm nay", () => {
  const toa = HANG_5.danhMuc.subdivisions[0]!.buildings[0]!;
  const tt = thuocTinh(DANH_MUC, toa.buildingName, toa.units[0]!.unitNumber);
  assert.ok(tt.kind === "co");
  if (tt.kind === "co") assert.deepEqual(tt.truong.map(([k]) => k), NHAN_CAN_HO);
  const ch = hang({ buildingName: toa.buildingName, unitNumber: toa.units[0]!.unitNumber });
  assert.equal(ghepDanhMuc(ch, IDX).theoHang, undefined, "căn hộ giữ đường mở theo toà + mã");
});

test("hồ sơ theo loại hình — chiều đỏ: hàng lô có mã mà mở theo toà thì ca báo", () => {
  assert.deepEqual(kiemMo(hangLo("Townhouse"), false), ["hồ sơ hàng lô phải mở theo hàng"]);
});
