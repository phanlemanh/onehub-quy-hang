// Ô lạ còn lại ở bước Xem trước (hàng 69: E4, E5, E6, E7b). Đường ô lạ là hàm giả trả đề xuất theo chữ ô; bài này đo luồng
// hiện — dùng — sửa tay — dự phòng của màn, không đo độ đúng của mô hình (đó là E8).
import assert from "node:assert/strict";
import { test } from "node:test";
import type { GoiOLa, ImportContext } from "@quy-hang/core/import";
import { danhMucMau, HOM_NAY } from "../../../../../packages/core/test/import/sinh";
import type { TrangThaiAi } from "./de-xuat";
import { chayOng, apLai } from "./duong-ong";
import { canHoiOLa, deXuatCuaO, dungDeXuat, hoiOLa, lyDoKhongHoiOLa, tatO, ttOLaDau, type HoiOLa, type KetQuaGoiOLa, type TrangThaiOLa } from "./o-la";
import { COT, LUOI_O_LA } from "./o-la.fixture";
import { goiDong, napTep, suaO, taoTrangThai, type TrangThaiNhap } from "./trang-thai";

const CTX: ImportContext = { today: HOM_NAY, catalog: danhMucMau() };
const TEP = { ten: "o-la.csv", bam: "b".repeat(64), loai: "csv" as const, trang: null };
const AI_BAT: TrangThaiAi = { bat: true, tamNgung: false, sanSang: true, conTran: true, tranThangUsd: 10, daDungUsd: null, laQuanTri: false };
const THEO_CHU: Record<string, { gia_tri: string; ly_do: string }> = {
  "4.6–4.8 tỷ": { gia_tri: "4,8 tỷ", ly_do: "Chọn cận trên của dải làm giá chào." },
  "thu về 4.2": { gia_tri: "4,2 tỷ KBP", ly_do: "Chủ thu về 4,2 tỷ: giá chưa gồm phí là giá về tay." },
  "đang đàm phán": { gia_tri: "Đang giao dịch", ly_do: "Đang đàm phán là đã có khách." },
};

/** Đường ô lạ giả: đề xuất theo chữ ô; đếm lần gọi, giữ các gói đã nhận. */
function hoiGia() {
  const dem = { n: 0, goi: [] as GoiOLa[] };
  const hoi: HoiOLa = async (goi) => {
    dem.n++;
    dem.goi.push(goi);
    const deXuat = goi.o.filter((o) => THEO_CHU[o.giaTri]).map((o) => ({ id: o.id, giaTri: THEO_CHU[o.giaTri]!.gia_tri, lyDo: THEO_CHU[o.giaTri]!.ly_do }));
    return { cheDo: "ai", deXuat, loi: [] } satisfies KetQuaGoiOLa;
  };
  return { hoi, dem };
}
const nhap = (): TrangThaiNhap => ({ ...napTep(taoTrangThai(["listing_agent"]), TEP, chayOng(LUOI_O_LA, CTX)), buoc: 3 });
const src = (s: TrangThaiNhap, maCan: string) => s.ong!.table.rows.find((r) => r.cells[1] === maCan)!.source;
const o = (s: TrangThaiNhap, maCan: string, cot: number) => s.ong!.dong.find((d) => d.source === src(s, maCan))!.cells[cot]!;
const coDeXuat = async (): Promise<{ s: TrangThaiNhap; tt: TrangThaiOLa; dem: ReturnType<typeof hoiGia>["dem"] }> => {
  const s = nhap();
  const { hoi, dem } = hoiGia();
  return { s, tt: await hoiOLa(s.ong!, hoi, ttOLaDau()), dem };
};

test("Dùng đề xuất một chạm", async () => {
  const s0 = nhap();
  assert.ok(canHoiOLa(s0.ong!, AI_BAT, ttOLaDau()), "sàn bật và có ô lạ");
  const sach = chayOng([LUOI_O_LA[0]!, LUOI_O_LA[5]!], CTX);
  assert.ok(!canHoiOLa(sach, AI_BAT, ttOLaDau()), "không ô lạ thì không hỏi");

  // Nhớ theo ô đã hỏi: K1 → K2 → K1 → K2 gọi đúng hai lần.
  const { hoi, dem } = hoiGia();
  const k1 = s0.ong!;
  const k2 = apLai(k1.table, k1.lop, k1.profile, { ...k1.plan, columns: k1.plan.columns.map((c, i) => (i === COT.gia ? { ...c, transform: { name: "price", params: { unit: "trieu" } } } : c)) }, CTX);
  let tt = ttOLaDau();
  for (const k of [k1, k2, k1, k2]) tt = await hoiOLa(k, hoi, tt);
  assert.equal(dem.n, 2, "mỗi kế hoạch khác nhau gửi một lần");

  const { s, tt: t1 } = await coDeXuat();
  for (const ma of ["A-0101", "A-0102", "A-0103"]) assert.equal(deXuatCuaO(s.ong!, t1, src(s, ma), COT.gia)?.giaTri, "4,8 tỷ", `ô dải ${ma} hiện đề xuất`);
  assert.equal(deXuatCuaO(s.ong!, t1, src(s, "A-0105"), COT.gia), null, "ô «5 tỷ» không có đề xuất");

  const d1 = dungDeXuat(s, t1, src(s, "A-0101"), COT.gia, CTX);
  assert.deepEqual([o(d1.s, "A-0101", COT.gia).mark, o(d1.s, "A-0101", COT.gia).value], ["keep", 4_800_000_000], "chỉ dòng 1 đổi");
  for (const ma of ["A-0102", "A-0103"]) {
    assert.equal(o(d1.s, ma, COT.gia).mark, "needs_person", `${ma} vẫn cần người`);
    assert.equal(deXuatCuaO(d1.s.ong!, d1.tt, src(d1.s, ma), COT.gia)?.giaTri, "4,8 tỷ", `${ma} vẫn hiện đề xuất`);
  }

  const d2 = dungDeXuat(d1.s, d1.tt, src(d1.s, "A-0104"), COT.gia, CTX);
  assert.equal(o(d2.s, "A-0104", COT.gia).value, 4_200_000_000, "giá về tay 4,2 tỷ");
  assert.equal(d2.s.ong!.dong.find((d) => d.source === src(d2.s, "A-0104"))!.extra.feeInclusion, "excluded", "điều kiện phí ở extra của dòng");

  const d3 = dungDeXuat(d2.s, d2.tt, src(d2.s, "A-0103"), COT.trangThai, CTX);
  assert.deepEqual(["A-0103", "A-0104"].map((ma) => o(d3.s, ma, COT.trangThai).value), ["Pending", "Pending"], "ô trạng thái cùng chữ đổi theo");
  assert.equal(d3.s.soOTheo, 1, "đổi theo 1 ô");
  assert.equal(deXuatCuaO(d3.s.ong!, d3.tt, src(d3.s, "A-0101"), COT.gia), null, "ô đã dùng không còn đề xuất");
});

