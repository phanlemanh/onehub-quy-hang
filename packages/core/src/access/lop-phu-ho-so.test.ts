// Lớp phủ hồ sơ căn (hàng 33, AC-3, AC-4, AC-6) và tin hỏi đầu chủ. Ma trận viết tay trước khi viết hàm.
import assert from "node:assert/strict";
import { test } from "node:test";
import { findSourceLeaks, lopPhuHoSo, tinHoiDauChu, type CoHoSo } from ".";

const GIU = "u-dau-chu-giu";
const T = true;
const F = false;
const co = (noiBo: boolean, sanSang: boolean, suaAnh: boolean, hoiDauChu: boolean): CoHoSo => ({ noiBo, sanSang, suaAnh, hoiDauChu });

// [người xem, viewer, căn có người giữ?, cờ mong đợi]
const MA_TRAN: [string, { userId: string; roles: string[] }, boolean, CoHoSo][] = [
  ["Đầu khách · có người giữ", { userId: "u-dau-khach", roles: ["buyer_agent"] }, T, co(F, F, F, T)],
  ["Đầu khách · chưa ai giữ", { userId: "u-dau-khach", roles: ["buyer_agent"] }, F, co(F, F, F, T)],
  ["Đầu chủ giữ căn · có người giữ", { userId: GIU, roles: ["listing_agent"] }, T, co(T, T, T, F)],
  ["Đầu chủ giữ căn · chưa ai giữ", { userId: GIU, roles: ["listing_agent"] }, F, co(F, T, F, T)],
  ["Đầu chủ không giữ · có người giữ", { userId: "u-dau-chu-khac", roles: ["listing_agent"] }, T, co(F, F, F, T)],
  ["Đầu chủ không giữ · chưa ai giữ", { userId: "u-dau-chu-khac", roles: ["listing_agent"] }, F, co(F, T, F, T)],
  ["Trưởng nhóm · có người giữ", { userId: "u-truong-nhom", roles: ["team_lead"] }, T, co(T, T, T, F)],
  ["Trưởng nhóm · chưa ai giữ", { userId: "u-truong-nhom", roles: ["team_lead"] }, F, co(T, T, T, F)],
  ["Quản trị sàn · có người giữ", { userId: "u-quan-tri", roles: ["company_admin"] }, T, co(F, F, F, T)],
  ["Quản trị sàn · chưa ai giữ", { userId: "u-quan-tri", roles: ["company_admin"] }, F, co(F, F, F, T)],
];

test("lớp phủ hồ sơ: ma trận người xem", () => {
  for (const [o, viewer, coGiu, mong] of MA_TRAN) assert.deepEqual(lopPhuHoSo(viewer, coGiu ? GIU : null), mong, o);
  assert.equal(MA_TRAN.length, 10);
});

const CAN = { unitNumber: "A-04.06", buildingName: "Toà A" };

test("tin hỏi đầu chủ: chữ và đường", () => {
  const tin = tinHoiDauChu(CAN, "https://quy-hang.test");
  assert.equal(tin.text, "Hỏi về căn A-04.06 · Toà A");
  const url = new URL(tin.url);
  assert.equal(url.pathname, "/inventory");
  assert.equal(url.searchParams.get("unit"), "A-04.06");
});

test("tin hỏi đầu chủ: không chở nguồn", () => {
  const TEN = "[Tên chủ mẫu]";
  const SO = "0900000012";
  const GIA_DAY = "3200000000";
  const mau = [TEN, SO, GIA_DAY];
  const hang = { ...CAN, ownerName: TEN, ownerPhone: SO, floorPrice: Number(GIA_DAY), titleDeedPhoto: "so.jpg" };
  const tin = tinHoiDauChu(hang, "https://quy-hang.test");
  for (const m of mau) assert.ok(m.length > 0);
  assert.deepEqual(findSourceLeaks(tin, mau), []);
  // Đối chứng dương: cùng hàm quét bắt được tên chủ chèn vào tin.
  assert.notDeepEqual(findSourceLeaks({ ...tin, text: `${tin.text} ${TEN}` }, mau), []);
});
