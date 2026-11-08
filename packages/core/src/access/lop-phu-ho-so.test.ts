// Lớp phủ hồ sơ căn (hàng 33, AC-3, AC-4, AC-6) và tin hỏi đầu chủ. Ma trận viết tay trước khi viết hàm.
import assert from "node:assert/strict";
import { test } from "node:test";
import { findSourceLeaks, lopPhuHoSo, tinHoiDauChu, vaoManCuocGoi, type CoHoSo } from ".";

const GIU = "u-dau-chu-giu";
const T = true;
const F = false;
const co = (noiBo: boolean, sanSang: boolean, suaAnh: boolean, hoiDauChu: boolean, ghiCuocGoi: boolean): CoHoSo => ({ noiBo, sanSang, suaAnh, hoiDauChu, ghiCuocGoi });

// [người xem, viewer, căn có người giữ?, cờ mong đợi] — đúng «Bảng người xem» của hợp đồng va-nut-ghi-cuoc-goi-truong-nhom
// (12 ô). Cột «chưa ai giữ»: người có vai Đầu chủ không giữ ai cả.
const MA_TRAN: [string, { userId: string; roles: string[] }, boolean, CoHoSo][] = [
  ["Đầu khách · có người giữ", { userId: "u-dau-khach", roles: ["buyer_agent"] }, T, co(F, F, F, T, F)],
  ["Đầu khách · chưa ai giữ", { userId: "u-dau-khach", roles: ["buyer_agent"] }, F, co(F, F, F, T, F)],
  ["Đầu chủ giữ căn · có người giữ", { userId: GIU, roles: ["listing_agent"] }, T, co(T, T, T, F, T)],
  ["Đầu chủ giữ căn · chưa ai giữ", { userId: GIU, roles: ["listing_agent"] }, F, co(F, T, F, T, F)],
  ["Đầu chủ không giữ · có người giữ", { userId: "u-dau-chu-khac", roles: ["listing_agent"] }, T, co(F, F, F, T, F)],
  ["Đầu chủ không giữ · chưa ai giữ", { userId: "u-dau-chu-khac", roles: ["listing_agent"] }, F, co(F, T, F, T, F)],
  ["Trưởng nhóm thuần · có người giữ", { userId: "u-truong-nhom", roles: ["team_lead"] }, T, co(T, T, T, F, F)],
  ["Trưởng nhóm thuần · chưa ai giữ", { userId: "u-truong-nhom", roles: ["team_lead"] }, F, co(T, T, T, F, F)],
  ["Trưởng nhóm có vai Đầu chủ · có người giữ", { userId: "u-truong-chu", roles: ["team_lead", "listing_agent"] }, T, co(T, T, T, F, T)],
  ["Trưởng nhóm có vai Đầu chủ · chưa ai giữ", { userId: "u-truong-chu", roles: ["team_lead", "listing_agent"] }, F, co(T, T, T, F, T)],
  ["Quản trị sàn · có người giữ", { userId: "u-quan-tri", roles: ["company_admin"] }, T, co(F, F, F, T, F)],
  ["Quản trị sàn · chưa ai giữ", { userId: "u-quan-tri", roles: ["company_admin"] }, F, co(F, F, F, T, F)],
];

/** Bộ so: mỗi ô lệch một dòng «<ô> · <cờ> <thực> · mong <mong>». */
function lechMaTran(ham: typeof lopPhuHoSo): string[] {
  const ra: string[] = [];
  for (const [o, viewer, coGiu, mong] of MA_TRAN) {
    const thuc = ham(viewer, coGiu ? GIU : null);
    for (const k of Object.keys(mong) as (keyof CoHoSo)[]) if (thuc[k] !== mong[k]) ra.push(`${o} · ${k} ${thuc[k]} · mong ${mong[k]}`);
  }
  return ra;
}

test("lớp phủ hồ sơ: ma trận người xem (12 ô viết trước, năm cờ)", () => {
  assert.equal(MA_TRAN.length, 12);
  assert.deepEqual(lechMaTran(lopPhuHoSo), []);
  assert.equal(MA_TRAN.filter(([, , , c]) => c.ghiCuocGoi).length, 3, "đối chứng dương: ba ô có ghiCuocGoi");
});

test("lớp phủ hồ sơ · chiều đỏ: bản sao suy ghiCuocGoi = !hoiDauChu → bộ so nêu đúng hai ô trưởng nhóm thuần", () => {
  const banSao: typeof lopPhuHoSo = (v, g) => {
    const c = lopPhuHoSo(v, g);
    return { ...c, ghiCuocGoi: !c.hoiDauChu };
  };
  assert.deepEqual(lechMaTran(banSao), ["Trưởng nhóm thuần · có người giữ · ghiCuocGoi true · mong false", "Trưởng nhóm thuần · chưa ai giữ · ghiCuocGoi true · mong false"]);
});

test("vào màn ghi cuộc gọi: đúng người mang vai Đầu chủ", () => {
  const ca: [string[], boolean][] = [[["listing_agent"], T], [["team_lead", "listing_agent"], T], [["team_lead"], F], [["buyer_agent"], F], [["company_admin"], F], [["telesales"], F]];
  for (const [roles, mong] of ca) assert.equal(vaoManCuocGoi({ roles }), mong, roles.join(","));
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
