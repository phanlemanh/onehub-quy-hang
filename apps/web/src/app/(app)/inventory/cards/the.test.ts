// Bảng hàng dạng thẻ (hàng 32) — E1 (lọc nhu cầu), E2 (căn lên thẻ, nhóm toà), E3 (chọn được), E6 (thẻ lọc). Dữ liệu:
// 40 hàng mẫu của hàng 5 ghép danh mục của chính gói ấy bằng `ghepDanhMuc`; đáp án đếm viết bằng vòng for riêng ở đây,
// không gọi hàm đang đo.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import type { CatalogData } from "@quy-hang/core";
import type { StandardStatus } from "@quy-hang/core/listing";
import type { ListingView } from "@/lib/sync/types";
import type { DongBang } from "../cot";
import { chiMuc, ghepDanhMuc } from "../ghep-danh-muc";
import {
  NHU_CAU_RONG,
  batDauChon,
  boTheLoc,
  chonDuoc,
  doiChon,
  giuChonHopLe,
  lenThe,
  locNhuCau,
  luaChonNhuCau,
  nhomTheoToa,
  phang,
  theLoc,
  type NhuCau,
} from "./the";

type HangMau = { ma: string; maCan: string; trangThai: StandardStatus; gia: number; dieuKienPhi: string };
const goi = JSON.parse(readFileSync(fileURLToPath(new URL("../../../../../../../packages/db/seed/mau/du-lieu-mau.json", import.meta.url)), "utf8")) as {
  danhMuc: CatalogData;
  hang: HangMau[];
};
const idx = chiMuc(goi.danhMuc);
const toaCua = new Map(goi.danhMuc.subdivisions.flatMap((p) => p.buildings.flatMap((b) => b.units.map((u) => [u.unitNumber, b.buildingName] as const))));

/** Hàng trên máy như API trả (không trường nguồn), qua chính bộ ghép của Bảng hàng. */
function hang(h: HangMau): ListingView {
  return {
    id: h.ma,
    buildingName: toaCua.get(h.maCan)!,
    unitNumber: h.maCan,
    standardStatus: h.trangThai,
    listPrice: h.gia,
    feeInclusion: h.dieuKienPhi === "bao_phi" ? "included" : "excluded",
    furnished: null,
    legalStatus: null,
    financing: null,
    occupantType: null,
    closePrice: null,
    closeDate: null,
    withdrawnReason: null,
  } as unknown as ListingView;
}
/** Bộ mẫu chỉ có hai toà: bản sao ba căn đầu của Toà B sang «Toà C» để ca «hai toà» phân biệt được. */
const GHEP = goi.hang.map((h) => ghepDanhMuc(hang(h), idx));
const DONG: DongBang[] = [...GHEP, ...GHEP.filter((d) => d.buildingName === "Toà B").slice(0, 3).map((d) => ({ ...d, id: `${d.id}-C`, buildingName: "Toà C" }))];
const nc = (o: Partial<NhuCau>): NhuCau => ({ ...NHU_CAU_RONG, ...o });

/** Đáp án viết tay: đếm bằng vòng for trên chính trường của dòng, không qua hàm lọc. */
function dem(dk: (d: DongBang) => boolean): number {
  let n = 0;
  for (const d of DONG) if (dk(d)) n++;
  return n;
}
const ty = (d: DongBang) => (d.listPrice ?? NaN) / 1e9;

// ---- E2: căn lên thẻ ------------------------------------------------------------------------------------------------
const MA_TRAN_TRANG_THAI: [StandardStatus, boolean, boolean][] = [
  // [trạng thái, lên thẻ, chọn được]
  ["Incomplete", false, false],
  ["Active", true, true],
  ["Pending", true, false],
  ["Closed", false, false],
  ["Hold", false, false],
  ["Withdrawn", false, false],
];

test("căn lên thẻ: đúng Đang bán và Đang giao dịch (sáu trạng thái)", () => {
  for (const [s, len] of MA_TRAN_TRANG_THAI) assert.equal(lenThe(s), len, `lenThe(${s})`);
});

