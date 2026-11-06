// Danh mục xã đầy đủ (hàng danh-muc-xa-day-du) — E1…E9. Mỗi phép đo là một hàm kiểm thuần trả danh sách lỗi: vật lành ra
// rỗng, bản sao bị phá ra đúng thông điệp ghim. Ma trận rút từ danh mục theo luật viết trước (mã nhỏ nhất), số dòng in ra.
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import path from "node:path";
import { test } from "node:test";
import { fileURLToPath, pathToFileURL } from "node:url";
import { dangSo } from "./chuan-hoa";
import {
  DANH_MUC_DON_VI_HANH_CHINH as DM,
  doiChieuBangTrich,
  kiemDanhMuc,
  type BangTrichHang73,
  type DanhMucDonViHanhChinh,
  type DonViCapTinh,
  type DonViCapXa,
  type DonViCapXaCu,
} from "./danh-muc";
import { docDiaChi, type KetQuaDiaChi } from "./doc-dia-chi";
import { docDiaChiVoi } from "./doc-dia-chi-loi";
import { giaiZip } from "./nguon/doc-tep";
import {
  sinhBangChuyenDoi,
  sinhBangXa,
  sinhTuTep,
  SUA_NGUON,
  TEP_CHUYEN_DOI,
  TEP_XA,
  THU_MUC_DU_LIEU,
  THU_MUC_NGUON,
  tinhTheoXml,
  type DongXa,
  type DongXaCu,
  type DongTinhCu,
  type MaSua,
} from "./nguon/sinh-danh-muc";

const XML = readFileSync(path.join(THU_MUC_NGUON, TEP_XA), "utf8");
const XLSX = readFileSync(path.join(THU_MUC_NGUON, TEP_CHUYEN_DOI));
const docDuLieu = (t: string) => readFileSync(path.join(THU_MUC_DU_LIEU, t), "utf8");
const SINH = sinhTuTep();
const banSao = (): DanhMucDonViHanhChinh => structuredClone(DM) as DanhMucDonViHanhChinh;

/** Số ghim viết trước — đo trên tệp nguồn Cục Thống kê ngày 06/11/2026 (design.md, sổ quyết định). */
const GHIM = { xa: 3321, loai: { Xã: 2599, Phường: 709, "Đặc khu": 13 }, hcm: 168, dong: 10571, maCu: 10033, tach: 441 };

// ---------- AC-1 ----------

/** Kiểm bảng xã so với tệp nguồn XML. */
function kiemBangXa(bang: readonly DongXa[], xml: string, bangCommit: string): string[] {
  const loi: string[] = [];
  const maNguon = new Set(sinhBangXa(xml).map((x) => x.ma));
  const maBang = new Set<string>();
  for (const x of bang) {
    if (!/^\d{5}$/.test(x.ma)) loi.push(`mã xã sai khuôn: ${x.ma}`);
    if (maBang.has(x.ma)) loi.push(`mã xã trùng: ${x.ma}`);
    maBang.add(x.ma);
  }
  for (const m of [...maNguon].sort()) if (!maBang.has(m)) loi.push(`thiếu mã xã nguồn: ${m}`);
  const commit = new Map((JSON.parse(bangCommit) as DongXa[]).map((x) => [x.ma, JSON.stringify(x)]));
  for (const x of bang) if (commit.get(x.ma) !== JSON.stringify(x)) loi.push(`bảng xã lệch bộ sinh: ${x.ma}`);
  return [...new Set(loi)];
}

