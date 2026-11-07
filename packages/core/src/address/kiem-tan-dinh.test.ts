// Ghim kết quả ca «Tân Định, Tỉnh Bắc Ninh» (hàng kiem-tan-dinh-bac-ninh) — E1…E4. Hàm kiểm thuần so tập trường rồi từng
// trường với kết quả ghim viết trước; phá thử chạy CÙNG hàm với bộ đọc lỗi, ghim thông điệp.
// Kết quả ghim: tỉnh 24 «Thành phố Bắc Ninh» và tỉnh 24 không có xã Tân Định (chỉ có Tân Dĩnh 07432) là của danh mục đã
// đối chiếu nguồn ở hàng danh-muc-xa-day-du (AC-4).
import assert from "node:assert/strict";
import { test } from "node:test";
import { DANH_MUC_DON_VI_HANH_CHINH as DM } from "./danh-muc";
import { docDiaChi, type KetQuaDiaChi } from "./doc-dia-chi";
import { docDiaChiVoi } from "./doc-dia-chi-loi";

type Doc = (chu: string) => KetQuaDiaChi;

const CHU = "12 Lê Lợi, Phường Tân Định, Tỉnh Bắc Ninh";
const CHU_KHONG_TIEN_TO = "12 Lê Lợi, Tân Định, Tỉnh Bắc Ninh";

const GHIM = {
  stateOrProvince: { ma: "24", ten: "Thành phố Bắc Ninh" },
  wardName: null,
  chuaCoTrongDanhMuc: [{ phan: "wardName", chu: "Tân Định" }],
  thieu: ["wardName"],
  trangThai: "thieu",
  khoa: null,
  streetNumber: "12",
  streetName: "Lê Lợi",
} as const;
const TRUONG = Object.keys(GHIM) as (keyof typeof GHIM)[];
const KHOA_GHIM = [...TRUONG, "unparsedAddress"].sort();

const docLui: Doc = (c) => docDiaChiVoi(c, DM, { trongTinh: true, nhanHuyenTP: true, soDau: "lui-bo-dau" });

function kiemTanDinhBacNinh(doc: Doc): string[] {
  const kq = doc(CHU);
  const khoa = Object.keys(kq).sort();
  const loi = [
    ...khoa.filter((k) => !KHOA_GHIM.includes(k)),
    ...KHOA_GHIM.filter((k) => !khoa.includes(k)),
  ].map((k) => `lệch tập trường: ${k}`);
  if (kq.unparsedAddress !== CHU) loi.push("lệch kết quả ghim: unparsedAddress");
  for (const t of TRUONG) {
    if (JSON.stringify(kq[t]) !== JSON.stringify(GHIM[t])) loi.push(`lệch kết quả ghim: ${t}`);
  }
  return loi;
}

function kiemKhongTienTo(doc: Doc): string[] {
  const kq = doc(CHU_KHONG_TIEN_TO);
  const loi: string[] = [];
  if (kq.wardName !== null) loi.push(`không tiền tố ra xã: ${"ma" in kq.wardName ? kq.wardName.ma : "cần chọn"}`);
  if (!kq.thieu.includes("wardName")) loi.push("không tiền tố không nói thiếu xã");
  if (kq.trangThai !== "thieu") loi.push(`không tiền tố sai trạng thái: ${kq.trangThai}`);
  return loi;
}

test("AC-1 ghim kết quả Tân Định, Bắc Ninh", () => {
  console.log(`AC-1: so ${TRUONG.length} trường và tập ${KHOA_GHIM.length} khoá`);
  assert.equal(TRUONG.length, 8);
  assert.deepEqual(kiemTanDinhBacNinh(docDiaChi), []);
});

test("AC-1 phá thử: kết quả có khoá lạ thì lệch tập trường", () => {
  const themKhoa: Doc = (c) => ({ ...docDiaChi(c), goiY: "Tân Dĩnh" }) as KetQuaDiaChi;
  assert.deepEqual(kiemTanDinhBacNinh(themKhoa), ["lệch tập trường: goiY"]);
});

test("AC-2 phá thử ba bộ đọc lỗi", () => {
  assert.deepEqual(kiemTanDinhBacNinh(docLui), [
    "lệch kết quả ghim: wardName",
    "lệch kết quả ghim: chuaCoTrongDanhMuc",
    "lệch kết quả ghim: thieu",
    "lệch kết quả ghim: trangThai",
    "lệch kết quả ghim: khoa",
  ]);
  const rong: Doc = (c) => ({ ...docDiaChi(c), chuaCoTrongDanhMuc: [] });
  assert.deepEqual(kiemTanDinhBacNinh(rong), ["lệch kết quả ghim: chuaCoTrongDanhMuc"]);
  const xa = DM.xa.filter((x) => x.maTinh === "24").sort((a, b) => a.ma.localeCompare(b.ma))[0]!;
  assert.equal(xa.ma, "07210");
  const saiXa: Doc = (c) => ({ ...docDiaChi(c), wardName: { ma: xa.ma, ten: xa.ten } });
  assert.deepEqual(kiemTanDinhBacNinh(saiXa), ["lệch kết quả ghim: wardName"]);
});

test("AC-3 dạng không tiền tố", () => {
  assert.deepEqual(kiemKhongTienTo(docDiaChi), []);
  assert.equal(kiemKhongTienTo(docLui)[0], "không tiền tố ra xã: 07432");
});
