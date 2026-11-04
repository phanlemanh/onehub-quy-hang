// E1 (hàng 43, AC-1): tập căn của Xuất bảng hàng, nút theo vai × khổ, trang /exports/new chuyển về bảng hàng. Ma trận viết
// trước; chiều đỏ trên cùng fixture: bản sao bỏ điều kiện «đã tích».
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { navigationFor, ROLES } from "@quy-hang/core";
import type { DongBang } from "../cot";
import { locDong, sapDong, type BoLocCot } from "../loc";
import { LOI_KHONG_CO_CAN, tapCanXuat, type TapCan } from "./tap-can";

const DAY = dirname(fileURLToPath(import.meta.url));

function dong(id: string, toa: string, giaTy: number): DongBang {
  return {
    id,
    buildingName: toa,
    unitNumber: `${toa}-${id}`,
    unitType: "2PN",
    livingArea: 70,
    floor: 5,
    directionFaces: null,
    standardStatus: "Active",
    listPrice: giaTy * 1_000_000_000,
    feeInclusion: null,
    furnished: null,
    legalStatus: null,
    financing: null,
    occupantType: null,
    confirmedAgeDays: 1,
    needsCallBack: false,
    completeness: 3,
    visibility: "Company",
    closePrice: null,
    closeDate: null,
    withdrawnReason: null,
  };
}

// Năm căn toà [Mẫu] A, hai căn toà [Mẫu] B; góc nhìn sắp giá giảm dần.
const MOI: DongBang[] = [
  dong("a1", "[Mẫu] A", 3),
  dong("a2", "[Mẫu] A", 5),
  dong("a3", "[Mẫu] A", 4),
  dong("a4", "[Mẫu] A", 2),
  dong("a5", "[Mẫu] A", 6),
  dong("b1", "[Mẫu] B", 9),
  dong("b2", "[Mẫu] B", 8),
];
const SAP = [{ id: "listPrice", desc: true }];
const hien = (loc: BoLocCot) => sapDong(locDong(MOI, loc), SAP);
const LOC_A: BoLocCot = { buildingName: "[Mẫu] A" };
const ids = (t: TapCan<DongBang>) => t.dong.map((d) => d.id);

type Ham = typeof tapCanXuat;

/** Ô k = 2 trong 5: lỗi (chuỗi) hay null. */
function oK2(ham: Ham): string | null {
  const t = ham(hien(LOC_A), new Set(["a1", "a3"]));
  const ra = t.dong.map((d) => d.id);
  return JSON.stringify(ra) === JSON.stringify(["a3", "a1"]) ? null : `lấy cả căn không tích: ${ra.join(",")}`;
}

test("E1 ô 1 — tích 2 trong 5 căn đang hiện → đúng 2 căn, theo thứ tự góc nhìn (giá giảm dần)", () => {
  assert.equal(oK2(tapCanXuat), null);
});

test("E1 ô 2 — không tích căn nào → cả 5 căn đang hiện, theo thứ tự góc nhìn", () => {
  assert.deepEqual(ids(tapCanXuat(hien(LOC_A), new Set())), ["a5", "a2", "a3", "a1", "a4"]);
});

test("E1 ô 3 — không căn nào hiện → tắt kèm lời «Không có căn nào để xuất»", () => {
  assert.deepEqual(tapCanXuat(hien({ buildingName: "[Mẫu] Không có" }), new Set(["a1"])), { tat: true, dong: [], loi: LOI_KHONG_CO_CAN });
  assert.equal(LOI_KHONG_CO_CAN, "Không có căn nào để xuất");
});

test("E1 ô 4 — căn đã tích mà bộ lọc nay ẩn thì không vào tập", () => {
  assert.deepEqual(ids(tapCanXuat(hien(LOC_A), new Set(["a2", "b1"]))), ["a2"]);
});

test("E1 chiều đỏ — bản sao bỏ điều kiện «đã tích» → ô k = 2 đỏ nêu «lấy cả căn không tích»", () => {
  const boTich: Ham = (dongHien) => (dongHien.length ? { tat: false, dong: [...dongHien], loi: null } : tapCanXuat(dongHien, new Set()));
  assert.match(oK2(boTich) ?? "", /lấy cả căn không tích/);
});

test("E1 năm vai × hai khổ — chỉ đầu chủ, trưởng nhóm trên máy tính có nút", () => {
  const bang: Record<string, { mayTinh: boolean; dienThoai: boolean }> = {
    telesales: { mayTinh: false, dienThoai: false },
    listing_agent: { mayTinh: true, dienThoai: false },
    buyer_agent: { mayTinh: false, dienThoai: false },
    team_lead: { mayTinh: true, dienThoai: false },
    company_admin: { mayTinh: false, dienThoai: false },
  };
  for (const vai of ROLES) {
    const nav = navigationFor([vai]);
    assert.deepEqual({ mayTinh: nav.actions.includes("export"), dienThoai: nav.mobileActions.includes("export") }, bang[vai], vai);
  }
  // Nút trên thanh bảng hàng đọc đúng bảng ấy và chỉ hiện từ md trở lên.
  const nguon = readFileSync(join(DAY, "..", "bang-hang.tsx"), "utf8");
  assert.match(nguon, /navigationFor\(vai\)\.actions\.includes\("export"\)/);
  assert.match(nguon, /coXuat \? \(\s*<div className="hidden [^"]*md:flex">/);
});

test("E1 trang /exports/new chuyển về /inventory?phat-hang=1 và không nhập Placeholder", () => {
  const nguon = readFileSync(join(DAY, "..", "..", "..", "exports", "new", "page.tsx"), "utf8");
  assert.match(nguon, /redirect\("\/inventory\?phat-hang=1"\)/);
  assert.match(nguon, /from "next\/navigation"/);
  assert.doesNotMatch(nguon, /Placeholder/);
});
