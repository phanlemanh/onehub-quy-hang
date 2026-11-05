// Ma trận đọc tên cũ và phần thiếu (hàng 75, hồ sơ dia-chi-chuan) — E4, E6.
import assert from "node:assert/strict";
import { test } from "node:test";
import { DANH_MUC_DON_VI_HANH_CHINH as DM, type DanhMucDonViHanhChinh } from "./danh-muc";
import { docDiaChi, type KetQuaDiaChi, type PhanDiaChi } from "./doc-dia-chi";

/** Ma trận tên cũ viết trước: chữ gõ → { mã xã, tên xã, tên cũ (hay null khi đọc là xã mới) }. */
const MA_TRAN_TEN_CU: readonly [string, string, string, string | null][] = [
  ["45 Đường Mẫu 1, P. Bến Nghé, Q.1, TP.HCM", "26740", "Sài Gòn", "Bến Nghé"],
  ["61 Đường Mẫu 5, P. Cầu Kho, Q.1, TP.HCM", "26758", "Cầu Ông Lãnh", "Cầu Kho"],
  ["120/7 Đường Mẫu 2, P. Tân Định, Q.1, TP.HCM", "26737", "Tân Định", "Tân Định"],
  ["17 Đường Mẫu 3, P. Bến Thành, Q.1, TP.HCM", "26743", "Bến Thành", "Bến Thành"],
  ["17 Đường Mẫu 3, Phường Phạm Ngũ Lão, Quận 1, TP. Hồ Chí Minh", "26743", "Bến Thành", "Phạm Ngũ Lão"],
  ["61 Đường Mẫu 5, P. Cầu Ông Lãnh, TPHCM", "26758", "Cầu Ông Lãnh", null],
];

/** AC-4: hàm kiểm tên cũ vào trọn. */
function kiemTenCu(kq: KetQuaDiaChi, ma: string, ten: string, tenCu: string | null): string[] {
  const w = kq.wardName;
  const dung = w !== null && !("canNguoiChon" in w) && w.ma === ma && w.ten === ten && (w.tuTenCu ?? null) === tenCu && kq.trangThai === "chuan" && kq.khoa !== null;
  return dung ? [] : [`tên cũ đọc sai xã mới: ${tenCu ?? ten}`];
}

test("AC-4 tên cũ vào trọn", () => {
  for (const [chu, ma, ten, tenCu] of MA_TRAN_TEN_CU) assert.deepEqual(kiemTenCu(docDiaChi(chu), ma, ten, tenCu), [], chu);
  console.log(`AC-4: ${MA_TRAN_TEN_CU.length} dòng tên cũ`);
});

test("AC-4 tên cũ vào trọn — phá thử: danh mục bản sao trỏ Bến Nghé sang Tân Định thì đỏ", () => {
  const dm = structuredClone(DM) as DanhMucDonViHanhChinh;
  (dm.xaCu.find((x) => x.ten === "Bến Nghé") as unknown as { vao: string[] }).vao = ["26737"];
  const [chu, ma, ten, tenCu] = MA_TRAN_TEN_CU[0]!;
  assert.deepEqual(kiemTenCu(docDiaChi(chu, dm), ma, ten, tenCu), ["tên cũ đọc sai xã mới: Bến Nghé"]);
});

const DU = "45/12 Đường Mẫu 1, Phường Sài Gòn, TP.HCM";

/** Ma trận bỏ phần viết trước: chữ gõ → tập phần thiếu đúng. */
const MA_TRAN_THIEU: readonly [string, PhanDiaChi[]][] = [
  ["45/12 Đường Mẫu 1, Phường Sài Gòn", ["stateOrProvince"]],
  ["45/12 Đường Mẫu 1, TP.HCM", ["wardName"]],
  ["45/12, Phường Sài Gòn, TP.HCM", ["streetName"]],
  ["Đường Mẫu 1, Phường Sài Gòn, TP.HCM", ["streetNumber"]],
  ["hẻm 45 Đường Mẫu 1, Phường Sài Gòn, TP.HCM", ["streetNumber"]],
  ["45/12 Đường Mẫu 1, Phường [Tên lạ], TP.HCM", ["wardName"]],
];

/** Ma trận tỉnh viết trước: chữ tỉnh → mã tỉnh. */
const MA_TRAN_TINH: readonly [string, string][] = [
  ["Thành phố Hồ Chí Minh", "79"],
  ["TP. Hồ Chí Minh", "79"],
  ["TP.HCM", "79"],
  ["TPHCM", "79"],
  ["TP HCM", "79"],
  ["HCM", "79"],
  ["Hồ Chí Minh", "79"],
  ["Thành phố Hà Nội", "01"],
  ["TP Hà Nội", "01"],
  ["Hà Nội", "01"],
];

const tap = (xs: readonly string[]) => [...xs].sort().join("|");

/** AC-6: hàm kiểm — kết quả phải nói đúng phần thiếu. */
function kiemThieu(kq: KetQuaDiaChi, thieu: readonly PhanDiaChi[]): string[] {
  const loi: string[] = [];
  for (const p of thieu) if (!kq.thieu.includes(p)) loi.push(`không nói thiếu: ${p}`);
  if (tap(kq.thieu) !== tap(thieu)) loi.push(`thiếu lệch: ${tap(kq.thieu)}`);
  if (kq.trangThai !== "thieu" || kq.khoa !== null) loi.push("có khoá khi thiếu phần");
  return loi;
}

