// Link «Các lần rao» trong hồ sơ hàng không toà (va-ho-so-lan-rao-hang-lo-ngoai-khu, Ngoài-5 hàng 79) — E1, E2. Đường đóng dựng
// bằng chính dongCot của màn; link đọc lại bằng docCot của màn.
import assert from "node:assert/strict";
import { test } from "node:test";
import type { ListingView } from "@/lib/sync/types";
import { docCot, dongCot, moCot, type ChonCan } from "./ho-so";
import { moHinhHoSo, type VaoHoSo } from "./mo-hinh";

const hang = (p: Partial<ListingView>): ListingView =>
  ({ id: "h-1", buildingName: null, subdivisionName: null, blockName: null, offCompoundUnitId: null, unitNumber: null, standardStatus: "Active", listPrice: null, feeInclusion: null, furnished: null, legalStatus: null, financing: null, occupantType: null, closePrice: null, closeDate: null, withdrawnReason: null, lastConfirmedAt: null, voided: false, version: 1, ...p }) as ListingView;
const LO = hang({ id: "lo-1", subdivisionName: "[Mẫu] Khu", blockName: "Dãy LK1", unitNumber: "LK1-01" });
const NGOAI_KHU = hang({ id: "nk-1", offCompoundUnitId: "can-1" });
const duong = (c: ChonCan) => `/inventory?${moCot(new URLSearchParams("x=1"), { ma: c.ma, toa: c.toa ?? "", lan: c.lan ?? "" })}`;
const vao = (ds: ListingView[], chon: ChonCan, them: Partial<VaoHoSo>): VaoHoSo => ({
  nguoi: "n-1",
  vai: ["listing_agent"],
  ds,
  ngan: { listings: [], history: {}, queue: [], lastAttempt: null, lastPullAt: null },
  danhMuc: null,
  chon,
  daKeo: {},
  thieuCua: null,
  ngoaiTuyen: false,
  duong,
  ...them,
});
/** Đường đóng thật của màn: `dongCot` trên địa chỉ đang mở. */
const dongTu = (qs: string) => {
  const q = dongCot(new URLSearchParams(qs));
  return `/inventory${q ? `?${q}` : ""}`;
};
function kiemLink(href: string, id: string, giu: string | null): string[] {
  const q = new URLSearchParams(href.split("?")[1] ?? "");
  const c = docCot(q);
  const loi: string[] = [];
  if (!c || !("hang" in c) || c.hang !== id || q.has("unit") || q.has("toa")) loi.push("link lần rao của hàng không toà phải mở theo hàng");
  if (giu && !q.has(giu)) loi.push(`link làm mất tham số ${giu}`);
  return loi;
}
// Bảng viết trước: 2 dạng × 2 đường đóng.
const MA_TRAN: [string, ListingView, string, string | null][] = [
  ["lô · không tham số", LO, "hang=lo-1", null],
  ["lô · có tham số", LO, "hang=lo-1&x=1", "x"],
  ["ngoài khu · không tham số", NGOAI_KHU, "hang=nk-1", null],
  ["ngoài khu · có tham số", NGOAI_KHU, "hang=nk-1&x=1", "x"],
];
const linkCua = (h: ListingView, qs: string) => {
  const m = moHinhHoSo(vao([h], { ma: h.unitNumber ?? "", toa: null, lan: h.id }, { khongToa: h, dongHref: dongTu(qs) }));
  assert.equal(m.kind, "co");
  return m.kind === "co" ? m.lan.map((r) => r.href) : [];
};

test("link lần rao của hàng không toà: 2 dạng × 2 đường đóng = 4 ca", () => {
  assert.equal(MA_TRAN.length, 4);
  for (const [ten, h, qs, giu] of MA_TRAN) {
    const ds = linkCua(h, qs);
    assert.equal(ds.length, 1, ten);
    assert.deepEqual(kiemLink(ds[0]!, h.id, giu), [], ten);
  }
});

test("link lần rao — chiều đỏ: link theo toà + mã thì ca báo", () => {
  assert.deepEqual(kiemLink(duong({ ma: "LK1-01", toa: "[Mẫu] Khu · Dãy LK1", lan: "lo-1" }), "lo-1", null), ["link lần rao của hàng không toà phải mở theo hàng"]);
});

test("đối chứng: căn hộ hai lần rao giữ link theo căn", () => {
  const a = hang({ id: "c-1", buildingName: "Toà A", unitNumber: "A-01.01" });
  const b = hang({ id: "c-2", buildingName: "Toà A", unitNumber: "A-01.01", standardStatus: "Closed" });
  const m = moHinhHoSo(vao([a, b], { ma: "A-01.01", toa: "Toà A", lan: "c-1" }, { dongHref: "/inventory" }));
  assert.equal(m.kind, "co");
  if (m.kind !== "co") return;
  assert.equal(m.lan.length, 2);
  for (const r of m.lan) assert.equal(r.href, duong({ ma: "A-01.01", toa: "Toà A", lan: r.id }));
});
