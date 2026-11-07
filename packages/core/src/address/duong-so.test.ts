// Đường số «Đường số N» (hàng va-duong-so-n, Ngoài-2 của hàng 75) — E1…E5. Mỗi phép đo là một hàm kiểm trả danh sách lỗi;
// phá thử bộ tách dùng `tachSoNhaVoi(phan, () => false)` — đúng hành vi trước khi vá (không tiền tố nào được nhận).
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { dangSo, khoaDiaChi, tachSoNha, tachSoNhaVoi, tenDuongChuan, type TachSoNha } from "./chuan-hoa";
import { docDiaChi, type KetQuaDiaChi } from "./doc-dia-chi";

type BoTach = (phan: string) => TachSoNha;
const boTruocVa: BoTach = (phan) => tachSoNhaVoi(phan, () => false);
const XA = ", Phường Bến Thành, TP.HCM";

// ---------- AC-1: tách số nhà trước đường số ----------

const TIEN_TO = ["Đường", "đường", "ĐƯỜNG", "Đ.", "Đg", "Duong", "Phố"] as const;
/** Dạng số nhà viết trước: hàm dựng chữ từ tiền tố, số nhà đúng. */
const DANG_SO_NHA: readonly [(t: string) => string, string][] = [
  [(t) => `12 ${t} số 5`, "12"],
  [(t) => `Số 12 ${t} số 5`, "12"],
  [(t) => `số 12, ${t} số 5`, "12"],
  [(t) => `sn 12 ${t} số 5`, "12"],
  [(t) => `${t} số 5 số 12`, "12"],
  [(t) => `số 3 hẻm 45/12 ${t} số 5`, "45/12/3"],
  [(t) => `số 3 ngách 12 ngõ 45 ${t} số 5`, "45/12/3"],
];
const MA_TRAN_TACH = TIEN_TO.flatMap((t) => DANG_SO_NHA.map(([dung, so]) => ({ chu: dung(t), so, duong: `${t} số 5` })));

function kiemTach(tach: BoTach): string[] {
  return MA_TRAN_TACH.flatMap(({ chu, so, duong }) => {
    const r = tach(chu);
    return [...(r.streetNumber === so ? [] : [`số nhà lệch: ${chu}`]), ...(r.streetName === duong ? [] : [`tên đường lệch: ${chu}`])];
  });
}

test("AC-1 tách số nhà trước đường số", () => {
  let soAssert = 0;
  for (const { chu, so, duong } of MA_TRAN_TACH) {
    const r = tachSoNha(chu);
    assert.equal(r.streetNumber, so, `số nhà của «${chu}»`);
    assert.equal(r.streetName, duong, `tên đường của «${chu}»`);
    soAssert += 2;
  }
  assert.equal(MA_TRAN_TACH.length, TIEN_TO.length * DANG_SO_NHA.length);
  assert.equal(soAssert, MA_TRAN_TACH.length * 2, "số assert phải bằng hai lần số dòng ma trận");
  assert.deepEqual(kiemTach(tachSoNha), []);
  console.log(`AC-1: ${MA_TRAN_TACH.length} dòng (${TIEN_TO.length} tiền tố × ${DANG_SO_NHA.length} dạng số nhà), ${soAssert} assert`);
});

test("AC-1 tách số nhà — phá thử: bộ tách trước vá thì đỏ", () => {
  const loi = kiemTach(boTruocVa);
  assert.equal(loi[0], "tên đường lệch: 12 Đường số 5");
  assert.ok(loi.includes("số nhà lệch: Số 12 Đường số 5"), loi.join("\n"));
});

// ---------- AC-2: đường số không kèm số nhà ----------

function kiemKhongSo(tach: BoTach): string[] {
  const loi: string[] = [];
  for (const t of TIEN_TO) {
    const chu = `${t} số 5`;
    const r = tach(chu);
    if (r.streetNumber !== null) loi.push(`có số nhà khi không có: ${chu}`);
    else if (r.streetName !== chu) loi.push(`tên đường lệch: ${chu}`);
  }
  const h = tach("hẻm 45 Đường số 5");
  if (h.streetNumber !== null || h.streetName !== "Đường số 5" || !h.hemKhongSo) loi.push("hẻm không số đọc sai: hẻm 45 Đường số 5");
  return loi;
}

