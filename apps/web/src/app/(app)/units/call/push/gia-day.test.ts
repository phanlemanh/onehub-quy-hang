// Giá đáy nội bộ (hàng 29, E3a). Hàm gọi giả đếm lời gọi; năm ca viết trước, đếm bằng assert số.
import assert from "node:assert/strict";
import { test } from "node:test";
import type { Goi } from "@/lib/sync/types";
import { docGiaDay, khoiGiaDay, type GiaDay, type KhoiGiaDay } from "./gia-day";

const GIA = { listPrice: 2_800_000_000, feeInclusion: "excluded" as const };

function goiGia(tra: { status: number; body: unknown } | "mat-mang") {
  const goi: string[] = [];
  const f: Goi = async (method, path) => {
    goi.push(`${method} ${path}`);
    if (tra === "mat-mang") throw new Error("mất mạng");
    return tra;
  };
  return { f, goi };
}

type Khoi = (gd: GiaDay, gia: typeof GIA) => KhoiGiaDay;
const MA_TRAN: [string, { status: number; body: unknown } | "mat-mang", KhoiGiaDay][] = [
  ["có giá đáy", { status: 200, body: { visible: true, ownerName: "[Tên]", floorPrice: 2_700_000_000, hasPhone: true } }, { kind: "chu", chinh: "2,7 tỷ", phu: "thấp hơn giá về tay hiện tại 3,6%" }],
  ["chưa ghi giá đáy", { status: 200, body: { visible: true, ownerName: "[Tên]", floorPrice: null, hasPhone: false } }, { kind: "chu", chinh: "Chưa ghi giá đáy", phu: null }],
  ["không thấy nguồn", { status: 200, body: { visible: false, listingAgentUserId: "u" } }, { kind: "an" }],
  ["403", { status: 403, body: { error: "listing-agent-required" } }, { kind: "an" }],
  ["404", { status: 404, body: { error: "not-found" } }, { kind: "an" }],
  ["hết phiên", { status: 401, body: { error: "unauthorized" } }, { kind: "chu", chinh: "Chưa tải được giá đáy", phu: null }],
  ["máy chủ lỗi", { status: 503, body: null }, { kind: "chu", chinh: "Chưa tải được giá đáy", phu: null }],
  ["mất mạng", "mat-mang", { kind: "chu", chinh: "Chưa tải được giá đáy", phu: null }],
];

async function caSai(khoi: Khoi): Promise<string[]> {
  const sai: string[] = [];
  for (const [ten, tra, mong] of MA_TRAN) {
    const g = goiGia(tra);
    const k = khoi(await docGiaDay(g.f, "h1"), GIA);
    if (JSON.stringify(k) !== JSON.stringify(mong) || JSON.stringify(g.goi) !== JSON.stringify(["GET /api/v1/listings/h1/owner"])) sai.push(ten);
  }
  return sai;
}

test("giá đáy: khối theo trả lời", async () => {
  assert.equal(MA_TRAN.length, 8);
  const ghi = khoGia();
  try {
    assert.deepEqual(await caSai(khoiGiaDay), []);
  } finally {
    ghi.go();
  }
  // Không chạm bộ nhớ trình duyệt: kho giả đếm mọi lần ghi trong lúc chạy trọn ma trận.
  assert.equal(ghi.dem(), 0);
});

/** Kho giả thay localStorage và indexedDB trong lúc chạy, đếm lần ghi hay mở. */
function khoGia() {
  const g = globalThis as Record<string, unknown>;
  const cu = { localStorage: g.localStorage, indexedDB: g.indexedDB };
  let n = 0;
  g.localStorage = { setItem: () => void n++, getItem: () => null, removeItem: () => void n++, clear: () => void n++ };
  g.indexedDB = { open: () => (n++, {}) };
  return { dem: () => n, go: () => Object.assign(g, cu) };
}

test("giá đáy: đối chứng đỏ — bản đọc ghi giá đáy vào bộ nhớ trình duyệt bị kho giả đếm", async () => {
  const ghi = khoGia();
  try {
    const g = goiGia(MA_TRAN[0]![1]);
    const gd = await docGiaDay(g.f, "h1");
    if (gd.kind === "co") (globalThis as { localStorage: Storage }).localStorage.setItem("floor", String(gd.dong));
  } finally {
    ghi.go();
  }
  assert.equal(ghi.dem(), 1);
});

test("giá đáy: đối chứng đỏ — coi lỗi máy chủ là không có quyền bị gọi tên", async () => {
  const anHet: Khoi = (gd, gia) => (gd.kind === "loi" ? { kind: "an" } : khoiGiaDay(gd, gia));
  const sai = await caSai(anHet);
  assert.ok(sai.includes("máy chủ lỗi") && sai.includes("hết phiên"));
});

test("giá đáy: đối chứng đỏ — đọc floorPrice khi không thấy nguồn bị gọi tên", async () => {
  const docLot: Khoi = (gd, gia) => (gd.kind === "an" ? khoiGiaDay({ kind: "co", dong: 2_700_000_000 }, gia) : khoiGiaDay(gd, gia));
  assert.ok((await caSai(docLot)).includes("không thấy nguồn"));
});
