// Cột trường riêng ở Bảng hàng (hàng 47): cột, chữ ô, lọc, lệnh sửa ô, góc nhìn đã lưu (E4c); sàn không có trường riêng
// giữ nguyên bảng (E10).
import assert from "node:assert/strict";
import { test } from "node:test";
import type { TruongRieng } from "@quy-hang/core/custom-fields";
import type { TuVung } from "@quy-hang/core/labels";

import { COT, chuCuaO, tatCaCot, type CotId, type DongBang } from "./cot";
import { CACH_XEM_MAC_DINH, docGocNhin, luuMoi, type KhoChu } from "./goc-nhin";
import { locDong, luaChon } from "./loc";
import { foldListing, type ListingEvent } from "@quy-hang/core/listing";
import type { ListingView } from "@/lib/sync/types";

import { ghepDanhMuc } from "./ghep-danh-muc";
import { cotTruongRieng, giuCotRieng, lenhTruongRieng, oRiengCuaHang } from "./truong-rieng";

const BO: TruongRieng[] = [
  { code: "can_goc", target: "listing", contactTypes: [], kind: "bool", label: "Căn góc", options: [], dataClass: "custom_field", archived: false },
  { code: "noi_that_ban_giao", target: "listing", contactTypes: [], kind: "single_select", label: "Nội thất bàn giao", options: [{ code: "co_ban", label: "Cơ bản" }, { code: "day_du", label: "Đầy đủ" }], dataClass: "custom_field", archived: false },
  { code: "da_bo", target: "listing", contactTypes: [], kind: "bool", label: "Đã bỏ", options: [], dataClass: "custom_field", archived: true },
  { code: "nguon_khach", target: "contact", contactTypes: ["Buyer"], kind: "bool", label: "Nguồn khách", options: [], dataClass: "custom_field", archived: false },
];
const TV: TuVung = { truong: {}, giaTri: {}, truongRieng: BO };

const dongMau = (id: string, custom: Record<string, unknown>): DongBang => ({
  id, buildingName: "[Toà A]", unitNumber: `${id}-01`, unitType: "2PN", livingArea: 70, floor: 5, directionFaces: null, standardStatus: "Active",
  listPrice: null, feeInclusion: null, furnished: null, legalStatus: null, financing: null, occupantType: null, confirmedAgeDays: null,
  needsCallBack: false, completeness: null, visibility: "Company", closePrice: null, closeDate: null, withdrawnReason: null,
  ...oRiengCuaHang(custom),
});

