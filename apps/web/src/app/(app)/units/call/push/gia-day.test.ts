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
  assert.equal(MA_TRAN.length, 5);
  assert.deepEqual(await caSai(khoiGiaDay), []);
  // Không chạm bộ nhớ trình duyệt: môi trường kiểm không có localStorage, đọc vẫn chạy trọn.
  assert.equal(typeof (globalThis as { localStorage?: unknown }).localStorage, "undefined");
});

test("giá đáy: đối chứng đỏ — đọc floorPrice khi không thấy nguồn bị gọi tên", async () => {
  const docLot: Khoi = (gd, gia) => (gd.kind === "an" ? khoiGiaDay({ kind: "co", dong: 2_700_000_000 }, gia) : khoiGiaDay(gd, gia));
  assert.ok((await caSai(docLot)).includes("không thấy nguồn"));
});