function kiemKhoaKhiThieu(chu: string, kq: KetQuaDiaChi): string[] {
  const dung = kq.khoa === null && kq.trangThai === "thieu" && kq.thieu.length === 1 && kq.thieu[0] === "streetNumber";
  return dung ? [] : [`có khoá khi thiếu số nhà: ${chu}`];
}

test("AC-2 đường số không kèm số nhà", () => {
  assert.deepEqual(kiemKhongSo(tachSoNha), []);
  const chu = `Đường số 5${XA}`;
  const kq = docDiaChi(chu);
  assert.deepEqual(kiemKhoaKhiThieu(chu, kq), []);
  assert.deepEqual(kq.thieu, ["streetNumber"]);
  assert.ok(kq.wardName && "ma" in kq.wardName && kq.wardName.ma === "26743");
  // Đối chứng dương: cùng địa chỉ có số nhà thì chuẩn, có khoá.
  const du = docDiaChi(`12 ${chu}`);
  assert.equal(du.trangThai, "chuan");
  assert.equal(du.khoa, "79|26743|so 5|12");
  console.log(`AC-2: ${TIEN_TO.length} tiền tố không số nhà, 1 hẻm không số, 1 địa chỉ trọn`);
});

test("AC-2 đường số không kèm số nhà — phá thử: bộ tách trước vá và kết quả có khoá thì đỏ", () => {
  assert.equal(kiemKhongSo(boTruocVa)[0], "có số nhà khi không có: Đường số 5");
  const chu = `Đường số 5${XA}`;
  const gia: KetQuaDiaChi = { ...docDiaChi(`12 ${chu}`), unparsedAddress: chu };
  assert.deepEqual(kiemKhoaKhiThieu(chu, gia), [`có khoá khi thiếu số nhà: ${chu}`]);
});

// ---------- AC-3: khác đường khác khoá ----------

const DUONG_SO = [...Array.from({ length: 30 }, (_, i) => `Đường số ${i + 1}`), "Đường số 5A"];
const SO_NHA = ["12", "45/12/3", "7A"];
const MA_TRAN_KHOA = SO_NHA.flatMap((so) => DUONG_SO.map((duong) => ({ so, duong, nhan: `${so} ${duong}` })));

type BoKhoa = (so: string, duong: string) => string | null;
const khoaDoc: BoKhoa = (so, duong) => docDiaChi(`${so} ${duong}${XA}`).khoa;

function kiemKhacDuong(khoa: BoKhoa): string[] {
  const loi: string[] = [];
  const theoKhoa = new Map<string, string>();
  for (const { so, duong, nhan } of MA_TRAN_KHOA) {
    const k = khoa(so, duong);
    if (k === null) {
      loi.push(`không có khoá: ${nhan}`);
      continue;
    }
    const da = theoKhoa.get(k);
    if (da !== undefined) loi.push(`hai đường cùng khoá: ${da} · ${nhan}`);
    else theoKhoa.set(k, nhan);
  }
  return loi;
}

test("AC-3 khác đường khác khoá", () => {
  for (const { so, duong } of MA_TRAN_KHOA) assert.equal(docDiaChi(`${so} ${duong}${XA}`).trangThai, "chuan", `${so} ${duong}`);
  assert.deepEqual(kiemKhacDuong(khoaDoc), []);
  const khoa = new Set(MA_TRAN_KHOA.map(({ so, duong }) => khoaDoc(so, duong)));
  assert.equal(khoa.size, DUONG_SO.length * SO_NHA.length);
  assert.notEqual(khoaDoc("12", "Đường số 5"), khoaDoc("12", "Đường số 7"));
  console.log(`AC-3: ${MA_TRAN_KHOA.length} địa chỉ trọn (${DUONG_SO.length} đường × ${SO_NHA.length} số nhà), ${khoa.size} khoá khác nhau`);
});