test("AC-1 bảng xã sinh từ nguồn", () => {
  const bang = JSON.parse(docDuLieu("xa.json")) as DongXa[];
  assert.equal(SINH.xa, docDuLieu("xa.json"), "bảng xã phải trùng từng byte với bộ sinh");
  assert.deepEqual(kiemBangXa(bang, XML, docDuLieu("xa.json")), []);
  const demTable = (XML.match(/<TABLE\b/g) ?? []).length;
  assert.equal(demTable, GHIM.xa, "đếm TABLE độc lập trên XML thô");
  assert.equal(bang.length, GHIM.xa);
  const dem: Record<string, number> = {};
  for (const x of bang) dem[x.loai] = (dem[x.loai] ?? 0) + 1;
  const demNguon: Record<string, number> = {};
  for (const m of XML.matchAll(/<LoaiHinh>([^<]*)<\/LoaiHinh>/g)) demNguon[m[1]!.trim()] = (demNguon[m[1]!.trim()] ?? 0) + 1;
  assert.deepEqual(dem, demNguon, "đếm loại bằng đếm của tệp nguồn");
  assert.deepEqual(dem, GHIM.loai, "đếm loại bằng số ghim");
  const maTinh = new Set(DM.tinh.map((t) => t.ma));
  for (const x of bang) assert.ok(maTinh.has(x.maTinh), `xã trỏ tỉnh không có: ${x.ma}`);
  const demTinh = new Map<string, number>();
  for (const x of bang) demTinh.set(x.maTinh, (demTinh.get(x.maTinh) ?? 0) + 1);
  const demTinhNguon = new Map<string, number>();
  for (const m of XML.matchAll(/<MaTinh>([^<]*)<\/MaTinh>/g)) demTinhNguon.set(m[1]!, (demTinhNguon.get(m[1]!) ?? 0) + 1);
  assert.equal(demTinh.size, 34);
  for (const t of DM.tinh) assert.equal(demTinh.get(t.ma), demTinhNguon.get(t.ma), `số xã tỉnh ${t.ma}`);
  assert.equal(demTinh.get("79"), GHIM.hcm);
  console.log(`AC-1: ${bang.length} xã · ${JSON.stringify(dem)} · 34 tỉnh so số xã · TP.HCM ${demTinh.get("79")}`);
});

test("AC-1 bảng xã — phá thử: nguồn thiếu dòng, bảng sửa tay, dòng trùng đều đỏ", () => {
  const bang = JSON.parse(docDuLieu("xa.json")) as DongXa[];
  const nho = bang[0]!.ma;
  const xmlThieu = XML.replace(new RegExp(`<TABLE\\b[^>]*>(?:(?!</TABLE>)[\\s\\S])*<MaPhuongXa>${nho}</MaPhuongXa>[\\s\\S]*?</TABLE>`), "");
  assert.notEqual(xmlThieu, XML, "bản sao phải bỏ được dòng");
  assert.deepEqual(kiemBangXa(sinhBangXa(xmlThieu), XML, docDuLieu("xa.json")).slice(0, 1), [`thiếu mã xã nguồn: ${nho}`]);
  const sua = structuredClone(bang);
  sua[5]!.ten = "[Tên lạ]";
  assert.deepEqual(kiemBangXa(sua, XML, docDuLieu("xa.json")), [`bảng xã lệch bộ sinh: ${sua[5]!.ma}`]);
  const trung = [...structuredClone(bang), structuredClone(bang[7]!)];
  assert.ok(kiemBangXa(trung, XML, docDuLieu("xa.json")).includes(`mã xã trùng: ${bang[7]!.ma}`));
});

// ---------- AC-2 ----------

/** Kiểm bảng chuyển đổi (xã cũ, tỉnh cũ). */
function kiemChuyenDoi(xaCu: readonly DongXaCu[], tinhCu: readonly DongTinhCu[], maCuNguon: ReadonlySet<string>): string[] {
  const loi: string[] = [];
  const maXa = new Set(SINH.ketQua.xaCu.length ? (JSON.parse(SINH.xa) as DongXa[]).map((x) => x.ma) : []);
  const coMa = new Set<string>();
  for (const c of xaCu) {
    if (!/^\d{5}$/.test(c.ma)) loi.push(`mã xã cũ sai khuôn: ${c.ma}`);
    coMa.add(c.ma);
    for (const m of c.vao) if (!maXa.has(m)) loi.push(`xã cũ trỏ xã mới không có: ${c.ten} → ${m}`);
  }
  for (const m of [...maCuNguon].sort()) if (!coMa.has(m)) loi.push(`thiếu mã xã cũ nguồn: ${m}`);
  const tenTinhCu = new Map<string, Set<string>>();
  for (const t of tinhCu) {
    if (!tenTinhCu.has(t.ma)) tenTinhCu.set(t.ma, new Set());
    tenTinhCu.get(t.ma)!.add(t.ten);
  }
  for (const [ma, ten] of tenTinhCu) if (ten.size > 1) loi.push(`nhãn tỉnh cũ lệch mã: ${ma}`);
  const tinhCuaHuyen = new Map<string, Set<string>>();
  for (const c of xaCu) {
    if (!tinhCuaHuyen.has(c.maHuyenCu)) tinhCuaHuyen.set(c.maHuyenCu, new Set());
    tinhCuaHuyen.get(c.maHuyenCu)!.add(c.maTinhCu);
  }
  for (const [h, t] of tinhCuaHuyen) if (t.size > 1) loi.push(`huyện cũ lệch tỉnh cũ: ${h}`);
  return [...new Set(loi)];
}