test("bảng hàng: cột trường riêng", () => {
  // Cột: đúng hai cột custom sau mọi cột chuẩn.
  const ids = tatCaCot(TV).map((c) => c.id);
  assert.deepEqual(ids.slice(0, COT.length), COT.map((c) => c.id));
  assert.deepEqual(ids.slice(COT.length), ["custom:can_goc", "custom:noi_that_ban_giao"]);
  // Chữ ô — bảng viết trước.
  const BANG: [Record<string, unknown>, CotId, string][] = [
    [{ can_goc: true }, "custom:can_goc", "Có"],
    [{ can_goc: false }, "custom:can_goc", "Không"],
    [{}, "custom:can_goc", "—"],
    [{ noi_that_ban_giao: "co_ban" }, "custom:noi_that_ban_giao", "Cơ bản"],
    [{ noi_that_ban_giao: "khong_con" }, "custom:noi_that_ban_giao", "—"],
  ];
  let dem = 0;
  for (const [cu, cot, mong] of BANG) {
    assert.equal(chuCuaO(dongMau("a", cu), cot, TV), mong, `${JSON.stringify(cu)} ${cot}`);
    dem++;
  }
  assert.equal(dem, BANG.length);
  // Round-trip từ bên viết thật: sự kiện custom_changed → bản gập → dòng của bảng qua đúng hàm ghép.
  const sk = (seq: number, type: ListingEvent["type"], payload: Record<string, unknown>): ListingEvent => ({ seq, type, payload, actorUserId: "u", actorRoles: [], confirmedWithOwner: false, occurredAt: "2026-11-06T00:00:00.000Z" });
  const ban = foldListing([sk(1, "created", { buildingName: "[Toà A]", unitNumber: "A-01" }), sk(2, "custom_changed", { can_goc: true, noi_that_ban_giao: "day_du" })]);
  const dGhep = ghepDanhMuc({ id: "x", ...ban } as unknown as ListingView, new Map());
  assert.deepEqual([chuCuaO(dGhep, "custom:can_goc", TV), chuCuaO(dGhep, "custom:noi_that_ban_giao", TV)], ["Có", "Đầy đủ"], "dòng ghép thiếu giá trị trường riêng");
  // Lọc: lựa chọn từ dữ liệu, lọc «Có» giữ đúng một căn.
  const dong = [dongMau("a", { can_goc: true }), dongMau("b", { can_goc: false }), dongMau("c", {})];
  assert.deepEqual(luaChon(dong, "custom:can_goc", TV), [{ value: "true", label: "Có" }, { value: "false", label: "Không" }]);
  assert.deepEqual(locDong(dong, { "custom:can_goc": "true" }).map((d) => d.id), ["a"]);
  // Lệnh trình sửa ô.
  assert.deepEqual(lenhTruongRieng("can_goc", true), { type: "custom_changed", payload: { can_goc: true } });
  assert.deepEqual(lenhTruongRieng("can_goc", null), { type: "custom_changed", payload: { can_goc: null } });
  // Góc nhìn: trường còn sống giữ; trường đã bỏ bị bỏ; bộ chưa tải (null) giữ nguyên và không dựng cột.
  const cx = { ...CACH_XEM_MAC_DINH, cot: [...CACH_XEM_MAC_DINH.cot, "custom:can_goc", "custom:da_bo"] as CotId[], loc: { "custom:can_goc": "true", "custom:da_bo": "true" } };
  const kho = new Map<string, string>();
  const khoChu: KhoChu = { getItem: (k) => kho.get(k) ?? null, setItem: (k, v) => void kho.set(k, v) };
  luuMoi(khoChu, "u", "s", "Có trường riêng", cx, "g1", "2026-11-06T00:00:00.000Z");
  const docLai = docGocNhin(khoChu, "u", "s")[0]!;
  assert.deepEqual([docLai.cot.slice(-2), docLai.loc], [["custom:can_goc", "custom:da_bo"], cx.loc], "đọc góc nhìn đã lưu phải giữ id custom");
  const giu = giuCotRieng(docLai, BO);
  assert.deepEqual([giu.cot.slice(-1), giu.loc], [["custom:can_goc"], { "custom:can_goc": "true" }]);
  assert.deepEqual(giuCotRieng(docLai, null), docLai, "bộ chưa tải phải giữ nguyên góc nhìn");
  assert.deepEqual(cotTruongRieng(null), [], "bộ chưa tải không dựng cột");
});

test("bảng hàng: sàn không có trường riêng", () => {
  for (const tv of [{ truong: {}, giaTri: {}, truongRieng: [] } as TuVung, { truong: {}, giaTri: {} } as TuVung]) {
    assert.deepEqual(tatCaCot(tv).map((c) => c.id), COT.map((c) => c.id), "sàn không có trường riêng thêm cột");
  }
  const dong = [dongMau("a", {}), dongMau("b", {})];
  assert.equal(Object.keys(dong[0]!).some((k) => k.startsWith("custom:")), false, "dòng mang khoá custom khi căn không có giá trị");
  for (const c of COT) assert.deepEqual(luaChon(dong, c.id, TV), luaChon(dong, c.id, { truong: {}, giaTri: {} }), c.id);
  const kho = new Map<string, string>();
  const khoChu: KhoChu = { getItem: (k) => kho.get(k) ?? null, setItem: (k, v) => void kho.set(k, v) };
  luuMoi(khoChu, "u", "s", "Chuẩn", { ...CACH_XEM_MAC_DINH, loc: { buildingName: "Toà" } }, "g2", "2026-11-06T00:00:00.000Z");
  const g = docGocNhin(khoChu, "u", "s")[0]!;
  assert.deepEqual([g.cot, g.loc], [CACH_XEM_MAC_DINH.cot, { buildingName: "Toà" }]);
});
