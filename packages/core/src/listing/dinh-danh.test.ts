// Ba cách gọi căn của sự kiện tạo hàng (hàng can-ngoai-khu — E1, E2). Bảng viết tay; hàm kiểm thuần trả danh sách lỗi;
// phá thử chạy CÙNG hàm với khuôn hay bước gấp lỗi, ghim thông điệp.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { DAY_CU } from "./day-cu.fixture";
import { LY_DO_CAN_DANG, LY_DO_MOT_DANG, SOURCE_KEYS, validatePayload, type ListingEvent, type PayloadError } from "./events";
import { foldListing, type ListingState } from "./fold";

const MA = "3f2b6c1e-9a4d-4e7b-8c21-5d0e9f8a7b6c";
const TOA = { buildingName: "[Toà A]", unitNumber: "A-12.05" };
const LO = { subdivisionName: "[Khu mẫu]", blockName: "LK1", unitNumber: "02" };
const NGOAI = { offCompoundUnitId: MA };
const NGUON = "thông tin chủ nhà không vào hàng";

type Dong = [string, Record<string, unknown>, PayloadError[]];
const GIA_TRI_NGUON: Record<string, unknown> = { ownerName: "[Tên]", ownerPhone: "0900 000 001", floorPrice: 1, titleDeedPhoto: "x" };

/** Bảng viết tay: 3 đủ + 5 thiếu + 3 trộn + 3 khoá lạ + 12 khoá nguồn = 26 dòng. */
const BANG: Dong[] = [
  ["có toà đủ", TOA, []],
  ["lô đủ", LO, []],
  ["ngoài khu đủ", NGOAI, []],
  ["có toà thiếu buildingName", { unitNumber: "A-12.05" }, [{ path: "payload", reason: LY_DO_CAN_DANG }]],
  ["lô thiếu subdivisionName", { blockName: "LK1", unitNumber: "02" }, [{ path: "subdivisionName", reason: "thiếu" }]],
  ["lô thiếu blockName", { subdivisionName: "[Khu mẫu]", unitNumber: "02" }, [{ path: "blockName", reason: "thiếu" }]],
  ["lô thiếu unitNumber", { subdivisionName: "[Khu mẫu]", blockName: "LK1" }, [{ path: "unitNumber", reason: "thiếu" }]],
  ["ngoài khu thiếu offCompoundUnitId", {}, [{ path: "payload", reason: LY_DO_CAN_DANG }]],
  ["trộn toà + lô", { ...TOA, subdivisionName: "[Khu mẫu]", blockName: "LK1" }, [{ path: "payload", reason: LY_DO_MOT_DANG }]],
  ["trộn toà + ngoài khu", { buildingName: "[Toà A]", ...NGOAI }, [{ path: "payload", reason: LY_DO_MOT_DANG }]],
  ["trộn lô + ngoài khu", { ...LO, ...NGOAI }, [{ path: "payload", reason: LY_DO_MOT_DANG }]],
  ["có toà khoá lạ", { ...TOA, toaDo: "x" }, [{ path: "toaDo", reason: "khoá lạ" }]],
  ["lô khoá lạ", { ...LO, toaDo: "x" }, [{ path: "toaDo", reason: "khoá lạ" }]],
  ["ngoài khu khoá lạ", { ...NGOAI, toaDo: "x" }, [{ path: "toaDo", reason: "khoá lạ" }]],
  ...(["có toà", "lô", "ngoài khu"] as const).flatMap((ten, i) =>
    SOURCE_KEYS.map((k): Dong => [`${ten} + ${k}`, { ...[TOA, LO, NGOAI][i]!, [k]: GIA_TRI_NGUON[k] }, [{ path: k, reason: NGUON }]]),
  ),
];

function kiemKhuon(kiem: (p: unknown) => PayloadError[]): string[] {
  const loi: string[] = [];
  for (const [ten, p, cho] of BANG) {
    const ra = kiem(p);
    if (JSON.stringify(ra) !== JSON.stringify(cho)) loi.push(`${ten}: ra ${JSON.stringify(ra)}, chờ ${JSON.stringify(cho)}`);
  }
  return loi;
}

test("AC-1 khuôn created ba dạng", () => {
  console.log(`AC-1: ${BANG.length} dòng bảng`);
  assert.equal(BANG.length, 26);
  assert.deepEqual(kiemKhuon((p) => validatePayload("created", p)), []);
});

