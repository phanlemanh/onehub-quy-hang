// Cửa màn ghi cuộc gọi và quan hệ nút ⇒ trang (hàng va-nut-ghi-cuoc-goi-truong-nhom, AC-3). Cùng sáu người xem của «Bảng
// người xem» trong hợp đồng: hễ hồ sơ căn hiện nút «Ghi cuộc gọi» cho ai thì cửa của trang cho người ấy vào. Trang gọi đúng
// hàm cửa, không tự đọc tên vai. Dữ liệu mẫu, không dữ liệu cá nhân thật.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

import { lopPhuHoSo } from "@quy-hang/core/access";
import { nutChinh, type NutChinh } from "../ho-so/mo-hinh";
import { moDuocManCuocGoi } from "./cua";

const GIU = "u-giu";
const NGUOI_XEM: [string, { userId: string; roles: string[] }][] = [
  ["đầu khách", { userId: "u-khach", roles: ["buyer_agent"] }],
  ["đầu chủ giữ căn", { userId: GIU, roles: ["listing_agent"] }],
  ["đầu chủ không giữ", { userId: "u-chu-khac", roles: ["listing_agent"] }],
  ["trưởng nhóm thuần", { userId: "u-truong", roles: ["team_lead"] }],
  ["trưởng nhóm có vai Đầu chủ", { userId: "u-truong-chu", roles: ["team_lead", "listing_agent"] }],
  ["quản trị sàn", { userId: "u-quan-tri", roles: ["company_admin"] }],
];
const me = (roles: string[]) => ({ activeCompany: { roles } });

test("cửa màn ghi cuộc gọi: đúng người mang vai Đầu chủ (6 người xem viết trước); chưa đăng nhập hay chưa chọn sàn thì không", () => {
  const mong: Record<string, boolean> = { "đầu khách": false, "đầu chủ giữ căn": true, "đầu chủ không giữ": true, "trưởng nhóm thuần": false, "trưởng nhóm có vai Đầu chủ": true, "quản trị sàn": false };
  for (const [ten, v] of NGUOI_XEM) assert.equal(moDuocManCuocGoi(me(v.roles)), mong[ten], ten);
  assert.equal(moDuocManCuocGoi(null), false);
  assert.equal(moDuocManCuocGoi({ activeCompany: null }), false);
});

type HamNut = (o: Parameters<typeof nutChinh>[0]) => NutChinh;
/** Quan hệ nút ⇒ trang: mỗi ca nút «Ghi cuộc gọi» mà cửa không cho vào là một dòng lệch. */
function lechNutTrang(ham: HamNut): string[] {
  const ra: string[] = [];
  for (const [ten, v] of NGUOI_XEM)
    for (const giu of [true, false]) {
      const nut = ham({ co: lopPhuHoSo(v, giu ? GIU : null), chuaMa: false, canId: "hang-1" });
      if (nut?.kind === "ghi-cuoc-goi" && !moDuocManCuocGoi(me(v.roles))) ra.push(`${ten} · ${giu ? "có người giữ" : "chưa ai giữ"}`);
    }
  return ra;
}

test("nút ⇒ trang: hễ hồ sơ hiện «Ghi cuộc gọi» thì cửa cho vào (12 ca, 0 lệch)", () => {
  assert.deepEqual(lechNutTrang(nutChinh), []);
  const coNut = NGUOI_XEM.flatMap(([, v]) => [true, false].filter((g) => nutChinh({ co: lopPhuHoSo(v, g ? GIU : null), chuaMa: false, canId: "h" })?.kind === "ghi-cuoc-goi"));
  assert.equal(coNut.length, 3, "đối chứng dương: ba ca có nút ghi cuộc gọi");
});

test("nút ⇒ trang · chiều đỏ: bản sao nút suy từ !hoiDauChu → bộ so nêu đúng hai ca trưởng nhóm thuần", () => {
  const cu: HamNut = (o) => (o.chuaMa ? null : o.co.hoiDauChu ? { kind: "hoi-dau-chu" } : { kind: "ghi-cuoc-goi", href: `/units/call?hang=${o.canId}` });
  assert.deepEqual(lechNutTrang(cu), ["trưởng nhóm thuần · có người giữ", "trưởng nhóm thuần · chưa ai giữ"]);
});

/** Trang gọi hàm cửa và không tự đọc tên vai. */
function lechTrang(nd: string): string[] {
  const ra: string[] = [];
  if (!/moDuocManCuocGoi\(me\)/.test(nd)) ra.push("page.tsx không gọi moDuocManCuocGoi(me)");
  if (/roles\.includes\(/.test(nd) || /"listing_agent"/.test(nd)) ra.push("page.tsx tự đọc tên vai");
  return ra;
}

test("trang ghi cuộc gọi chặn bằng hàm cửa, không tự đọc tên vai", () => {
  const nd = readFileSync(new URL("./page.tsx", import.meta.url), "utf8");
  assert.ok(/notFound\(\)/.test(nd), "đối chứng dương: trang có lối không tìm thấy");
  assert.deepEqual(lechTrang(nd), []);
  // Chiều đỏ: bản sao trang đọc tên vai thẳng như trước hàng vá.
  const banSao = nd.replace("!moDuocManCuocGoi(me) || ", '!me?.activeCompany?.roles.includes("listing_agent") || ');
  assert.deepEqual(lechTrang(banSao), ["page.tsx không gọi moDuocManCuocGoi(me)", "page.tsx tự đọc tên vai"]);
});
