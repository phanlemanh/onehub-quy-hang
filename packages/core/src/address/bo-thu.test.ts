// Bộ địa chỉ thử có đáp án của hàng 73 (hàng 75, hồ sơ dia-chi-chuan) — E1, E2, E3, E5.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { khoaDiaChi, tenDuongChuan } from "./chuan-hoa";
import { DANH_MUC_DON_VI_HANH_CHINH as DM, type DanhMucDonViHanhChinh } from "./danh-muc";
import { docDiaChi, type KetQuaDiaChi } from "./doc-dia-chi";

/** Vật của hàng 73, đường suy từ vị trí tệp này (packages/core/src/address). */
const THU_MUC = fileURLToPath(new URL("../../../db/seed/mau-thap-tang/", import.meta.url));

type DapAnWard = string | { canNguoiChon: true; ungVien: string[] };
type CachViet = {
  ma: string;
  kieu: string[];
  chu: string;
  canDich: string;
  dapAn: { stateOrProvince: string; wardName: DapAnWard; streetName: string; streetNumber: string | null; thieu: string[] };
};
type DiaChiCan = { stateOrProvince: string; wardName: string; streetName: string; streetNumber: string };

const DAP_AN: CachViet[] = JSON.parse(readFileSync(`${THU_MUC}dap-an-thap-tang.json`, "utf8")).diaChi;
const CAN: { ma: string; diaChi: DiaChiCan }[] = JSON.parse(readFileSync(`${THU_MUC}du-lieu-mau-thap-tang.json`, "utf8")).canNgoaiKhu;

type BoDungKhoa = (maTinh: string, maXa: string, duong: string, so: string) => string;

/** Khoá dựng từ địa chỉ chuẩn của căn trong bộ dữ liệu — mã tra qua danh mục lõi, không qua chuỗi viết. */
function khoaCuaCan(d: DiaChiCan, dung: BoDungKhoa = khoaDiaChi): string {
  const tinh = DM.tinh.find((t) => t.ten === d.stateOrProvince);
  const xa = DM.xa.find((x) => x.ten === d.wardName && x.maTinh === tinh?.ma);
  assert.ok(tinh && xa, `căn có tỉnh/xã ngoài danh mục: ${d.stateOrProvince} / ${d.wardName}`);
  return dung(tinh.ma, xa.ma, d.streetName, d.streetNumber);
}

const KHOA_CAN = new Map(CAN.map((c) => [c.ma, khoaCuaCan(c.diaChi)]));
const duPhan = (c: CachViet) => typeof c.dapAn.wardName === "string" && c.dapAn.thieu.length === 0;
type Doc = { cach: CachViet; kq: KetQuaDiaChi };
const docHet = (ds: CachViet[], dm?: DanhMucDonViHanhChinh): Doc[] => ds.map((cach) => ({ cach, kq: docDiaChi(cach.chu, dm) }));

/** AC-1: cách viết đủ phần phải ra đúng khoá của căn đích. */
function kiemKhoaTheoCan(ds: Doc[]): string[] {
  return ds.filter((d) => duPhan(d.cach)).flatMap((d) => (d.kq.khoa !== null && d.kq.khoa === KHOA_CAN.get(d.cach.canDich) ? [] : [`khoá lệch căn đích: ${d.cach.ma}`]));
}

/** AC-2: hai căn khác nhau không cùng khoá; cách viết chưa đủ phần không có khoá. */
function kiemKhacNhaKhacKhoa(ds: Doc[], khoaCan: Map<string, string>): string[] {
  const loi: string[] = [];
  const nhom = new Map<string, Set<string>>();
  for (const [ma, k] of khoaCan) nhom.set(k, (nhom.get(k) ?? new Set()).add(ma));
  for (const d of ds) if (d.kq.khoa) nhom.set(d.kq.khoa, (nhom.get(d.kq.khoa) ?? new Set()).add(d.cach.canDich));
  for (const can of nhom.values()) {
    const ds2 = [...can].sort();
    for (let i = 0; i < ds2.length; i++) for (let j = i + 1; j < ds2.length; j++) loi.push(`hai căn cùng khoá: ${ds2[i]}, ${ds2[j]}`);
  }
  for (const d of ds) {
    const chuaDu = d.cach.kieu.includes("thieu-so-nha") || d.cach.kieu.includes("phuong-cu-tach");
    if (chuaDu && d.kq.khoa !== null) loi.push(`có khoá khi chưa đủ phần: ${d.cach.ma}`);
  }
  return loi;
}