test("căn lên thẻ — đối chứng đỏ: bản nhận thêm Hold trượt ma trận và gọi tên Hold", () => {
  const sai = (s: StandardStatus) => lenThe(s) || s === "Hold";
  const truot = MA_TRAN_TRANG_THAI.filter(([s, len]) => sai(s) !== len).map(([s]) => s);
  assert.deepEqual(truot, ["Hold"]);
});

test("nhóm theo toà: dòng nhóm, số căn, thứ tự giữ nguyên, mảng phẳng", () => {
  const len = DONG.filter((d) => lenThe(d.standardStatus));
  const nhom = nhomTheoToa(len);
  const toaMongDoi = [...new Set(len.map((d) => d.buildingName))];
  assert.deepEqual(nhom.map((n) => n.toa), toaMongDoi);
  for (const n of nhom) {
    let so = 0;
    for (const d of len) if (d.buildingName === n.toa) so++;
    assert.equal(n.dong.length, so, `số căn ${n.toa}`);
    assert.deepEqual(n.dong.map((d) => d.id), len.filter((d) => d.buildingName === n.toa).map((d) => d.id), `thứ tự ${n.toa}`);
  }
  assert.equal(nhom.reduce((s, n) => s + n.dong.length, 0), len.length);
  const ds = phang(nhom);
  assert.equal(ds[0]?.kind, "nhom");
  let toaHienTai = "";
  for (const r of ds) {
    if (r.kind === "nhom") toaHienTai = r.toa;
    else assert.equal(r.d.buildingName, toaHienTai, `thẻ ${r.d.id} đứng sau dòng nhóm của toà mình`);
  }
});

// ---- E3: chọn được ---------------------------------------------------------------------------------------------------
const mau = (s: StandardStatus, id = `x-${s}`): DongBang => ({ ...DONG[0]!, id, standardStatus: s });

test("chọn được: chỉ Đang bán (sáu trạng thái)", () => {
  for (const [s, , chon] of MA_TRAN_TRANG_THAI) assert.equal(chonDuoc(mau(s)), chon, `chonDuoc(${s})`);
});

test("chọn: tích, bỏ, căn Đang giao dịch không đổi tập, giữ lâu căn Đang giao dịch không vào chế độ chọn", () => {
  const a = mau("Active", "a");
  const p = mau("Pending", "p");
  let chon = doiChon(new Set(), a);
  assert.deepEqual([...chon], ["a"]);
  assert.deepEqual([...doiChon(chon, p)], ["a"], "tích căn Đang giao dịch không đổi tập");
  chon = doiChon(chon, a);
  assert.equal(chon.size, 0);
  assert.deepEqual([...(batDauChon(a) ?? [])], ["a"]);
  assert.equal(batDauChon(p), null);
  assert.deepEqual([...giuChonHopLe(new Set(["a", "p", "khong-co"]), [a, p])], ["a"]);
});

test("chọn — đối chứng đỏ: chonDuoc cho cả Đang giao dịch thì tích được căn Đang giao dịch", () => {
  const p = mau("Pending", "p");
  const doiChonSai = (chon: ReadonlySet<string>, d: DongBang) => {
    const m = new Set(chon);
    if (d.standardStatus === "Active" || d.standardStatus === "Pending") m.add(d.id);
    return m;
  };
  assert.throws(() => assert.deepEqual([...doiChonSai(new Set(), p)], [], "Đang giao dịch"), /Đang giao dịch/);
});

