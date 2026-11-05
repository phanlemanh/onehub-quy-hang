// Đổi đầu chủ hàng loạt (hàng 89: E1b, E4b) — phần thuần và bài quét mã nguồn, mỗi bộ so kèm chiều đỏ trên bản sao hỏng.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { chuDaDoi, chuHoanTac, dungHop, LOI_MAT_MANG, THOI_GIAN_HOAN_TAC, trangThaiNut, type XemTruoc } from "./doi-dau-chu";

const DIR = dirname(fileURLToPath(import.meta.url));
const doc = (t: string) => readFileSync(join(DIR, t), "utf8");

/** Nút «Đổi đầu chủ» dựng theo luật của lõi: hộp gọi canReassignListingAgents, thanh gắn nút của hộp, không so tên vai. */
function lechQuyen(thanh: string, hop: string): string[] {
  const out: string[] = [];
  if (!/canReassignListingAgents\(vai\)/.test(hop)) out.push("hop-doi-dau-chu.tsx: không gọi luật của lõi");
  if (/["']team_lead["']/.test(thanh) || /["']team_lead["']/.test(hop)) out.push("so chuỗi 'team_lead' ở màn");
  if (!/\{doiDauChu\.nut\}/.test(thanh)) out.push("thanh.tsx: không gắn nút đổi đầu chủ");
  return out;
}

test("E1b nút theo luật của lõi, màn không so tên vai", () => {
  assert.deepEqual(lechQuyen(doc("thanh.tsx"), doc("hop-doi-dau-chu.tsx")), []);
});

test("E1b đối chứng đỏ: bản sao thanh so chuỗi 'team_lead' → nêu lỗi", () => {
  const gia = doc("thanh.tsx").replace("const menu = nacMenu(lo);", `const menu = nacMenu(lo);\n  const laTruongNhom = vai.includes("team_lead");`);
  assert.deepEqual(lechQuyen(gia, doc("hop-doi-dau-chu.tsx")), ["so chuỗi 'team_lead' ở màn"]);
});

test("E1b nút: mất mạng tắt kèm lời, có mạng bật", () => {
  assert.deepEqual(trangThaiNut(false), { tat: true, loi: "Cần mạng để đổi đầu chủ" });
  assert.equal(LOI_MAT_MANG, "Cần mạng để đổi đầu chủ");
  assert.deepEqual(trangThaiNut(true), { tat: false, loi: null });
});

// E4b — hộp hỏi và thông báo.
const BAN: XemTruoc = {
  listings: [
    { listingId: "l3", selected: false, fromUserId: "d1", contactId: "k1" },
    { listingId: "l1", selected: true, fromUserId: "d1", contactId: "k1" },
    { listingId: "l4", selected: false, fromUserId: "d1", contactId: "k2" },
    { listingId: "l2", selected: true, fromUserId: null, contactId: "k2" },
    { listingId: "l5", selected: false, fromUserId: "d1", contactId: "k1" },
  ],
  contacts: 2,
};
const MA: Record<string, string> = { l1: "A-01", l2: "B-02", l3: "A-03", l4: "B-04", l5: "A-05" };

function lechHop(f: typeof dungHop): string[] {
  const h = f(BAN, (id) => MA[id] ?? id, (u) => (u === "d1" ? "[Tên] Đầu chủ 1" : u));
  const out: string[] = [];
  if (h.soCan !== 5 || h.soLienHe !== 2) out.push(`số: ${h.soCan} căn, ${h.soLienHe} liên hệ`);
  for (const d of h.dong) {
    const goc = BAN.listings.find((l) => l.listingId === d.id)!;
    if (d.cungChu !== !goc.selected) out.push(`${d.maCan}: dấu «cùng chủ nhà» sai`);
  }
  const cu = h.dong.find((d) => d.id === "l2")?.cu;
  if (cu !== "Chưa có đầu chủ") out.push(`B-02: đầu chủ cũ «${cu}»`);
  if (h.dong.slice(0, 2).some((d) => d.cungChu)) out.push("căn đã tích không đứng trước");
  return out;
}

test("E4b hộp hỏi: đủ 5 căn, đánh dấu «cùng chủ nhà» đúng 3 căn không tích, căn chưa có đầu chủ ghi rõ", () => {
  assert.deepEqual(lechHop(dungHop), []);
});

test("E4b đối chứng đỏ: bản sao bỏ dấu «cùng chủ nhà» → nêu mã căn", () => {
  const gia: typeof dungHop = (x, m, t) => {
    const h = dungHop(x, m, t);
    return { ...h, dong: h.dong.map((d) => ({ ...d, cungChu: false })) };
  };
  assert.deepEqual(lechHop(gia), ["A-03: dấu «cùng chủ nhà» sai", "A-05: dấu «cùng chủ nhà» sai", "B-04: dấu «cùng chủ nhà» sai"]);
});

test("E4b thông báo đổi 10 giây có «Hoàn tác»; hoàn tác ghi lời riêng cho căn chưa có đầu chủ", () => {
  assert.equal(chuDaDoi({ listings: 5, contacts: 2 }), "Đã đổi đầu chủ 5 căn, 2 liên hệ");
  assert.equal(THOI_GIAN_HOAN_TAC, 10_000);
  assert.match(doc("hop-doi-dau-chu.tsx"), /duration: THOI_GIAN_HOAN_TAC, action: \{ label: "Hoàn tác"/);
  assert.deepEqual(chuHoanTac({ restored: 4, skipped: 2, keptNoPriorAgent: 1 }, "[Tên] Đầu chủ 2"), {
    chu: "Đã trả lại người giữ cũ cho 4 căn và liên hệ",
    moTa: "Bỏ qua 2 căn hay liên hệ đã đổi tiếp sau đó · 1 căn trước chưa có đầu chủ nên giữ [Tên] Đầu chủ 2",
  });
  assert.deepEqual(chuHoanTac({ restored: 3, skipped: 0, keptNoPriorAgent: 0 }, "x"), { chu: "Đã trả lại người giữ cũ cho 3 căn và liên hệ", moTa: null });
});

test("E4b sau đổi và sau hoàn tác, bộ đồng bộ kéo lại ngay", () => {
  const n = (doc("hop-doi-dau-chu.tsx").match(/await bd\.thuNgay\(\)/g) ?? []).length;
  assert.equal(n, 2);
});