const trangThaiDapAn = (c: CachViet) => (c.dapAn.thieu.length > 0 ? "thieu" : typeof c.dapAn.wardName === "object" ? "can-nguoi-chon" : "chuan");
const tap = (xs: readonly string[]) => [...new Set(xs)].sort().join("|");

/** AC-3: mỗi cách viết khớp đáp án từng phần. */
function kiemDapAn(ds: Doc[]): string[] {
  const loi: string[] = [];
  for (const { cach, kq } of ds) {
    const lech = (phan: string) => loi.push(`lệch đáp án ${cach.ma}: ${phan}`);
    if (kq.stateOrProvince?.ten !== cach.dapAn.stateOrProvince) lech("stateOrProvince");
    const w = cach.dapAn.wardName;
    if (typeof w === "string") {
      if (!kq.wardName || "canNguoiChon" in kq.wardName || kq.wardName.ten !== w) lech("wardName");
    } else if (!kq.wardName || !("canNguoiChon" in kq.wardName) || tap(kq.wardName.ungVien.map((u) => u.ten)) !== tap(w.ungVien)) {
      lech("wardName");
    }
    if (kq.streetNumber !== cach.dapAn.streetNumber) lech("streetNumber");
    if (tenDuongChuan(kq.streetName ?? "") !== tenDuongChuan(cach.dapAn.streetName)) lech("streetName");
    if (tap(kq.thieu) !== tap(cach.dapAn.thieu)) lech("thieu");
    if (kq.unparsedAddress !== cach.chu) lech("unparsedAddress");
    if (kq.trangThai !== trangThaiDapAn(cach)) lech("trangThai");
  }
  return loi;
}

/** AC-5: phường cũ bị tách → cần người chọn, ứng viên đúng các xã nhận nó, không khoá, không chọn hộ. */
function kiemTach(kq: KetQuaDiaChi, tenCu: string, dm: DanhMucDonViHanhChinh = DM): string[] {
  const cu = dm.xaCu.find((x) => x.ten === tenCu)!;
  const w = kq.wardName;
  const dung = w !== null && "canNguoiChon" in w && w.tenCu === tenCu && tap(w.ungVien.map((u) => u.ma)) === tap(cu.vao) && kq.khoa === null && kq.trangThai === "can-nguoi-chon";
  return dung ? [] : [`chọn hộ khi bị tách: ${tenCu}`];
}

test("AC-1 cùng nhà cùng khoá", () => {
  const ds = docHet(DAP_AN.filter(duPhan));
  assert.ok(ds.length > 0);
  assert.deepEqual(new Set(ds.map((d) => d.cach.canDich)), new Set(CAN.map((c) => c.ma)), "mỗi căn phải có ≥1 cách viết đủ phần");
  console.log(`AC-1: ${ds.length} cách viết đủ phần của ${CAN.length} căn`);
  assert.deepEqual(kiemKhoaTheoCan(ds), []);
  for (const can of CAN) assert.equal(new Set(ds.filter((d) => d.cach.canDich === can.ma).map((d) => d.kq.khoa)).size, 1, `mọi cách viết của ${can.ma} phải cùng một khoá`);
});

test("AC-1 cùng nhà cùng khoá — phá thử: đổi số nhà trong chữ mà giữ căn đích thì đỏ", () => {
  const sua = DAP_AN.map((c) => (c.ma === "DC-011" ? { ...c, chu: c.chu.replace("45/12", "45/13") } : c));
  assert.deepEqual(kiemKhoaTheoCan(docHet(sua.filter(duPhan))), ["khoá lệch căn đích: DC-011"]);
});