test("AC-1 phá thử khuôn lỗi", () => {
  // Khuôn cũ: buildingName bắt buộc, khoá lô và ngoài khu là khoá lạ.
  const cu = (p: unknown) => {
    const o = p as Record<string, unknown>;
    const out: PayloadError[] = Object.keys(o)
      .filter((k) => !["buildingName", "unitNumber"].includes(k))
      .map((k) => ({ path: k, reason: (SOURCE_KEYS as readonly string[]).includes(k) ? NGUON : "khoá lạ" }));
    if (!("buildingName" in o)) out.push({ path: "buildingName", reason: "thiếu" });
    return out;
  };
  const loiCu = kiemKhuon(cu);
  assert.ok(loiCu.some((l) => l.startsWith("lô đủ:")));
  assert.ok(loiCu.some((l) => l.startsWith("ngoài khu đủ:")));
  // Khuôn bỏ chặn trộn: lọc lỗi «một dạng» ra.
  const boTron = (p: unknown) => validatePayload("created", p).filter((e) => e.reason !== LY_DO_MOT_DANG);
  assert.ok(kiemKhuon(boTron)[0]!.startsWith("trộn toà + lô:"));
});

// AC-2: dãy cũ gấp ra đúng ảnh ghim trước vòng; dãy lô và dãy ngoài khu gấp ra đúng khoá viết tay.
const ANH = JSON.parse(readFileSync(new URL("./anh-gap-cu.json", import.meta.url), "utf8")) as Record<string, Record<string, unknown>>;
const su = (seq: number, type: ListingEvent["type"], payload: Record<string, unknown>): ListingEvent => ({
  seq,
  type,
  payload,
  actorUserId: "u",
  actorRoles: [],
  confirmedWithOwner: false,
  occurredAt: "2026-11-07T00:00:00.000Z",
});
const KHOA_MOI = ["subdivisionName", "blockName", "offCompoundUnitId"] as const;

function kiemGap(gap: (ds: ListingEvent[]) => ListingState): string[] {
  const loi: string[] = [];
  if (Object.keys(DAY_CU).length < 6) loi.push("ít hơn sáu dãy cũ");
  for (const [ten, ds] of Object.entries(DAY_CU)) {
    const s = gap(ds) as Record<string, unknown>;
    for (const [k, v] of Object.entries(ANH[ten]!)) if (JSON.stringify(s[k]) !== JSON.stringify(v)) loi.push(`dãy cũ ${ten}: ${k} lệch`);
    for (const k of KHOA_MOI) if (s[k] !== null) loi.push(`dãy cũ ${ten}: ${k} lệch`);
  }
  const lo = gap([su(1, "created", LO)]);
  const CHO_LO = { buildingName: null, subdivisionName: "[Khu mẫu]", blockName: "LK1", unitNumber: "02", offCompoundUnitId: null };
  for (const [k, v] of Object.entries(CHO_LO)) if ((lo as Record<string, unknown>)[k] !== v) loi.push(`dãy lô: ${k} lệch`);
  const ng = gap([su(1, "created", NGOAI), su(2, "price_changed", { listPrice: 5_000_000_000, feeInclusion: "included" })]);
  const CHO_NGOAI = { buildingName: null, subdivisionName: null, blockName: null, unitNumber: null, offCompoundUnitId: MA, listPrice: 5_000_000_000 };
  for (const [k, v] of Object.entries(CHO_NGOAI)) if ((ng as Record<string, unknown>)[k] !== v) loi.push(`dãy ngoài khu: ${k} lệch`);
  return loi;
}

test("AC-2 gấp lại sự kiện cũ và ba dạng", () => {
  console.log(`AC-2: ${Object.keys(DAY_CU).length} dãy cũ`);
  assert.deepEqual(kiemGap(foldListing), []);
  // Phá thử: bước gấp đặt khu bằng toà cho dãy cũ.
  const sai = (ds: ListingEvent[]) => {
    const s = foldListing(ds);
    return s.buildingName ? { ...s, subdivisionName: s.buildingName } : s;
  };
  assert.ok(kiemGap(sai).includes("dãy cũ chỉ tạo, chưa mã: subdivisionName lệch"));
});
