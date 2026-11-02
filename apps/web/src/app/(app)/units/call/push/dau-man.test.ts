// Chế độ và đầu màn của chế độ ép giá (hàng 29, E1). Ma trận viết trước, đếm bằng assert số.
import assert from "node:assert/strict";
import { test } from "node:test";
import type { ListingEvent } from "@quy-hang/core/listing";
import type { ListingView } from "@/lib/sync/types";
import { dauMan, docCheDo, mocGia, timHoSo, type DauMan } from "./dau-man";

const BAY_GIO = new Date("2026-11-02T10:00:00.000Z");
const truoc = (ngay: number) => new Date(BAY_GIO.getTime() - ngay * 86_400_000 - 3_600_000).toISOString();
const MA = "0b6f1c2e-3d4a-4e5f-8a9b-0c1d2e3f4a5b";

const su = (seq: number, type: ListingEvent["type"], payload: Record<string, unknown>, ngay: number): ListingEvent => ({
  seq, type, payload, actorUserId: "u", actorRoles: ["listing_agent"], confirmedWithOwner: type !== "created" && type !== "details_changed", occurredAt: truoc(ngay),
});
const CAN = {
  id: "h1", buildingName: "Toà A", unitNumber: "A-15.08", standardStatus: "Active", listPrice: 2_800_000_000, feeInclusion: "excluded",
  furnished: null, legalStatus: null, financing: null, occupantType: null, closePrice: null, closeDate: null, withdrawnReason: null, lastConfirmedAt: null, version: 5,
} as unknown as ListingView;
const LICH_SU = [
  su(1, "created", { buildingName: "Toà A", unitNumber: "A-15.08" }, 45),
  su(2, "price_changed", { listPrice: 2_900_000_000, feeInclusion: "excluded" }, 44),
  su(3, "status_changed", { to: "Active" }, 38),
  su(4, "price_changed", { listPrice: 2_800_000_000, feeInclusion: "excluded" }, 23),
];

type DauManFn = typeof dauMan;
const MA_TRAN: [string, (f: DauManFn) => boolean][] = [
  [
    "38 ngày",
    (f) => {
      const d: DauMan = f(CAN, LICH_SU, BAY_GIO);
      return d.tieuDe === "A-15.08 · Toà A" && d.nac === "Đang bán" && d.gia === "2,8 tỷ · không bao phí" && d.phu === "Lên bảng 38 ngày · đổi giá gần nhất 23 ngày trước";
    },
  ],
  ["chưa đổi giá", (f) => f(CAN, LICH_SU.slice(0, 3), BAY_GIO).phu === "Lên bảng 38 ngày · chưa đổi giá lần nào"],
  ["không có trên máy", () => timHoSo([CAN], "khong-co") === null && timHoSo([CAN], "h1") === CAN],
  [
    "chế độ theo tham số",
    () =>
      JSON.stringify([docCheDo({ lead: MA }), docCheDo({ hang: MA }), docCheDo({}), docCheDo({ hang: "abc" })]) ===
      JSON.stringify([{ kind: "khai-thac", leadId: MA }, { kind: "ep-gia", hangId: MA }, { kind: "vang" }, { kind: "vang" }]),
  ],
];
const caSai = (f: DauManFn) => MA_TRAN.filter(([, k]) => !k(f)).map(([t]) => t);

test("ép giá: đầu màn", () => {
  assert.equal(MA_TRAN.length, 4);
  assert.deepEqual(caSai(dauMan), []);
  assert.deepEqual(mocGia(LICH_SU), { lenBang: truoc(38), doiGia: truoc(23) });
});

test("ép giá: đối chứng đỏ — tính từ lần tạo thay vì lên Đang bán bị gọi tên", () => {
  const tuLanTao: DauManFn = (can, ls, bg) => dauMan(can, ls ? ls.map((e) => (e.type === "status_changed" ? { ...e, occurredAt: ls[0]!.occurredAt } : e)) : ls, bg);
  assert.ok(caSai(tuLanTao).includes("38 ngày"));
});
