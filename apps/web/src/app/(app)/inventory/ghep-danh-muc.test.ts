// Ghép hàng với danh mục (hàng 14) — E2. Danh mục đọc thẳng từ gói mẫu của hàng 5, đường suy từ vị trí tệp này.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import type { CatalogData } from "@quy-hang/core";
import type { ListingView } from "@/lib/sync/types";
import { chiMuc, ghepDanhMuc, thuocTinhCan } from "./ghep-danh-muc";

const goi = JSON.parse(readFileSync(fileURLToPath(new URL("../../../../../../packages/db/seed/mau/du-lieu-mau.json", import.meta.url)), "utf8")) as {
  danhMuc: CatalogData;
};
const dm = goi.danhMuc;
const toaA = dm.projects[0]!.buildings.find((b) => b.buildingName === "Toà A")!;
const can1PN = toaA.units.find((u) => u.bedroomsTotal === 1)!;

/** Bản sao danh mục: thêm một studio ở Toà A, và Toà B có một căn trùng mã với căn 1PN của Toà A nhưng khác thuộc tính. */
const STUDIO = { upi: "urn:mau:studio", unitNumber: "A-99.01", stack: "01", floor: 99, livingArea: 30, bedroomsTotal: 0, directionFaces: "Bắc" };
const TRUNG = { ...can1PN, upi: "urn:mau:trung", floor: 42, livingArea: 120, bedroomsTotal: 3, directionFaces: "Tây" };
const ban = structuredClone(dm) as unknown as { projects: { buildings: { buildingName: string; units: unknown[] }[] }[] };
ban.projects[0]!.buildings.find((b) => b.buildingName === "Toà A")!.units.push(STUDIO);
ban.projects[0]!.buildings.find((b) => b.buildingName === "Toà B")!.units.push(TRUNG);
const idx = chiMuc(ban as unknown as CatalogData);

// Ma trận viết trước: bốn ca × bốn trường.
const MA_TRAN: [string, string, string | null, [string, number | null, number | null, string | null]][] = [
  ["căn 1PN", "Toà A", can1PN.unitNumber, ["1PN", can1PN.livingArea, can1PN.floor, can1PN.directionFaces]],
  ["studio", "Toà A", "A-99.01", ["Studio", 30, 99, "Bắc"]],
  ["ngoài danh mục", "Toà A", "Z-00.00", ["Chưa rõ", null, null, null]],
  ["không mã căn", "Toà A", null, ["Chưa rõ", null, null, null]],
];

for (const [ten, toa, ma, [loai, dt, tang, huong]] of MA_TRAN) {
  test(`ghép danh mục: ${ten}`, () => {
    const t = thuocTinhCan(idx, toa, ma);
    assert.equal(t.unitType, loai, "loại căn");
    assert.equal(t.livingArea, dt, "diện tích");
    assert.equal(t.floor, tang, "tầng");
    assert.equal(t.directionFaces, huong, "hướng");
  });
}

test("ghép danh mục: danh mục chưa tải (null) ra «Chưa rõ»", () => {
  assert.deepEqual(thuocTinhCan(chiMuc(null), "Toà A", can1PN.unitNumber), { unitType: "Chưa rõ", livingArea: null, floor: null, directionFaces: null });
});

test("ghép danh mục: cùng mã ở hai toà lấy đúng căn của toà của hàng", () => {
  assert.equal(thuocTinhCan(idx, "Toà A", can1PN.unitNumber).unitType, "1PN", "Toà A phải là căn 1PN của Toà A");
  assert.equal(thuocTinhCan(idx, "Toà B", can1PN.unitNumber).unitType, "3PN", "Toà B phải là căn trùng mã của Toà B");
});

test("đối chứng đỏ: chỉ mục bỏ điều kiện toà thì ca trùng mã lẫn", () => {
  // Chỉ mục giả chỉ khoá theo mã căn — căn sau ghi đè căn trước; ca hai toà phải lộ ra sai.
  const sai = new Map([...idx].map(([k, u]) => [k.split("\u0000")[1]!, u]));
  const docSai = (ma: string) => sai.get(ma.toLowerCase())?.bedroomsTotal;
  assert.notEqual(docSai(can1PN.unitNumber), 1, "chỉ mục chỉ theo mã căn đã làm Toà A mất căn 1PN của chính nó");
});

test("ghép danh mục: hàng của kho trên máy thành dòng bảng đủ trường", () => {
  const l = {
    id: "h1",
    buildingName: "Toà A",
    unitNumber: can1PN.unitNumber,
    standardStatus: "Active",
    listPrice: 3_090_000_000,
    feeInclusion: "included",
    furnished: null,
    legalStatus: "[Mẫu] Sổ hồng",
    financing: null,
    occupantType: "[Mẫu] Để trống",
    closePrice: null,
    closeDate: null,
    withdrawnReason: null,
    lastConfirmedAt: null,
    version: 4,
    freshness: { confirmed: true, lastConfirmedAt: "2026-10-01T00:00:00Z", ageDays: 30, needsCallBack: true },
    completeness: { filled: 3, total: 5, missing: [] },
    visibility: "Company",
  } as ListingView;
  const d = ghepDanhMuc(l, idx);
  assert.equal(d.unitType, "1PN");
  assert.equal(d.confirmedAgeDays, 30);
  assert.equal(d.needsCallBack, true);
  assert.equal(d.completeness, 3);
  assert.equal(d.visibility, "Company");
});