/** AC-6: hàm kiểm — xã đã đọc phải thuộc tỉnh đã đọc. */
function kiemTrongTinh(kq: KetQuaDiaChi): string[] {
  const w = kq.wardName;
  if (!w || "canNguoiChon" in w || !kq.stateOrProvince) return [];
  const xa = DM.xa.find((x) => x.ma === w.ma);
  return xa && xa.maTinh === kq.stateOrProvince.ma ? [] : [`xã đọc ngoài tỉnh: ${w.ten}`];
}

test("AC-6 nói thiếu phần nào", () => {
  let soAssert = 0;
  const du = docDiaChi(DU);
  assert.equal(du.trangThai, "chuan");
  assert.deepEqual(du.thieu, []);
  for (const [chu, thieu] of MA_TRAN_THIEU) {
    assert.deepEqual(kiemThieu(docDiaChi(chu), thieu), [], chu);
    soAssert++;
  }
  // Thiếu tỉnh: xã thành cần người chọn, ứng viên mang tỉnh, không suy tỉnh.
  const khongTinh = docDiaChi(MA_TRAN_THIEU[0]![0]);
  assert.equal(khongTinh.stateOrProvince, null);
  assert.ok(khongTinh.wardName && "canNguoiChon" in khongTinh.wardName);
  assert.ok(khongTinh.wardName.ungVien.length > 0);
  for (const u of khongTinh.wardName.ungVien) assert.ok(u.maTinh && u.tenTinh, "ứng viên phải mang tỉnh");
  assert.deepEqual(khongTinh.wardName.ungVien, [{ ma: "26740", ten: "Sài Gòn", maTinh: "79", tenTinh: "Thành phố Hồ Chí Minh" }]);
  // Tên lạ vào «chưa có trong danh mục».
  assert.deepEqual(docDiaChi(MA_TRAN_THIEU[5]![0]).chuaCoTrongDanhMuc, [{ phan: "wardName", chu: "[Tên lạ]" }]);
  const tinhLa = docDiaChi("45/12 Đường Mẫu 1, Phường Sài Gòn, Tỉnh [Tên lạ]");
  assert.ok(tinhLa.chuaCoTrongDanhMuc.some((c) => c.phan === "stateOrProvince"));
  assert.equal(tinhLa.khoa, null);
  for (const [chuTinh, ma] of MA_TRAN_TINH) {
    const kq = docDiaChi(`45/12 Đường Mẫu 1, Phường Sài Gòn, ${chuTinh}`);
    assert.equal(kq.stateOrProvince?.ma, ma, chuTinh);
    if (ma === "79") assert.equal(kq.khoa, "79|26740|mau 1|45/12", chuTinh);
    else assert.deepEqual(kq.chuaCoTrongDanhMuc, [{ phan: "wardName", chu: "Sài Gòn" }], chuTinh);
    soAssert++;
  }
  const saiGonCuoi = docDiaChi("45 Đường Mẫu 1, Phường Sài Gòn, Sài Gòn");
  assert.ok(saiGonCuoi.thieu.includes("stateOrProvince"), "«Sài Gòn» không phải tên tỉnh");
  soAssert++;
  const bacNinh = docDiaChi("45 Đường Mẫu 1, Phường Tân Định, Tỉnh Bắc Ninh");
  assert.equal(bacNinh.stateOrProvince?.ma, "24");
  assert.equal(bacNinh.wardName, null);
  assert.deepEqual(bacNinh.chuaCoTrongDanhMuc, [{ phan: "wardName", chu: "Tân Định" }]);
  assert.equal(bacNinh.khoa, null);
  assert.deepEqual(kiemTrongTinh(bacNinh), []);
  soAssert++;
  assert.equal(soAssert, MA_TRAN_THIEU.length + MA_TRAN_TINH.length + 2, "số assert phải bằng số dòng ma trận");
  console.log(`AC-6: ${MA_TRAN_THIEU.length} dòng bỏ phần, ${MA_TRAN_TINH.length} dòng tỉnh, 2 dòng tỉnh lạ`);
});

test("AC-6 nói thiếu phần nào — phá thử: không nói thiếu, xã đọc ngoài tỉnh đều đỏ", () => {
  const kq = docDiaChi(MA_TRAN_THIEU[1]![0]);
  assert.deepEqual(kiemThieu({ ...kq, thieu: [] }, ["wardName"]).slice(0, 1), ["không nói thiếu: wardName"]);
  // Bộ đọc bản sao bỏ lọc theo tỉnh: tìm xã trên cả danh mục rồi gắn tỉnh đã đọc.
  const boSai = (chu: string): KetQuaDiaChi => ({ ...docDiaChi(chu.replace(/, Tỉnh Bắc Ninh$/, ", TP.HCM")), stateOrProvince: { ma: "24", ten: "Tỉnh Bắc Ninh" } });
  assert.deepEqual(kiemTrongTinh(boSai("45 Đường Mẫu 1, Phường Tân Định, Tỉnh Bắc Ninh")), ["xã đọc ngoài tỉnh: Tân Định"]);
});