/** Đếm độc lập trên XML sheet thô (không qua docSheet): dòng có ô cột C hay E mang giá trị. */
function demDongSheetTho(): { dong: number; maCu: Set<string> } {
  const tep = giaiZip(XLSX);
  const wb = tep.get("xl/workbook.xml")!.toString("utf8");
  const rid = /<sheet name="Tổng hợp_không merge "[^>]*r:id="([^"]+)"/.exec(wb)![1]!;
  const rels = tep.get("xl/_rels/workbook.xml.rels")!.toString("utf8");
  const dich = new RegExp(`<Relationship[^>]*Id="${rid}"[^>]*Target="([^"]+)"`).exec(rels)?.[1] ?? new RegExp(`<Relationship[^>]*Target="([^"]+)"[^>]*Id="${rid}"`).exec(rels)![1]!;
  const xml = tep.get(`xl/${dich.replace(/^\//, "").replace(/^xl\//, "")}`)!.toString("utf8");
  const chung = [...tep.get("xl/sharedStrings.xml")!.toString("utf8").matchAll(/<si>([\s\S]*?)<\/si>/g)].map((m) =>
    [...m[1]!.matchAll(/<t\b[^>]*>([\s\S]*?)<\/t>/g)].map((t) => t[1]).join(""),
  );
  let dong = 0;
  const maCu = new Set<string>();
  for (const [i, r] of [...xml.matchAll(/<row\b[^>]*>([\s\S]*?)<\/row>/g)].entries()) {
    if (i < 2) continue;
    const o = (cot: string) => {
      const m = new RegExp(`<c r="${cot}\\d+"([^>]*?)(?:/>|>([\\s\\S]*?)</c>)`).exec(r[1]!);
      const v = m?.[2] ? /<v>([\s\S]*?)<\/v>/.exec(m[2])?.[1] : undefined;
      if (v === undefined) return "";
      return / t="s"/.test(m![1]!) ? (chung[Number(v)] ?? "") : v;
    };
    const c = o("C").trim();
    const e = o("E").trim();
    if (c !== "" || e !== "") {
      dong++;
      if (e !== "") maCu.add(e.padStart(5, "0"));
    }
  }
  return { dong, maCu };
}

test("AC-2 bảng xã cũ sinh từ nguồn", () => {
  assert.equal(SINH.xaCu, docDuLieu("xa-cu.json"), "bảng xã cũ phải trùng từng byte với bộ sinh");
  const xaCu = JSON.parse(docDuLieu("xa-cu.json")) as DongXaCu[];
  const tinhCu = JSON.parse(docDuLieu("tinh-cu.json")) as DongTinhCu[];
  const tho = demDongSheetTho();
  assert.equal(SINH.ketQua.soDong, GHIM.dong, "số dòng đọc bằng bộ sinh bằng số ghim");
  assert.equal(tho.dong, GHIM.dong, "số dòng đếm độc lập trên XML thô bằng số ghim");
  assert.deepEqual(kiemChuyenDoi(xaCu, tinhCu, tho.maCu), []);
  assert.equal(new Set(xaCu.map((c) => c.ma)).size, xaCu.length);
  assert.equal(xaCu.length, tho.maCu.size, "tập mã cũ bằng tập mã cũ của nguồn");
  assert.equal(xaCu.length, GHIM.maCu, "số mã cũ bằng số ghim");
  const tach = xaCu.filter((c) => c.vao.length >= 2).length;
  assert.equal(tach, GHIM.tach, "số mã cũ bị tách bằng số ghim");
  for (const s of SUA_NGUON) assert.ok(SINH.ketQua.dung[s.id] >= 1, `dòng sửa không dùng: ${s.id}`);
  console.log(`AC-2: ${SINH.ketQua.soDong} dòng · ${xaCu.length} mã cũ · ${tach} mã tách · sửa ${JSON.stringify(SINH.ketQua.dung)}`);
});