test("AC-3 khác đường khác khoá — phá thử: khoá dựng bằng bộ tách trước vá thì đỏ", () => {
  const khoaTruocVa: BoKhoa = (so, duong) => {
    const r = boTruocVa(`${so} ${duong}`);
    return r.streetNumber === null ? null : khoaDiaChi("79", "26743", r.streetName, r.streetNumber);
  };
  const loi = kiemKhacDuong(khoaTruocVa);
  assert.equal(loi[0], "hai đường cùng khoá: 12 Đường số 1 · 12 Đường số 2");
  assert.ok(loi.includes("hai đường cùng khoá: 12 Đường số 1 · 12 Đường số 7"), loi.join("\n"));
});

// ---------- AC-4: cùng đường cùng khoá ----------

const CACH_VIET = ["Đường số 5", "đường Số 5", "ĐƯỜNG SỐ 5", "Đ. số 5", "Đg số 5", "Duong so 5", "Phố số 5", "Đường số5", "Đường số 05"];
const KHOA_DUNG = "79|26743|so 5|12";

function kiemCungDuong(khoa: (chu: string) => string | null): string[] {
  return CACH_VIET.flatMap((cach) => (khoa(`12 ${cach}${XA}`) === KHOA_DUNG ? [] : [`khoá lệch cách viết: ${cach}`]));
}

test("AC-4 cùng đường cùng khoá", () => {
  let soAssert = 0;
  for (const cach of CACH_VIET) {
    const kq = docDiaChi(`12 ${cach}${XA}`);
    assert.equal(kq.trangThai, "chuan", cach);
    assert.equal(kq.khoa, KHOA_DUNG, cach);
    soAssert++;
  }
  assert.equal(soAssert, CACH_VIET.length);
  assert.deepEqual(kiemCungDuong((chu) => docDiaChi(chu).khoa), []);
  // Tên không có chữ «số» giữ như cũ — «Đường 5» chưa coi là cùng đường với «Đường số 5» (Out of scope).
  assert.equal(tenDuongChuan("Đường 5"), "5");
  assert.equal(tenDuongChuan("Đường 3 Tháng 2"), "3 thang 2");
  assert.equal(tenDuongChuan("Đường 30/4"), "30/4");
  assert.equal(tenDuongChuan("Đường Mẫu 1"), "mau 1");
  console.log(`AC-4: ${CACH_VIET.length} cách viết cùng khoá ${KHOA_DUNG}, 4 tên không phải đường số`);
});

test("AC-4 cùng đường cùng khoá — phá thử: chuẩn hoá tên đường chỉ bỏ tiền tố (luật hàng 75) thì đỏ", () => {
  const tenCu = (ten: string) => {
    const tu = dangSo(ten).split(" ").filter(Boolean);
    if (tu.length > 1 && ["duong", "pho", "d", "dg"].includes(tu[0]!)) tu.shift();
    return tu.join(" ");
  };
  const khoaCu = (chu: string) => {
    const kq = docDiaChi(chu);
    const xa = kq.wardName && "ma" in kq.wardName ? kq.wardName.ma : null;
    return kq.stateOrProvince && xa && kq.streetName && kq.streetNumber ? `${kq.stateOrProvince.ma}|${xa}|${tenCu(kq.streetName)}|${kq.streetNumber}` : null;
  };
  assert.deepEqual(kiemCungDuong(khoaCu), ["khoá lệch cách viết: Đường số5", "khoá lệch cách viết: Đường số 05"]);
});

// ---------- AC-5: khoá cũ của bộ thử hàng 73 không đổi ----------

type DongAnh = { ma: string; streetNumber: string | null; streetName: string | null; tenDuongChuan: string | null; khoa: string | null; trangThai: string };
const ANH: { sha: string; dong: DongAnh[] } = JSON.parse(readFileSync(fileURLToPath(new URL("./anh-truoc-va.json", import.meta.url)), "utf8"));
const DAP_AN: { ma: string; chu: string }[] = JSON.parse(
  readFileSync(fileURLToPath(new URL("../../../db/seed/mau-thap-tang/dap-an-thap-tang.json", import.meta.url)), "utf8"),
).diaChi;