// ---- E1: lọc nhu cầu — ma trận năm mục × hai ca ----------------------------------------------------------------------
const MA_TRAN_LOC: [string, NhuCau, (d: DongBang) => boolean][] = [
  ["Giá 2–5 tỷ", nc({ giaTu: "2", giaDen: "5" }), (d) => ty(d) >= 2 && ty(d) <= 5],
  ["Giá từ 6 tỷ", nc({ giaTu: "6" }), (d) => ty(d) >= 6],
  ["Phòng ngủ 2PN", nc({ phongNgu: ["2PN"] }), (d) => d.unitType === "2PN"],
  ["Phòng ngủ Studio + 3PN", nc({ phongNgu: ["Studio", "3PN"] }), (d) => d.unitType === "Studio" || d.unitType === "3PN"],
  ["Toà một toà", nc({ toa: ["Toà A"] }), (d) => d.buildingName === "Toà A"],
  ["Toà hai toà", nc({ toa: ["Toà A", "Toà C"] }), (d) => d.buildingName === "Toà A" || d.buildingName === "Toà C"],
  ["Diện tích 50–80", nc({ dtTu: "50", dtDen: "80" }), (d) => d.livingArea !== null && d.livingArea >= 50 && d.livingArea <= 80],
  ["Diện tích đến 60", nc({ dtDen: "60" }), (d) => d.livingArea !== null && d.livingArea <= 60],
  ["Hướng một hướng", nc({ huong: ["Nam"] }), (d) => d.directionFaces === "Nam"],
  ["Hướng hai hướng", nc({ huong: ["Nam", "Đông Nam"] }), (d) => d.directionFaces === "Nam" || d.directionFaces === "Đông Nam"],
];

for (const [ten, nhuCau, dk] of MA_TRAN_LOC) {
  test(`lọc nhu cầu — ma trận năm mục: ${ten}`, () => {
    const mong = dem(dk);
    assert.ok(mong > 0 && mong < DONG.length, `ca ${ten} phải phân biệt (đáp án ${mong})`);
    assert.equal(locNhuCau(DONG, nhuCau).length, mong, ten);
  });
}

test("lọc nhu cầu: giao ba mục, nhu cầu rỗng, đổi chỗ từ–đến, giá gõ «2,5»", () => {
  const ba = nc({ giaTu: "3", giaDen: "6", phongNgu: ["2PN"], toa: ["Toà B"] });
  assert.equal(locNhuCau(DONG, ba).length, dem((d) => ty(d) >= 3 && ty(d) <= 6 && d.unitType === "2PN" && d.buildingName === "Toà B"));
  assert.equal(locNhuCau(DONG, NHU_CAU_RONG).length, DONG.length);
  assert.equal(locNhuCau(DONG, nc({ giaTu: "5", giaDen: "2" })).length, dem((d) => ty(d) >= 2 && ty(d) <= 5));
  assert.equal(locNhuCau(DONG, nc({ giaDen: "2,5" })).length, dem((d) => ty(d) <= 2.5));
  assert.equal(locNhuCau(DONG, nc({ giaDen: "2.5" })).length, dem((d) => ty(d) <= 2.5));
});

test("lọc nhu cầu: căn thiếu giá trị không khớp mục đang lọc, «Chưa rõ» chọn được ở Phòng ngủ", () => {
  const goc = DONG.find((d) => d.listPrice !== null && ty(d) >= 2 && ty(d) <= 5 && d.livingArea === 75 && d.directionFaces === "Tây Bắc")!;
  const thieuGia = { ...goc, id: "thieu-gia", listPrice: null };
  const thieuDt = { ...goc, id: "thieu-dt", livingArea: null };
  const thieuHuong = { ...goc, id: "thieu-huong", directionFaces: null };
  const chuaRo = { ...goc, id: "chua-ro", unitType: "Chưa rõ" };
  const ban = [thieuGia, thieuDt, thieuHuong, chuaRo];
  const ids = (n: NhuCau) => locNhuCau(ban, n).map((d) => d.id);
  assert.ok(!ids(nc({ giaTu: "2", giaDen: "5" })).includes("thieu-gia"), "thiếu giá");
  assert.ok(!ids(nc({ dtTu: "50", dtDen: "80" })).includes("thieu-dt"), "thiếu diện tích");
  assert.ok(!ids(nc({ huong: ["Tây Bắc"] })).includes("thieu-huong"), "thiếu hướng");
  assert.deepEqual(ids(nc({ phongNgu: ["Chưa rõ"] })), ["chua-ro"], "«Chưa rõ»");
  assert.equal(ids(NHU_CAU_RONG).length, 4, "mục không lọc thì căn thiếu giá trị vẫn hiện");
});