test("AC-2 bảng xã cũ — phá thử: bỏ bảng sửa, trỏ xã lạ, thiếu mã cũ đều đỏ", () => {
  const tho = demDongSheetTho();
  const xa = JSON.parse(SINH.xa) as DongXa[];
  const khongSua = sinhBangChuyenDoi(XLSX, xa, new Set<MaSua>());
  const loi = kiemChuyenDoi(khongSua.xaCu, khongSua.tinhCu, tho.maCu);
  for (const can of ["mã xã cũ sai khuôn: ", "xã cũ trỏ xã mới không có: ", "nhãn tỉnh cũ lệch mã: 44", "huyện cũ lệch tỉnh cũ: 794"]) {
    assert.ok(loi.some((l) => l.startsWith(can)), `bỏ bảng sửa phải đỏ «${can}»`);
  }
  const xaCu = JSON.parse(docDuLieu("xa-cu.json")) as DongXaCu[];
  const tinhCu = JSON.parse(docDuLieu("tinh-cu.json")) as DongTinhCu[];
  const la = structuredClone(xaCu);
  la[3]!.vao = [...la[3]!.vao, "99999"];
  assert.deepEqual(kiemChuyenDoi(la, tinhCu, tho.maCu), [`xã cũ trỏ xã mới không có: ${la[3]!.ten} → 99999`]);
  const thieu = xaCu.filter((_, i) => i !== 9);
  assert.deepEqual(kiemChuyenDoi(thieu, tinhCu, tho.maCu), [`thiếu mã xã cũ nguồn: ${xaCu[9]!.ma}`]);
});

// ---------- AC-3 ----------

const tenGoc = (ten: string) => dangSo(ten.replace(/^(Tỉnh|Thành phố)\s+/, ""));
const xaNhoNhat = (maTinh: string): DonViCapXa => [...DM.xa].filter((x) => x.maTinh === maTinh).sort((a, b) => a.ma.localeCompare(b.ma))[0]!;
const laQuanHuyen = (h: string) => /^(Quận|Huyện) /.test(h);
const cuNhoNhat = (loc: (c: DonViCapXaCu) => boolean): DonViCapXaCu | undefined =>
  [...DM.xaCu].filter((c) => c.loai !== null && loc(c)).sort((a, b) => (a.ma ?? "").localeCompare(b.ma ?? ""))[0];
const tenTinh = (ma: string) => DM.tinh.find((t) => t.ma === ma)!;

/** Kiểm đọc tỉnh cũ: trả lỗi theo dòng. */
function kiemTinhCu(dm: DanhMucDonViHanhChinh, maTran: readonly { chu: string; tenCu: string; maTinh: string; maXa: string }[]): string[] {
  const loi: string[] = [];
  for (const d of maTran) {
    const kq = docDiaChi(d.chu, dm);
    if (kq.stateOrProvince?.ma !== d.maTinh || kq.stateOrProvince?.tuTenCu !== d.tenCu) loi.push(`tỉnh cũ không đọc ra tỉnh mới: ${d.tenCu}`);
    else if (kq.trangThai !== "chuan" || kq.khoa !== `${d.maTinh}|${d.maXa}|mau 1|12`) loi.push(`tỉnh cũ đọc sai khoá: ${d.chu}`);
  }
  return loi;
}

function maTranTinhCu() {
  const goc = new Set(DM.tinh.map((t) => tenGoc(t.ten)));
  const T = DM.tinhCu.filter((t) => !goc.has(tenGoc(t.ten)));
  const mot = T.filter((t) => t.vao.length === 1);
  const dong: { chu: string; tenCu: string; maTinh: string; maXa: string }[] = [];
  for (const t of mot) {
    const x = xaNhoNhat(t.vao[0]!);
    dong.push({ chu: `12 Đường Mẫu 1, ${x.loai} ${x.ten}, ${t.ten}`, tenCu: t.ten, maTinh: t.vao[0]!, maXa: x.ma });
    const c = cuNhoNhat((c) => c.maTinhCu === t.ma && c.vao.length === 1 && laQuanHuyen(c.huyenCu));
    assert.ok(c, `tỉnh cũ ${t.ten} không có xã cũ dạng quận/huyện`);
    dong.push({ chu: `12 Đường Mẫu 1, ${c.loai} ${c.ten}, ${c.huyenCu}, ${t.ten}`, tenCu: t.ten, maTinh: t.vao[0]!, maXa: c.vao[0]! });
  }
  return { T, mot, dong };
}

