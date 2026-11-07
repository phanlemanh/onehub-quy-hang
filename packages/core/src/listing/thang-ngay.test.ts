// Luật thắng ngay (hàng doi-nhan-so-phien-ban — E1, E2). Kết quả chờ là bảng viết tay; hàm kiểm thuần trả danh sách lỗi;
// phá thử chạy CÙNG hàm với luật lỗi và ghim thông điệp.
import assert from "node:assert/strict";
import { test } from "node:test";
import type { ListingEvent } from "./events";
import { STANDARD_STATUSES, type StandardStatus } from "./status";
import { suKienThangNgay, thangNgay, trangThaiGoc } from "./thang-ngay";

type Goc = StandardStatus | null;
type Luat = (to: unknown, goc: Goc, hienTai: StandardStatus) => boolean;
const GOC: readonly Goc[] = [...STANDARD_STATUSES, null];

/**
 * Bảng viết tay: với đích Pending và Closed, mỗi bản hiện tại → tập bản gốc ra true. Đích khác ra false hết. Dòng hiện tại =
 * đích liệt [] (lệnh tới khi căn đã ở đích không thắng ngay).
 */
const BANG: Partial<Record<StandardStatus, Record<StandardStatus, readonly Goc[]>>> = {
  Pending: {
    Incomplete: ["Incomplete", "Active", "Closed", "Hold", "Withdrawn", null],
    Active: ["Incomplete", "Active", "Closed", "Hold", "Withdrawn", null],
    Pending: [],
    Closed: ["Incomplete", "Active", "Closed", "Hold", "Withdrawn", null],
    Hold: ["Incomplete", "Active", "Closed", "Hold", "Withdrawn", null],
    Withdrawn: ["Incomplete", "Active", "Closed", "Hold", "Withdrawn", null],
  },
  Closed: {
    Incomplete: ["Incomplete", "Active", "Pending", "Hold", "Withdrawn", null],
    Active: ["Incomplete", "Active", "Pending", "Hold", "Withdrawn", null],
    Pending: ["Incomplete", "Active", "Pending", "Hold", "Withdrawn", null],
    Closed: [],
    Hold: ["Incomplete", "Active", "Pending", "Hold", "Withdrawn", null],
    Withdrawn: ["Incomplete", "Active", "Pending", "Hold", "Withdrawn", null],
  },
};
const cho = (to: StandardStatus, goc: Goc, ht: StandardStatus) => BANG[to]?.[ht].includes(goc) ?? false;

/** Chín ca có tên, viết tay: [tên, đích, gốc, hiện tại, chờ]. */
const CA: [string, StandardStatus, Goc, StandardStatus, boolean][] = [
  ["ca Ngoài-5", "Pending", "Pending", "Pending", false],
  ["ca đổi nhãn Đã bán", "Closed", "Closed", "Closed", false],
  ["ca Ngoài-7", "Pending", "Pending", "Active", false],
  ["ca cùng đưa vào", "Pending", "Active", "Pending", false],
  ["ca gốc không biết, đã ở đích", "Pending", null, "Pending", false],
  ["ca đưa vào Đang giao dịch", "Pending", "Active", "Active", true],
  ["ca đưa vào Đã bán", "Closed", "Active", "Active", true],
  ["ca gốc không biết, đưa vào Đã bán", "Closed", null, "Active", true],
  ["ca đích thường", "Active", "Hold", "Hold", false],
];
const ten = (to: StandardStatus, goc: Goc, ht: StandardStatus) => `(${to},${goc},${ht})`;

function kiemThangNgay(luat: Luat): { loi: string[]; soBo: number } {
  const loi: string[] = [];
  let soBo = 0;
  let thang = 0;
  for (const to of STANDARD_STATUSES)
    for (const goc of GOC)
      for (const ht of STANDARD_STATUSES) {
        soBo++;
        const ra = luat(to, goc, ht);
        if (ra) thang++;
        if (ra !== cho(to, goc, ht)) loi.push(`${ten(to, goc, ht)} ra ${ra}, chờ ${cho(to, goc, ht)}`);
      }
  if (thang !== 60) loi.push(`số bộ thắng ngay ${thang}, chờ 60`);
  for (const [t, to, goc, ht, mong] of CA) {
    const ra = luat(to, goc, ht);
    if (ra !== mong) loi.push(`${t}: ${ten(to, goc, ht)} ra ${ra}, chờ ${mong}`);
  }
  return { loi, soBo };
}