test("AC-2 khác nhà khác khoá", () => {
  assert.equal(new Set(KHOA_CAN.values()).size, CAN.length, "khoá của các căn phải đôi một khác nhau");
  const ds = docHet(DAP_AN);
  assert.deepEqual(kiemKhacNhaKhacKhoa(ds, KHOA_CAN), []);
  for (const [a, b] of [["NK-01", "NK-02"], ["NK-03", "NK-04"]] as const) assert.notEqual(KHOA_CAN.get(a), KHOA_CAN.get(b), `cặp gần trùng ${a}/${b}`);
  for (const kieu of ["thieu-so-nha", "phuong-cu-tach"]) {
    const nhom = ds.filter((d) => d.cach.kieu.includes(kieu));
    assert.ok(nhom.length > 0, `bộ thử phải có kiểu ${kieu}`);
    for (const d of nhom) assert.equal(d.kq.khoa, null, `${d.cach.ma} (${kieu}) không được có khoá`);
  }
});

test("AC-2 khác nhà khác khoá — phá thử: khoá bỏ số nhà, ép khoá cho cách viết thiếu số", () => {
  const boSoNha: BoDungKhoa = (t, x, duong) => `${t}|${x}|${tenDuongChuan(duong)}`;
  const khoaSai = new Map(CAN.map((c) => [c.ma, khoaCuaCan(c.diaChi, boSoNha)]));
  assert.ok(kiemKhacNhaKhacKhoa([], khoaSai).includes("hai căn cùng khoá: NK-01, NK-02"));
  const ep = docHet(DAP_AN.filter((c) => c.ma === "DC-005")).map((d) => ({ ...d, kq: { ...d.kq, khoa: "79|26740|mau 1|?" } }));
  assert.deepEqual(kiemKhacNhaKhacKhoa(ep, KHOA_CAN), ["có khoá khi chưa đủ phần: DC-005"]);
});

test("AC-3 khớp đáp án", () => {
  const ds = docHet(DAP_AN);
  assert.equal(ds.length, DAP_AN.length);
  console.log(`AC-3: so ${ds.length}/${DAP_AN.length} cách viết với đáp án`);
  assert.deepEqual(kiemDapAn(ds), []);
});

test("AC-3 khớp đáp án — phá thử: đáp án bản sao lệch thì đỏ đúng phần", () => {
  const sua = structuredClone(DAP_AN);
  sua.find((c) => c.ma === "DC-001")!.dapAn.wardName = "Tân Định";
  sua.find((c) => c.ma === "DC-005")!.dapAn.thieu = [];
  assert.deepEqual(kiemDapAn(docHet(sua)), ["lệch đáp án DC-001: wardName", "lệch đáp án DC-005: thieu", "lệch đáp án DC-005: trangThai"]);
});

test("AC-5 tên cũ bị tách", () => {
  const tach = DM.xaCu.filter((x) => x.vao.length >= 2);
  assert.deepEqual(tach.map((x) => x.ten).sort(), ["Cầu Ông Lãnh", "Nguyễn Thái Bình", "Đa Kao"].sort());
  for (const cu of tach) assert.deepEqual(kiemTach(docDiaChi(`45 Đường Mẫu 1, Phường ${cu.ten}, ${cu.huyenCu}, TP.HCM`), cu.ten), []);
  const cachViet = DAP_AN.filter((c) => c.kieu.includes("phuong-cu-tach"));
  assert.equal(cachViet.length, 14);
  for (const c of cachViet) {
    const tenCu = /Phường ([^,]+),/.exec(c.chu)![1]!;
    assert.deepEqual(kiemTach(docDiaChi(c.chu), tenCu), [], c.ma);
  }
});

test("AC-5 tên cũ bị tách — phá thử: chọn hộ thì đỏ; danh mục bản sao không tách thì đọc thẳng", () => {
  const kq = docDiaChi("45 Đường Mẫu 1, Phường Đa Kao, Quận 1, TP.HCM");
  const chonHo: KetQuaDiaChi = { ...kq, wardName: { ma: "26740", ten: "Sài Gòn" }, trangThai: "chuan" };
  assert.deepEqual(kiemTach(chonHo, "Đa Kao"), ["chọn hộ khi bị tách: Đa Kao"]);
  const dm = structuredClone(DM) as DanhMucDonViHanhChinh;
  (dm.xaCu.find((x) => x.ten === "Đa Kao") as unknown as { vao: string[] }).vao = ["26740"];
  const thang = docDiaChi("45 Đường Mẫu 1, Phường Đa Kao, Quận 1, TP.HCM", dm);
  assert.equal(thang.trangThai, "chuan");
  assert.deepEqual(thang.wardName, { ma: "26740", ten: "Sài Gòn", tuTenCu: "Đa Kao" });
});