test("AC-3 tỉnh cũ ra tỉnh mới", () => {
  assert.equal(SINH.tinhCu, docDuLieu("tinh-cu.json"), "bảng tỉnh cũ phải trùng từng byte với bộ sinh");
  const { T, mot, dong } = maTranTinhCu();
  const nhieu = T.filter((t) => t.vao.length >= 2);
  assert.deepEqual(kiemTinhCu(DM, dong), []);
  assert.equal(dong.length, 2 * mot.length);
  // Tỉnh cũ vào hai tỉnh mới (danh mục bản sao — nguồn có 0 ca): thiếu tỉnh, không khoá; đối chứng trên danh mục thật.
  const dm = banSao();
  const t0 = mot[0]!;
  (dm.tinhCu.find((t) => t.ma === t0.ma) as unknown as { vao: string[] }).vao = [t0.vao[0]!, "79"];
  const kqTach = docDiaChi(dong[0]!.chu, dm);
  assert.ok(kqTach.thieu.includes("stateOrProvince"));
  assert.equal(kqTach.khoa, null);
  assert.equal(docDiaChi(dong[0]!.chu).trangThai, "chuan");
  console.log(`AC-3: ${T.length} tỉnh cũ khác tên tỉnh mới · ${nhieu.length} tỉnh cũ vào ≥ 2 tỉnh mới · ${dong.length} assert`);
});

test("AC-3 tỉnh cũ — phá thử: danh mục không có tỉnh cũ thì đỏ", () => {
  const { dong } = maTranTinhCu();
  const dm = banSao();
  (dm as unknown as { tinhCu: unknown[] }).tinhCu = [];
  assert.deepEqual(kiemTinhCu(dm, dong).slice(0, 1), [`tỉnh cũ không đọc ra tỉnh mới: ${dong[0]!.tenCu}`]);
});

// ---------- AC-4 ----------

const BON_PHUONG: readonly [string, string][] = [["26737", "Tân Định"], ["26740", "Sài Gòn"], ["26743", "Bến Thành"], ["26758", "Cầu Ông Lãnh"]];
const MUOI_CU = ["Bến Nghé", "Đa Kao", "Nguyễn Thái Bình", "Tân Định", "Bến Thành", "Phạm Ngũ Lão", "Cầu Ông Lãnh", "Cầu Kho", "Cô Giang", "Nguyễn Cư Trinh"];

function kiemHang75(dm: DanhMucDonViHanhChinh): string[] {
  const loi: string[] = [];
  const nguon = tinhTheoXml(XML);
  for (const t of dm.tinh) if (nguon.get(t.ma) !== t.ten) loi.push(`tỉnh lệch nguồn: ${t.ma}`);
  if (dm.tinh.length !== nguon.size) loi.push("số tỉnh lệch nguồn");
  const xaNguon = new Map((JSON.parse(SINH.xa) as DongXa[]).map((x) => [x.ma, x]));
  for (const [ma, ten] of BON_PHUONG) {
    const x = dm.xa.find((v) => v.ten === ten && v.maTinh === "79");
    const n = xaNguon.get(ma);
    if (!x || x.ma !== ma || !n || n.ten !== ten || n.loai !== "Phường" || x.loai !== "Phường") loi.push(`xã hàng 75 lệch nguồn: ${ten}`);
  }
  const cuNguon = (SINH.ketQua.xaCu as DongXaCu[]).filter((c) => c.maTinhCu === "79" && c.huyenCu === "Quận 1");
  for (const ten of MUOI_CU) {
    const a = dm.xaCu.find((c) => c.ten === ten && c.huyenCu === "Quận 1" && c.maTinh === "79");
    const b = cuNguon.find((c) => c.ten === ten);
    if (!a || !b || [...a.vao].sort().join() !== [...b.vao].sort().join()) loi.push(`phường cũ hàng 75 lệch nguồn: ${ten}`);
  }
  return loi;
}

test("AC-4 đối chiếu hàng 75", async () => {
  assert.deepEqual(kiemHang75(DM), []);
  assert.equal(tenTinh("22").ten, "Thành phố Quảng Ninh");
  assert.equal(tenTinh("24").ten, "Thành phố Bắc Ninh");
  assert.equal(tenTinh("75").ten, "Thành phố Đồng Nai");
  const duong = fileURLToPath(new URL("../../../db/seed/don-vi-hanh-chinh-mau.mjs", import.meta.url));
  const trich = ((await import(pathToFileURL(duong).href)) as { DON_VI_HANH_CHINH: BangTrichHang73 }).DON_VI_HANH_CHINH;
  assert.deepEqual(doiChieuBangTrich(DM, trich), []);
  console.log(`AC-4: ${DM.tinh.length} tỉnh so nguồn · ${BON_PHUONG.length} phường · ${MUOI_CU.length} phường cũ Quận 1 · bảng trích hàng 73 khớp`);
});