const TRUONG = ["streetNumber", "streetName", "tenDuongChuan", "khoa", "trangThai"] as const;
function dongSauVa(chu: string, ma: string): DongAnh {
  const kq = docDiaChi(chu);
  return { ma, streetNumber: kq.streetNumber, streetName: kq.streetName, tenDuongChuan: kq.streetName === null ? null : tenDuongChuan(kq.streetName), khoa: kq.khoa, trangThai: kq.trangThai };
}
function kiemAnh(anh: DongAnh[]): string[] {
  const chu = new Map(DAP_AN.map((c) => [c.ma, c.chu]));
  return anh.flatMap((d) => {
    const c = chu.get(d.ma);
    if (c === undefined) return [`ảnh có mã ngoài bộ thử: ${d.ma}`];
    const sau = dongSauVa(c, d.ma);
    return TRUONG.filter((k) => sau[k] !== d[k]).map((k) => `đổi so với trước vá: ${d.ma}: ${k}`);
  });
}

test("AC-5 khoá cũ không đổi", () => {
  assert.equal(ANH.dong.length, 86);
  assert.deepEqual(ANH.dong.map((d) => d.ma).sort(), DAP_AN.map((c) => c.ma).sort());
  assert.match(ANH.sha, /^[0-9a-f]{40}$/);
  assert.deepEqual(kiemAnh(ANH.dong), []);
  console.log(`AC-5: ${ANH.dong.length} cách viết so với ảnh trước vá (sha ${ANH.sha.slice(0, 8)})`);
});

test("AC-5 khoá cũ không đổi — phá thử: ảnh bản sao đổi khoá DC-001 thì đỏ", () => {
  const anh = structuredClone(ANH.dong);
  anh[0]!.khoa = "79|26740|mau 1|46";
  assert.deepEqual(kiemAnh(anh), ["đổi so với trước vá: DC-001: khoa"]);
});

// ---------- AC-6: chữ cái «D» đứng một mình không phải tiền tố đường ----------

const LO_D = ["Lô D số 12 Nguyễn Trãi", "Khu D số 12 Nguyễn Trãi", "Block D, số 12 Nguyễn Trãi", "lô d số 12 Nguyễn Trãi"];
const VIET_TAT_D = ["Đ. số 5", "Đ số 5", "đ số 5"];

function kiemLoD(tach: BoTach): string[] {
  const loi: string[] = [];
  for (const chu of LO_D) {
    const r = tach(chu);
    const cu = boTruocVa(chu);
    if (r.streetNumber !== "12" || r.streetName !== cu.streetName) loi.push(`mất số nhà sau chữ D: ${chu}`);
  }
  for (const duong of VIET_TAT_D) {
    const r = tach(`12 ${duong}`);
    if (r.streetNumber !== "12" || r.streetName !== duong) loi.push(`viết tắt «đ» không còn là tên đường: ${duong}`);
  }
  return loi;
}

test("AC-6 chữ cái D đứng một mình không phải tiền tố đường", () => {
  assert.deepEqual(kiemLoD(tachSoNha), []);
  const kq = docDiaChi(`Lô D số 12 Nguyễn Trãi${XA}`);
  assert.equal(kq.streetNumber, "12");
  assert.equal(kq.trangThai, "chuan");
  console.log(`AC-6: ${LO_D.length} địa chỉ lô/khu/block D, ${VIET_TAT_D.length} viết tắt «đ»`);
});

test("AC-6 chữ cái D — phá thử: bộ tách nhận mọi «d» là tiền tố thì đỏ", () => {
  const boNhanMoiD: BoTach = (phan) => tachSoNhaVoi(phan, (t) => ["duong", "pho", "d", "dg"].includes(t));
  assert.deepEqual(kiemLoD(boNhanMoiD), LO_D.map((c) => `mất số nhà sau chữ D: ${c}`));
});