test("không chạm thì không đổi", async () => {
  const s = nhap();
  const bangTruoc = structuredClone(s.ong!.table);
  const planTruoc = structuredClone(s.ong!.plan.columns.map((c) => c.valueMap ?? null));
  const { hoi } = hoiGia();
  const tt = await hoiOLa(s.ong!, hoi, ttOLaDau());
  assert.ok(tt.theoKhoa.size > 0, "đã nhận đề xuất");
  assert.ok(s.ong!.dong.every((d) => d.cells.every((c) => !THEO_CHU[String(c.raw)] || c.mark === "needs_person")), "mọi ô lạ vẫn cần người");
  assert.deepEqual(s.ong!.table, bangTruoc, "bảng không đổi");
  assert.deepEqual(s.ong!.plan.columns.map((c) => c.valueMap ?? null), planTruoc, "bảng quy đổi không đổi");
  const goi = JSON.stringify(goiDong(s));
  assert.ok(goi.includes("thu về 4.2") && goi.includes("đang đàm phán"), "gói ghi mang chữ gốc");
  for (const v of Object.values(THEO_CHU)) assert.ok(!goi.includes(v.gia_tri), `gói ghi chứa đề xuất «${v.gia_tri}»`);
});

test("gõ tay thắng đề xuất", async () => {
  const { s, tt } = await coDeXuat();
  const nguon = src(s, "A-0103");
  const s1 = suaO(s, nguon, COT.trangThai, "Đang bán", CTX);
  const t1 = tatO(tt, nguon, COT.trangThai);
  assert.equal(o(s1, "A-0103", COT.trangThai).value, "Active", "chữ của người được áp");
  assert.equal(deXuatCuaO(s1.ong!, t1, nguon, COT.trangThai), null, "đề xuất của ô tắt");
  const dungLai = apLai(s1.ong!.table, s1.ong!.lop, s1.ong!.profile, s1.ong!.plan, CTX);
  assert.equal(deXuatCuaO(dungLai, t1, nguon, COT.trangThai), null, "dựng lại lưới vẫn không hiện");

  const nguon2 = src(s, "A-0101");
  const s2 = suaO(s, nguon2, COT.gia, "xyz", CTX);
  const t2 = tatO(tt, nguon2, COT.gia);
  assert.equal(o(s2, "A-0101", COT.gia).mark, "needs_person", "chữ không đọc được vẫn cần người");
  assert.match(o(s2, "A-0101", COT.gia).reason ?? "", /không đọc được giá/);
  assert.equal(deXuatCuaO(s2.ong!, t2, nguon2, COT.gia), null, "đề xuất không quay lại");
});

test("màn nói lý do khi không đề xuất", async () => {
  const s = nhap();
  const loiMang: HoiOLa = async () => {
    throw new TypeError("fetch failed");
  };
  assert.equal((await hoiOLa(s.ong!, loiMang, ttOLaDau())).bao, "Sửa tay lần này: không gửi được tới máy chủ");
  const tatDinh: HoiOLa = async () => ({ cheDo: "tat-dinh", lyDo: "Hết trần AI tháng này" });
  assert.equal((await hoiOLa(s.ong!, tatDinh, ttOLaDau())).bao, "Sửa tay lần này: Hết trần AI tháng này");
  const { dem } = hoiGia();
  assert.ok(!canHoiOLa(s.ong!, { ...AI_BAT, bat: false }, ttOLaDau()), "sàn chưa bật thì không hỏi");
  assert.equal(dem.n, 0);
  assert.equal(lyDoKhongHoiOLa(s.ong!, { ...AI_BAT, conTran: false }), "Sửa tay lần này: Hết trần AI tháng này");
  const s1 = suaO(s, src(s, "A-0101"), COT.gia, "4,7 tỷ", CTX);
  assert.equal(o(s1, "A-0101", COT.gia).value, 4_700_000_000, "sửa tay chạy như không AI");
});