test("AC-4 đối chiếu hàng 75 — phá thử: tên tỉnh cũ, mã phường sai đều đỏ", () => {
  const a = banSao();
  (a.tinh.find((t) => t.ma === "75") as { ten: string }).ten = "Tỉnh Đồng Nai";
  assert.deepEqual(kiemHang75(a), ["tỉnh lệch nguồn: 75"]);
  const b = banSao();
  (b.xa.find((x) => x.ma === "26743") as { ma: string }).ma = "26744";
  assert.ok(kiemHang75(b).includes("xã hàng 75 lệch nguồn: Bến Thành"));
});

// ---------- AC-5 ----------

type DongDoc = { chu: string; maTinh: string; maXa: string };

function kiemDoc(maTran: readonly DongDoc[], doc: (chu: string) => KetQuaDiaChi = (c) => docDiaChi(c)): string[] {
  const loi: string[] = [];
  for (const d of maTran) {
    const kq = doc(d.chu);
    if (kq.trangThai !== "chuan" || kq.khoa !== `${d.maTinh}|${d.maXa}|mau 1|12`) loi.push(`không đọc ra xã: ${d.chu}`);
  }
  return loi;
}

function maTranCaNuoc(): { dong: DongDoc[]; tach: { chu: string; vao: readonly string[] }[] } {
  const dong: DongDoc[] = [];
  const tach: { chu: string; vao: readonly string[] }[] = [];
  for (const t of DM.tinh) {
    const x = xaNhoNhat(t.ma);
    dong.push({ chu: `12 Đường Mẫu 1, ${x.loai} ${x.ten}, ${t.ten}`, maTinh: t.ma, maXa: x.ma });
    const c = cuNhoNhat((c) => c.maTinh === t.ma && c.vao.length === 1 && laQuanHuyen(c.huyenCu))!;
    dong.push({ chu: `12 Đường Mẫu 1, ${c.loai} ${c.ten}, ${c.huyenCu}, ${t.ten}`, maTinh: t.ma, maXa: c.vao[0]! });
    const s = cuNhoNhat((c) => c.maTinh === t.ma && c.vao.length >= 2 && laQuanHuyen(c.huyenCu));
    if (s) tach.push({ chu: `12 Đường Mẫu 1, ${s.loai} ${s.ten}, ${s.huyenCu}, ${t.ten}`, vao: s.vao });
  }
  return { dong, tach };
}

test("AC-5 đọc địa chỉ cả nước", () => {
  const { dong, tach } = maTranCaNuoc();
  assert.equal(dong.length, 68);
  assert.deepEqual(kiemDoc(dong), []);
  for (const s of tach) {
    const kq = docDiaChi(s.chu);
    assert.equal(kq.trangThai, "can-nguoi-chon", s.chu);
    assert.ok(kq.wardName && "canNguoiChon" in kq.wardName, s.chu);
    assert.deepEqual(kq.wardName.ungVien.map((u) => u.ma).sort(), [...s.vao].sort(), s.chu);
    assert.equal(kq.khoa, null);
  }
  console.log(`AC-5: ${dong.length} địa chỉ (34 tỉnh × 2 dạng) · ${tach.length} xã cũ bị tách`);
});

test("AC-5 đọc cả nước — phá thử: danh mục chỉ có phần trích hàng 75 thì đỏ", () => {
  const { dong } = maTranCaNuoc();
  const dm = banSao();
  (dm as unknown as { xa: DonViCapXa[] }).xa = dm.xa.filter((x) => BON_PHUONG.some(([m]) => m === x.ma));
  (dm as unknown as { xaCu: DonViCapXaCu[] }).xaCu = dm.xaCu.filter((c) => c.maTinh === "79" && c.huyenCu === "Quận 1");
  assert.deepEqual(kiemDoc(dong, (c) => docDiaChi(c, dm)).slice(0, 1), [`không đọc ra xã: ${dong[0]!.chu}`]);
});

// ---------- AC-6 ----------

function maTranMuonTen(): { tinh: DonViCapTinh; ten: string }[] {
  const tenHcm = new Set([...DM.xa.filter((x) => x.maTinh === "79").map((x) => dangSo(x.ten)), ...DM.xaCu.filter((c) => c.maTinh === "79").map((c) => dangSo(c.ten))]);
  return DM.tinh
    .filter((t) => t.ma !== "79")
    .map((t) => ({ tinh: t, x: [...DM.xa].filter((x) => x.maTinh === t.ma && !tenHcm.has(dangSo(x.ten)) && !/\d/.test(x.ten)).sort((a, b) => a.ma.localeCompare(b.ma))[0]! }))
    .map(({ tinh, x }) => ({ tinh, ten: x.ten }));
}

