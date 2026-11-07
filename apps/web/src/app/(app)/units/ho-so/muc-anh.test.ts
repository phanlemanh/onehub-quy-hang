// Mức đủ có ảnh trên màn (anh-khong-chan-ban E5): hồ sơ căn, cột «Mức đủ» của Bảng hàng, dòng mức đủ của màn cuộc gọi.
import assert from "node:assert/strict";
import { test } from "node:test";
import { COMPLETENESS_ITEMS, completeness, DANH_SACH_HOI, foldListing, type ListingEvent } from "@quy-hang/core/listing";
import type { ListingView } from "@/lib/sync/types";
import { chuCuaO } from "../../inventory/cot";
import { ghepDanhMuc } from "../../inventory/ghep-danh-muc";
import { dongMucDu } from "../call/muc-du";
import { NHAN_PHAN, phanLanRao } from "./ho-so";

const e = (seq: number, type: ListingEvent["type"], payload: Record<string, unknown>): ListingEvent => ({
  seq, type, payload, actorUserId: "u", actorRoles: ["listing_agent"], confirmedWithOwner: type !== "created", occurredAt: "2026-11-01T00:00:00.000Z",
});
const st = foldListing([
  e(1, "created", { buildingName: "Toà A", unitNumber: "A-01.01" }),
  e(2, "price_changed", { listPrice: 3_000_000_000, feeInclusion: "included" }),
  e(3, "details_changed", { furnished: "full", legalStatus: "pink_book", financing: "cash", occupantType: "vacant" }),
]);
const view = (photosCount?: number): ListingView => {
  const v = { id: "h1", ...st, ...(photosCount !== undefined && { photosCount }) } as ListingView;
  return { ...v, completeness: completeness(v, photosCount === undefined ? undefined : { photosCount }) };
};

test("mức đủ có ảnh trên hồ sơ, Bảng hàng, màn cuộc gọi", () => {
  const ho = phanLanRao(view(0)).mucDu;
  assert.deepEqual([ho.co, ho.tren], [5, 6], "hồ sơ: 5/6");
  assert.deepEqual(ho.thieu.map((k) => NHAN_PHAN[k]), ["Ảnh thật"], "hồ sơ: thiếu đúng Ảnh thật");
  const dong = ghepDanhMuc(view(0), new Map() as never);
  assert.equal(chuCuaO(dong, "completeness"), "5/6 · thiếu ảnh thật", "Bảng hàng: 5/6 và dấu thiếu ảnh");
  assert.equal(chuCuaO(ghepDanhMuc(view(2), new Map() as never), "completeness"), "6/6", "Bảng hàng: đủ ảnh");
  const goi = dongMucDu(view(0));
  assert.equal(goi.chu, "Mức đủ 5/6");
  assert.match(goi.conThieu, /ảnh thật/, "màn cuộc gọi nêu ảnh thật");
  assert.deepEqual(DANH_SACH_HOI.map((h) => h.ma), [...COMPLETENESS_ITEMS], "danh sách hỏi vẫn năm mục");
  // Bản trên máy đời trước (không số ảnh) giữ năm mục.
  assert.deepEqual([phanLanRao(view()).mucDu.tren, chuCuaO(ghepDanhMuc(view(), new Map() as never), "completeness")], [5, "5/5"]);
});
