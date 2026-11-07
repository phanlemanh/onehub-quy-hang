// Hôm nay đầu chủ (hàng 22): lý do bằng chữ (AC-7, E2 web) và loại hình qua ghép danh mục thật của Bảng hàng (AC-2).
// Dữ liệu mẫu, không người thật; bayGio cố định 2026-11-01 10:00 giờ Việt Nam.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import type { CatalogData } from "@quy-hang/core";
import { foldListing, type ListingEvent } from "@quy-hang/core/listing";
import { BO_NHOM_MAC_DINH, chiaNhom, type BoNhom, type DuKienCan, type Nhom } from "@quy-hang/core/today";
import type { ListingView } from "@/lib/sync/types";
import { chiMuc } from "../inventory/ghep-danh-muc";
import { canHomNay, chuGiaPhi, chuHan, chuLoiLead, lyDo } from "./ly-do";

const BAY_GIO = "2026-11-01T03:00:00.000Z";
const TOI = "u-dau-chu-1";
const nhom = (code: string) => BO_NHOM_MAC_DINH.find((n) => n.code === code)!;
const lui = (ngay: number) => new Date(Date.parse(BAY_GIO) - ngay * 86_400_000).toISOString();

const CAN: DuKienCan = {
  standardStatus: "Active",
  listAgentKey: TOI,
  lastConfirmedAt: null,
  priceChangeTimestamp: null,
  lastPriceChange: null,
  lastStatusChange: null,
  missing: [],
  propertySubType: "Condominium",
};

test("lý do: chữ mới đổi", () => {
  const can: DuKienCan = {
    ...CAN,
    lastPriceChange: { from: 3_100_000_000, to: 2_950_000_000, byRoles: ["team_lead"], byUserId: "u-truong-nhom", at: lui(1) },
  };
  assert.equal(lyDo(nhom("recent_change"), can, TOI, BAY_GIO), "3,10 → 2,95 tỷ — Trưởng nhóm, hôm qua");
  // Đổi trạng thái hôm nay bởi người khác, mới hơn lần đổi giá → nói lần đổi trạng thái.
  const nac: DuKienCan = { ...can, lastStatusChange: { from: "Active", to: "Pending", byRoles: ["team_lead"], byUserId: "u-truong-nhom", at: lui(0) } };
  assert.equal(lyDo(nhom("recent_change"), nac, TOI, BAY_GIO), "Đang bán → Đang giao dịch — Trưởng nhóm, hôm nay");
  // Lần đổi trạng thái là của mình → vẫn nói lần đổi giá của người khác.
  const minh: DuKienCan = { ...can, lastStatusChange: { from: "Active", to: "Hold", byRoles: ["listing_agent"], byUserId: TOI, at: lui(0) } };
  assert.equal(lyDo(nhom("recent_change"), minh, TOI, BAY_GIO), "3,10 → 2,95 tỷ — Trưởng nhóm, hôm qua");
});

test("lý do: chữ theo điều kiện của nhóm", () => {
  const MA_TRAN: [string, Nhom, DuKienCan, string][] = [
    ["chưa xác nhận 16 ngày", nhom("call_back"), { ...CAN, lastConfirmedAt: lui(16) }, "Chưa xác nhận 16 ngày"],
    ["chưa từng xác nhận", nhom("call_back"), CAN, "Chưa từng xác nhận"],
    ["giá giữ 12 ngày", nhom("price_adjustment"), { ...CAN, priceChangeTimestamp: lui(12), lastConfirmedAt: lui(20) }, "Giá giữ 12 ngày"],
    ["thiếu hai mục", nhom("missing_info"), { ...CAN, missing: ["legalStatus", "financing"] }, "Thiếu: pháp lý, tài chính"],
  ];
  assert.equal(MA_TRAN.length, 4);
  for (const [ten, n, c, mong] of MA_TRAN) assert.equal(lyDo(n, c, TOI, BAY_GIO), mong, ten);
});

test("lý do: giá kèm phí, hạn lead, lỗi 409", () => {
  assert.equal(chuGiaPhi(3_250_000_000, "included"), "3,25 tỷ · Bao phí");
  assert.equal(chuGiaPhi(950_000_000, "excluded"), "950 triệu · Không bao phí");
  assert.equal(chuGiaPhi(null, null), "Chưa có giá");
  const han = new Date(Date.parse(BAY_GIO) + 8 * 60_000).toISOString();
  const qua = new Date(Date.parse(BAY_GIO) - 5 * 60_000).toISOString();
  assert.deepEqual(chuHan({ stage: "sent", acceptDueAt: han, callDueAt: han }, BAY_GIO), { chu: "Hạn nhận còn 8 phút", qua: false });
  assert.deepEqual(chuHan({ stage: "accepted", acceptDueAt: qua, callDueAt: qua }, BAY_GIO), { chu: "Quá hạn gọi 5 phút", qua: true });
  assert.equal(chuLoiLead("already-on-board"), "Lead đã lên bảng, không trả lại được.");
});