test("lọc nhu cầu — đối chứng đỏ: bản bỏ điều kiện Hướng trượt ca Hướng", () => {
  const [ten, nhuCau, dk] = MA_TRAN_LOC.find(([t]) => t === "Hướng một hướng")!;
  assert.throws(() => assert.equal(locNhuCau(DONG, nhuCau, { huong: true }).length, dem(dk), ten), /Hướng/);
});

test("lựa chọn của ba mục nhiều giá trị: có trong dữ liệu, phòng ngủ theo số", () => {
  const lc = luaChonNhuCau(DONG);
  assert.deepEqual(lc.phongNgu, ["1PN", "2PN", "3PN"]);
  assert.deepEqual(lc.toa, ["Toà A", "Toà B", "Toà C"]);
  assert.ok(lc.huong.includes("Đông Nam") && lc.huong.includes("Tây Bắc"));
});

// ---- E6: thẻ lọc ------------------------------------------------------------------------------------------------------
const DU = nc({ giaTu: "2", giaDen: "5", phongNgu: ["2PN"], toa: ["Toà A"], dtTu: "50", dtDen: "80", huong: ["Đông Nam", "Nam"] });

test("thẻ lọc: chữ và thứ tự Giá · Phòng ngủ · Toà · Diện tích · Hướng", () => {
  assert.deepEqual(theLoc(DU).map((t) => t.chu), ["2–5 tỷ", "2PN", "Toà A", "50–80 m²", "Đông Nam", "Nam"]);
  assert.deepEqual(theLoc(nc({ giaTu: "6" })).map((t) => t.chu), ["Từ 6 tỷ"]);
  assert.deepEqual(theLoc(nc({ giaDen: "5", dtTu: "50" })).map((t) => t.chu), ["Đến 5 tỷ", "Từ 50 m²"]);
  assert.deepEqual(theLoc(nc({ dtDen: "60", giaTu: "2,5", giaDen: "4" })).map((t) => t.chu), ["2,5–4 tỷ", "Đến 60 m²"]);
  const khoa = theLoc(DU).map((t) => t.khoa);
  assert.equal(new Set(khoa).size, khoa.length, "khoá riêng");
  assert.deepEqual(theLoc(NHU_CAU_RONG), []);
});

test("thẻ lọc: bỏ một thẻ chỉ bỏ đúng mục / giá trị ấy; bỏ hết ra nhu cầu rỗng", () => {
  assert.deepEqual(boTheLoc(DU, "huong:Đông Nam"), { ...DU, huong: ["Nam"] }, "bỏ một hướng trong hai");
  assert.deepEqual(boTheLoc(DU, "gia"), { ...DU, giaTu: undefined, giaDen: undefined });
  assert.deepEqual(boTheLoc(DU, "toa:Toà A"), { ...DU, toa: [] });
  let n = DU;
  for (const t of theLoc(DU)) n = boTheLoc(n, t.khoa);
  assert.deepEqual(theLoc(n), []);
  assert.equal(locNhuCau(DONG, n).length, DONG.length);
});

test("thẻ lọc — đối chứng đỏ: bản bỏ cả mục khi bỏ một giá trị trượt ca «bỏ một hướng trong hai»", () => {
  const boSai = (x: NhuCau, khoa: string) => (khoa.startsWith("huong:") ? { ...x, huong: [] } : boTheLoc(x, khoa));
  assert.throws(() => assert.deepEqual(boSai(DU, "huong:Đông Nam"), { ...DU, huong: ["Nam"] }, "bỏ một hướng trong hai"), /bỏ một hướng trong hai/);
});