function kiemMuonTen(doc: (chu: string) => KetQuaDiaChi): string[] {
  const loi: string[] = [];
  for (const { ten } of maTranMuonTen()) {
    const a = doc(`12 ${ten}, Phường Bến Thành, TP.HCM`);
    const b = doc(`12 Đường Mẫu 1, ${ten}, TP.HCM`);
    for (const kq of [a, b]) {
      const ward = kq.wardName && !("canNguoiChon" in kq.wardName) ? kq.wardName.ma : null;
      const ngoai = ward !== null && !DM.xa.some((x) => x.ma === ward && x.maTinh === "79");
      if (ngoai || kq.chuaCoTrongDanhMuc.some((c) => c.phan === "wardName" && dangSo(c.chu) === dangSo(ten))) loi.push(`mượn tên xã tỉnh khác: ${ten}`);
    }
    if (a.trangThai !== "chuan" || (a.wardName as { ma?: string } | null)?.ma !== "26743") loi.push(`mất xã có tiền tố: ${ten}`);
  }
  return [...new Set(loi)];
}

test("AC-6 không mượn tên xã tỉnh khác", () => {
  const maTran = maTranMuonTen();
  assert.equal(maTran.length, 33);
  assert.deepEqual(kiemMuonTen((c) => docDiaChi(c)), []);
  const doiChung = docDiaChi("12 Đường Mẫu 1, Bến Thành, TP.HCM");
  assert.equal(doiChung.trangThai, "chuan");
  assert.equal((doiChung.wardName as { ma: string }).ma, "26743");
  console.log(`AC-6: ${maTran.length} tên xã tỉnh khác × 2 dạng = ${2 * maTran.length} địa chỉ`);
});

test("AC-6 không mượn tên — phá thử: so đoạn không tiền tố với xã cả nước thì đỏ", () => {
  const loi = kiemMuonTen((c) => docDiaChiVoi(c, DM, { trongTinh: false, nhanHuyenTP: true }));
  assert.ok(loi.length > 0 && loi[0]!.startsWith("mượn tên xã tỉnh khác: "), loi[0]);
});

// ---------- AC-7 ----------

type DongAnh = { ma: string; streetNumber: string | null; streetName: string | null; khoa: string | null; trangThai: string };
const ANH: { dong: DongAnh[] } = JSON.parse(readFileSync(fileURLToPath(new URL("./anh-truoc-va.json", import.meta.url)), "utf8"));
const DAP_AN: { ma: string; chu: string }[] = JSON.parse(
  readFileSync(fileURLToPath(new URL("../../../db/seed/mau-thap-tang/dap-an-thap-tang.json", import.meta.url)), "utf8"),
).diaChi;

function kiemAnhSauDanhMuc(anh: readonly DongAnh[]): string[] {
  const chu = new Map(DAP_AN.map((d) => [d.ma, d.chu]));
  return anh.flatMap((d) => {
    const kq = docDiaChi(chu.get(d.ma)!);
    return (["streetNumber", "streetName", "khoa", "trangThai"] as const).filter((k) => kq[k] !== d[k]).map((k) => `đổi so với ảnh: ${d.ma}: ${k}`);
  });
}

test("AC-7 khoá cũ không đổi", () => {
  assert.equal(ANH.dong.length, 86);
  assert.deepEqual(kiemAnhSauDanhMuc(ANH.dong), []);
  console.log(`AC-7: ${ANH.dong.length} cách viết so với ảnh`);
});

test("AC-7 khoá cũ — phá thử: ảnh bản sao đổi khoá DC-001 thì đỏ", () => {
  const anh = structuredClone(ANH.dong);
  anh[0]!.khoa = "79|00000|mau 1|45";
  assert.deepEqual(kiemAnhSauDanhMuc(anh), ["đổi so với ảnh: DC-001: khoa"]);
});

// ---------- AC-8 ----------

function kiemBam(dm: DanhMucDonViHanhChinh): string[] {
  const loi = kiemDanhMuc(dm);
  for (const n of dm.nguon) {
    if (n.tep === undefined) continue;
    const bam = createHash("sha256").update(readFileSync(path.join(THU_MUC_NGUON, n.tep))).digest("hex");
    if (bam !== n.sha256) loi.push(`băm nguồn lệch tệp: ${n.phan}`);
  }
  return loi;
}