// ——— Loại hình qua ghép danh mục thật của Bảng hàng ———

const goi = JSON.parse(readFileSync(fileURLToPath(new URL("../../../../../../packages/db/seed/mau/du-lieu-mau.json", import.meta.url)), "utf8")) as {
  danhMuc: CatalogData;
};

function view(id: string, toa: string, ma: string): ListingView {
  const e = (seq: number, type: ListingEvent["type"], payload: Record<string, unknown>): ListingEvent => ({
    seq,
    type,
    payload,
    actorUserId: TOI,
    actorRoles: ["listing_agent"],
    confirmedWithOwner: type !== "created",
    occurredAt: lui(8),
  });
  const ev = [
    e(1, "created", { buildingName: toa, unitNumber: ma }),
    e(2, "price_changed", { listPrice: 5_000_000_000, feeInclusion: "included" }),
    e(3, "details_changed", { legalStatus: "pink_book", occupantType: "vacant", furnished: "full", financing: "none" }),
  ];
  return { id, ...foldListing(ev), listAgentKey: TOI, priceChangeTimestamp: lui(8), lastStatusChange: null, lastPriceChange: null };
}

test("loại hình qua ghép danh mục", () => {
  const dm = structuredClone(goi.danhMuc) as unknown as { subdivisions: { buildings: { buildingName: string; units: Record<string, unknown>[] }[] }[] };
  const toa = dm.subdivisions[0]!.buildings[0]!;
  const condo = toa.units[0]!;
  assert.equal(condo.propertySubType, "Condominium");
  toa.units.push({ ...condo, upi: "urn:mau:nha-pho", unitNumber: "NP-01", propertySubType: "Townhouse", bedroomsTotal: 4 });
  const idx = chiMuc(dm as unknown as CatalogData);

  const nhaPho = canHomNay(view("np", toa.buildingName, "NP-01"), idx);
  const canHo = canHomNay(view("ch", toa.buildingName, String(condo.unitNumber)), idx);
  const ngoai = canHomNay(view("ng", toa.buildingName, "Z-99.99"), idx);
  assert.equal(nhaPho.propertySubType, "Townhouse");
  assert.equal(canHo.propertySubType, "Condominium");
  assert.equal(ngoai.propertySubType, null);

  const NHA_PHO: Nhom = {
    code: "townhouse_stale",
    label: "Nhà phố lâu chưa gọi",
    subject: "listing",
    enabled: true,
    conditions: [{ kind: "property_sub_type_in", in: ["Townhouse"] }],
    actions: ["owner_confirmed", "open_record"],
  };
  const bo: BoNhom = [NHA_PHO, ...BO_NHOM_MAC_DINH.filter((n) => n.subject === "lead")];
  const chia = chiaNhom(bo, [nhaPho, canHo, ngoai], TOI, BAY_GIO);
  assert.deepEqual(
    chia.map((g) => [g.nhom.code, g.cans.map((c) => c.id)]),
    [["townhouse_stale", ["np"]]],
    "nhóm nhà phố nhận đúng căn Townhouse; căn hộ và căn ngoài danh mục không",
  );
});

test("Bổ sung ảnh cho căn mình giữ (anh-khong-chan-ban E6b)", () => {
  const idx = chiMuc(goi.danhMuc as unknown as CatalogData);
  const dm = goi.danhMuc as unknown as { subdivisions: { buildings: { buildingName: string; units: { unitNumber: string }[] }[] }[] };
  const toa = dm.subdivisions[0]!.buildings[0]!;
  const ma = String(toa.units[0]!.unitNumber);
  const goc = view("x", toa.buildingName, ma);
  // Căn vừa xác nhận, vừa đổi giá, đủ năm mục — không khớp nhóm đứng trước.
  const tuoi: ListingView = { ...goc, lastConfirmedAt: BAY_GIO, priceChangeTimestamp: BAY_GIO, furnished: "full", legalStatus: "pink_book", financing: "cash", occupantType: "vacant", listAgentKey: TOI };
  const nhomCua = (l: ListingView) => chiaNhom(BO_NHOM_MAC_DINH, [canHomNay(l, idx)], TOI, BAY_GIO).filter((x) => x.cans.length > 0).map((x) => x.nhom.code);
  assert.deepEqual(nhomCua({ ...tuoi, photosCount: 0 }), ["add_photos"], "căn mình giữ, Đang bán, 0 ảnh");
  assert.deepEqual(nhomCua({ ...tuoi, photosCount: 1 }), [], "có ảnh");
  assert.deepEqual(nhomCua({ ...tuoi, photosCount: 0, listAgentKey: "u-khac" }), [], "căn đầu chủ khác giữ");
  assert.deepEqual(nhomCua({ ...tuoi, photosCount: 0, standardStatus: "Closed" }), [], "đã bán");
  assert.ok(!nhomCua({ ...tuoi, photosCount: 0 }).includes("missing_info"), "đủ năm mục thì không vào Thiếu thông tin");
});