test("AC-1 ma trận thắng ngay", () => {
  let soTrue = 0;
  for (const to of STANDARD_STATUSES) for (const goc of GOC) for (const ht of STANDARD_STATUSES) if (cho(to, goc, ht)) soTrue++;
  assert.equal(soTrue, 60, "bảng viết tay phải có đúng 60 bộ true");
  const { loi, soBo } = kiemThangNgay(thangNgay);
  console.log(`AC-1: so ${soBo} bộ, ${CA.length} ca có tên`);
  assert.equal(soBo, 252);
  assert.equal(CA.length, 9);
  assert.deepEqual(loi, []);
});

test("AC-1 phá thử bốn luật lỗi", () => {
  const W = ["Pending", "Closed"];
  const boGoc: Luat = (to, _g, ht) => W.includes(to as string) && ht !== to;
  const cu: Luat = (to) => W.includes(to as string);
  const daoKhongBiet: Luat = (to, g, ht) => W.includes(to as string) && g !== null && g !== to && ht !== to;
  const boHienTai: Luat = (to, g) => W.includes(to as string) && g !== to;
  assert.ok(kiemThangNgay(boGoc).loi.includes("ca Ngoài-7: (Pending,Pending,Active) ra true, chờ false"));
  assert.ok(kiemThangNgay(boGoc).loi.some((l) => /^số bộ thắng ngay \d+, chờ 60$/.test(l)));
  assert.ok(kiemThangNgay(cu).loi.includes("ca Ngoài-5: (Pending,Pending,Pending) ra true, chờ false"));
  assert.ok(kiemThangNgay(daoKhongBiet).loi.includes("(Closed,null,Active) ra false, chờ true"));
  assert.ok(kiemThangNgay(boHienTai).loi.includes("ca cùng đưa vào: (Pending,Active,Pending) ra true, chờ false"));
});

// Dãy thật của một căn: mỗi sự kiện theo khuôn của lõi, trạng thái do foldListing tính (không tự đặt).
const su = (seq: number, type: ListingEvent["type"], payload: Record<string, unknown>): ListingEvent => ({
  seq,
  type,
  payload,
  actorUserId: "u",
  actorRoles: [],
  confirmedWithOwner: false,
  occurredAt: `2026-11-07T00:00:0${seq}Z`,
});
const DAY: ListingEvent[] = [
  su(1, "created", { buildingName: "Toà A", unitNumber: "A-01.01" }),
  su(2, "status_changed", { to: "Active" }),
  su(3, "status_changed", { to: "Pending" }),
  su(4, "status_changed", { to: "Pending", label: "giu_cho" }),
  su(5, "status_changed", { to: "Active" }),
  su(6, "status_changed", { to: "Closed", closePrice: 3_400_000_000, closeDate: "2026-11-06" }),
  su(7, "status_changed", { to: "Closed", label: "da_sang_ten" }),
];

function kiemDay(laThang: (ds: readonly ListingEvent[], e: ListingEvent) => boolean): string[] {
  const loi: string[] = [];
  const goc = [1, 2, 3, 4, 5, 6, 7].map((k) => trangThaiGoc(DAY, k));
  const CHO_GOC = ["Incomplete", "Active", "Pending", "Pending", "Active", "Closed", "Closed"];
  if (JSON.stringify(goc) !== JSON.stringify(CHO_GOC)) loi.push(`bản gốc lệch: ${JSON.stringify(goc)}`);
  const KHONG_BIET: unknown[] = [0, 8, 2.5, undefined, "3"];
  let dem = 0;
  for (const k of KHONG_BIET) {
    dem++;
    if (trangThaiGoc(DAY, k) !== null) loi.push(`bản gốc ở ${String(k)} phải là không biết`);
  }
  if (dem !== 5) loi.push(`so ${dem} phiên bản không biết, chờ 5`);
  const thang = DAY.filter((e) => laThang(DAY, e)).map((e) => e.seq);
  if (JSON.stringify(thang) !== "[3,6]") loi.push(`thắng ngay lệch: ${JSON.stringify(thang)}, chờ [3,6]`);
  return loi;
}

test("AC-2 bản gốc và sự kiện thắng ngay trên dãy thật", () => {
  assert.deepEqual(kiemDay(suKienThangNgay), []);
  // Phá thử: phép cũ của bộ đồng bộ — mọi sự kiện có đích Pending / Closed.
  const cu = (_ds: readonly ListingEvent[], e: ListingEvent) => e.type === "status_changed" && (e.payload.to === "Pending" || e.payload.to === "Closed");
  assert.deepEqual(kiemDay(cu), ["thắng ngay lệch: [3,4,6,7], chờ [3,6]"]);
});