test("AC-8 nguồn có băm", () => {
  assert.deepEqual(kiemBam(DM), []);
  for (const phan of ["tinh", "xa", "xaCu", "tinhCu"] as const) {
    const n = DM.nguon.find((v) => v.phan === phan)!;
    assert.ok(n.vanBan && n.docQua, phan);
    assert.match(n.ngayDoc, /^\d{4}-\d{2}-\d{2}$/);
    assert.match(n.ngayThamChieu ?? "", /^\d{4}-\d{2}-\d{2}$/);
  }
  for (const phan of ["xa", "xaCu", "tinhCu"] as const) assert.ok(DM.nguon.find((v) => v.phan === phan)?.tep, `phần ${phan} phải trỏ tệp nguồn`);
  console.log(`AC-8: ${DM.nguon.filter((n) => n.tep).length} phần có tệp nguồn, băm khớp`);
});

test("AC-8 nguồn — phá thử: băm lệch, thiếu ngày tham chiếu đều đỏ", () => {
  const a = banSao();
  const n = a.nguon.find((v) => v.phan === "xa") as { sha256: string };
  n.sha256 = (n.sha256[0] === "0" ? "1" : "0") + n.sha256.slice(1);
  assert.deepEqual(kiemBam(a), ["băm nguồn lệch tệp: xa"]);
  const b = banSao();
  delete (b.nguon.find((v) => v.phan === "xaCu") as { ngayThamChieu?: string }).ngayThamChieu;
  assert.deepEqual(kiemBam(b), ["danh mục thiếu ngày tham chiếu: xaCu"]);
});

// ---------- AC-9 ----------

function maTranHuyenTP(): { chu: string[]; maTinh: string; maXa: string }[] {
  const ra: { chu: string[]; maTinh: string; maXa: string }[] = [];
  for (const t of DM.tinh) {
    const c = cuNhoNhat((c) => c.maTinh === t.ma && c.vao.length === 1 && /^(Thành phố|Thị xã) /.test(c.huyenCu));
    if (!c) continue;
    const [, loai, ten] = /^(Thành phố|Thị xã) (.+)$/.exec(c.huyenCu)!;
    const ngan = loai === "Thành phố" ? `TP ${ten}` : `TX ${ten}`;
    ra.push({ chu: [c.huyenCu, ngan].map((h) => `12 Đường Mẫu 1, ${c.loai} ${c.ten}, ${h}, ${t.ten}`), maTinh: t.ma, maXa: c.vao[0]! });
  }
  return ra;
}

function kiemHuyenTP(doc: (chu: string) => KetQuaDiaChi): string[] {
  const loi: string[] = [];
  for (const d of maTranHuyenTP()) {
    for (const chu of d.chu) {
      const kq = doc(chu);
      if (kq.trangThai !== "chuan" || kq.khoa !== `${d.maTinh}|${d.maXa}|mau 1|12` || kq.stateOrProvince?.ma !== d.maTinh) loi.push(`huyện cũ thành phố không đọc: ${chu}`);
    }
  }
  return loi;
}

test("AC-9 huyện cũ dạng thành phố, thị xã", () => {
  const maTran = maTranHuyenTP();
  const vang = DM.tinh.filter((t) => !maTran.some((d) => d.maTinh === t.ma)).map((t) => t.ten);
  assert.deepEqual(kiemHuyenTP((c) => docDiaChi(c)), []);
  const tinhTP = docDiaChi("12 Đường Mẫu 1, Phường Bến Thành, TP Hồ Chí Minh");
  assert.equal(tinhTP.stateOrProvince?.ma, "79");
  assert.equal(tinhTP.trangThai, "chuan");
  const la = docDiaChi("12 Đường Mẫu 1, Phường Bến Thành, Thành phố Không Có, TP.HCM");
  assert.equal(la.trangThai, "chuan");
  assert.equal((la.wardName as { ma: string }).ma, "26743");
  console.log(`AC-9: ${maTran.length} tỉnh có xã cũ ở thành phố, thị xã cũ · ${2 * maTran.length} assert · không có: ${vang.join(", ") || "—"}`);
});

test("AC-9 huyện cũ thành phố — phá thử: bộ đọc không nhận huyện cũ dạng thành phố thì đỏ", () => {
  const loi = kiemHuyenTP((c) => docDiaChiVoi(c, DM, { trongTinh: true, nhanHuyenTP: false }));
  assert.ok(loi.length > 0 && loi[0]!.startsWith("huyện cũ thành phố không đọc: "), loi[0]);
});

