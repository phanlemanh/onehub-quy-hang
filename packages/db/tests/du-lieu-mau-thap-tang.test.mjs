// Bài kiểm chín tiêu chí của hồ sơ du-lieu-mau-thap-tang (E1–E9, hàng 73). Hàm kiểm viết RIÊNG ở tệp này — không gọi hàm
// của bộ sinh — và mỗi phép đo có đối chứng dương trên vật lành cùng phá thử trên bản sao, đỏ với thông điệp ghim. Tệp
// Excel đọc lại bằng doc-xlsx.py (thư viện chuẩn Python), không bằng mã ghi. Ca cơ sở dữ liệu chạy trong một giao dịch
// rồi hoàn lại, dưới khoá tư vấn của sàn mẫu.
//   DATABASE_URL=postgres://…@localhost:5576/postgres node --test packages/db/tests/du-lieu-mau-thap-tang.test.mjs
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { cpSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";
import pg from "pg";
import { register } from "tsx/esm/api";
import { DON_VI_HANH_CHINH } from "../seed/don-vi-hanh-chinh-mau.mjs";
import { giuKhoaSanMau } from "../seed/khoa-san-mau.mjs";
import { CAU_XOA, napMau, xoaMau } from "../seed/nap.mjs";
import { napThapTang } from "../seed/nap-thap-tang.mjs";

// Khuôn danh mục (packages/connect) và bảng loại hình (packages/core) viết bằng TypeScript.
register();
const { CatalogUnit } = await import("../../connect/src/catalog-feed.ts");
const { unitFieldErrors } = await import("../../core/src/catalog/property-type.ts");

const GOC = path.dirname(fileURLToPath(import.meta.url));
const SEED = path.join(GOC, "../seed");
const MAU = path.join(SEED, "mau-thap-tang");
const SINH = path.join(SEED, "sinh-thap-tang.mjs");
const TEP = ["du-lieu-mau-thap-tang.json", "bang-hang-thap-tang.xlsx", "dap-an-thap-tang.json"];
const URL_DB = process.env.DATABASE_URL;
if (!URL_DB && process.env.CI) throw new Error("Bộ kiểm dữ liệu mẫu thấp tầng cần DATABASE_URL trên CI.");
const boQuaDb = URL_DB ? false : "cần DATABASE_URL (xem .env.example)";

const NHAN = "Mẫu";
const TEN_SAN = "[Mẫu] Sàn thử";
const DUOI_MAU = "@mau.quy-hang.test";
const TIEN_TO_UPI = "urn:onehub:upi:mau:";
const BON_LOAI = ["Condominium", "Single Family Residence", "Townhouse", "Unimproved Land"];
const BA_LOAI = ["Single Family Residence", "Townhouse", "Unimproved Land"];
const SAU_TRANG_THAI = ["Active", "Closed", "Hold", "Incomplete", "Pending", "Withdrawn"];
const TRANG_THAI_MO = ["Incomplete", "Active", "Pending", "Hold"];
// Ma trận viết trước — không đọc từ bộ sinh.
const KIEU_VIET = ["phuong-moi", "phuong-cu-gop", "phuong-cu-tach", "hem-gach", "hem-chu", "hem-xe-hoi", "viet-tat-khong-dau", "thieu-so-nha"];
const NHAN_LOI = ["loai-hinh-nhan-san", "ma-lo-lech-dang", "dien-tich-nhan", "so-tang-chu", "gia-ty", "gia-thoa-thuan", "so-dien-thoai-dang-khac", "dia-chi-phuong-cu"];
const CA_LEAD = ["biet-lo", "chi-biet-day", "ngoai-khu-du", "ngoai-khu-thieu-so", "trung-lo-mo", "trung-nha-ngoai-khu-mo", "trung-so-chu"];

const sha = (b) => createHash("sha256").update(b).digest("hex");
const tam = () => mkdtempSync(path.join(tmpdir(), "mau-thap-tang-"));
const banSao = (x) => structuredClone(x);
const docJson = (ten) => JSON.parse(readFileSync(path.join(MAU, ten), "utf8"));
const docD = () => docJson("du-lieu-mau-thap-tang.json");
const docDapAn = () => docJson("dap-an-thap-tang.json");
const docHang5 = () => JSON.parse(readFileSync(path.join(SEED, "mau/du-lieu-mau.json"), "utf8"));
const coLoi = (loi, ghim) => loi.some((l) => l.startsWith(ghim));
const bang = (a, b) => JSON.stringify([...a].sort()) === JSON.stringify([...b].sort());
const boDau = (s) => String(s).normalize("NFD").replace(/\p{M}/gu, "").replace(/đ/g, "d").replace(/Đ/g, "D");

function docPy(tep) {
  const r = spawnSync("python3", ["-I", path.join(SEED, "doc-xlsx.py"), tep], { encoding: "utf8" });
  if (r.status !== 0) throw new Error(`doc-xlsx.py thoát ${r.status}: ${r.stderr.trim().split("\n").at(-1)}`);
  return JSON.parse(r.stdout);
}
const docLuoi = (tep = path.join(MAU, TEP[1])) => docPy(tep).dong;

// Thay một ô của bản sao tệp bằng zipfile của Python — vật phá thử không qua bộ ghi của kho.
const THAY_O = `
import re, sys, zipfile
src, dst, ref, moi = sys.argv[1:5]
with zipfile.ZipFile(src) as z:
    muc = [(i.filename, z.read(i.filename)) for i in z.infolist()]
with zipfile.ZipFile(dst, "w", zipfile.ZIP_STORED) as o:
    for ten, b in muc:
        if ten == "xl/worksheets/sheet1.xml":
            s, n = re.subn(r'<c r="%s"[^>]*?(?:/>|>.*?</c>)' % ref, moi, b.decode(), count=1)
            if n != 1:
                sys.exit(3)
            b = s.encode()
        o.writestr(ten, b)
`;
function thayO(src, ref, xmlMoi) {
  const dst = path.join(tam(), path.basename(src));
  const r = spawnSync("python3", ["-I", "-c", THAY_O, src, dst, ref, xmlMoi], { encoding: "utf8" });
  assert.equal(r.status, 0, `không thay được ô ${ref}: ${r.stderr}`);
  return dst;
}
const chuCot = (i) => String.fromCharCode(65 + i);

// ——— Danh mục đơn vị hành chính ————————————————————————————————————————————————————————————————————

const TINH = DON_VI_HANH_CHINH.tinh[0];
const tenHopLe = () => new Set([...TINH.phuongMoi, ...TINH.phuongCu.map((c) => c.ten)].map(boDau));
const PHUONG_TRONG_CHUOI = /(?<!\p{L})(?:Phường|P\.)\s+([^,]+)/gu;

function kiemDanhMuc(dm) {
  const loi = [];
  if (!/1685\/NQ-UBTVQH15/.test(dm.nguon ?? "")) loi.push("danh mục thiếu nguồn");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dm.ngay ?? "")) loi.push("danh mục thiếu ngày");
  const t = dm.tinh ?? [];
  if (t.length !== 1) loi.push(`danh mục sai số tỉnh: ${t.length}`);
  const moi = t[0]?.phuongMoi ?? [];
  const cu = t[0]?.phuongCu ?? [];
  if (moi.length !== 4 || cu.length !== 10) loi.push(`danh mục sai số phường: ${moi.length} mới, ${cu.length} cũ`);
  if (!cu.some((c) => c.vao.length === 1)) loi.push("danh mục thiếu phường cũ gộp trọn");
  if (cu.filter((c) => c.vao.length === 2).length !== 3) loi.push("danh mục sai số phường cũ bị tách");
  for (const c of cu) for (const v of c.vao) if (!moi.includes(v)) loi.push(`phường cũ trỏ phường mới ngoài danh mục: ${c.ten} → ${v}`);
  return loi;
}

/** Mọi tên tỉnh, phường của ba nguồn thuộc danh mục; trả số tên đã kiểm mỗi nguồn. */
function kiemTenHanhChinh(d, dapAn, luoi) {
  const loi = [];
  const hopLe = tenHopLe();
  const dem = { duLieu: 0, file: 0, diaChiThu: 0 };
  const xet = (nguon, ten, noi) => {
    dem[nguon]++;
    if (!hopLe.has(boDau(String(ten).trim()))) loi.push(`tên đơn vị hành chính ngoài danh mục: ${noi} «${ten}»`);
  };
  const tinhCua = (nguon, ten, noi) => {
    dem[nguon]++;
    if (ten !== TINH.ten) loi.push(`tên đơn vị hành chính ngoài danh mục: ${noi} «${ten}»`);
  };
  for (const u of d.canNgoaiKhu) {
    tinhCua("duLieu", u.diaChi.stateOrProvince, u.ma);
    xet("duLieu", u.diaChi.wardName, u.ma);
  }
  for (const l of d.lead) {
    if (typeof l.dapAn.wardName === "string") xet("duLieu", l.dapAn.wardName, l.ma);
    for (const m of String(l.diaChi ?? "").matchAll(PHUONG_TRONG_CHUOI)) xet("duLieu", m[1], l.ma);
  }
  for (const x of dapAn.diaChi) for (const m of x.chu.matchAll(PHUONG_TRONG_CHUOI)) xet("diaChiThu", m[1], x.ma);
  const cot = dapAn.file.cot.findIndex((c) => c.dich === "unparsedAddress");
  for (const r of dapAn.file.dong) for (const m of String(luoi[r][cot] ?? "").matchAll(PHUONG_TRONG_CHUOI)) xet("file", m[1], `dòng ${r}`);
  return { loi, dem };
}

// ——— Đọc địa chỉ theo khuôn đóng của các kiểu viết (độc lập bộ sinh) —————————————————————————————————

function docChu(chu) {
  let so = null;
  const hem = /^số (\S+?),? (?:hẻm|HXH) ([\dA-Z/]+)/.exec(chu);
  if (hem) so = `${hem[2]}/${hem[1]}`;
  else {
    const m = /^(\d+[A-Z]?(?:\/\d+)*) /.exec(chu);
    if (m) so = m[1];
  }
  const duong = /(?:Đường Mẫu|Duong Mau) (\d+)/.exec(chu)?.[1] ?? null;
  const phuong = /(?<!\p{L})(?:Phường|P\.)\s+([^,]+)/u.exec(chu)?.[1]?.trim() ?? null;
  const quan1 = /Q\.1|Quận 1/.test(chu);
  return { so, duong, phuong, quan1 };
}

/** Phường đọc từ chữ có chỉ đúng phường của căn không (phường mới cùng tên, hay phường cũ nhận vào phường ấy). */
function phuongKhop(tenDoc, phuongCan) {
  if (!tenDoc) return false;
  const k = boDau(tenDoc);
  if (k === boDau(phuongCan)) return true;
  return TINH.phuongCu.some((c) => boDau(c.ten) === k && c.vao.includes(phuongCan));
}

function chuChiCan(chu, can) {
  const r = docChu(chu);
  return r.duong === can.diaChi.streetName.replace("Đường Mẫu ", "") && phuongKhop(r.phuong, can.diaChi.wardName) && (r.so === null || r.so === can.diaChi.streetNumber);
}

const diaChiChuan = (a) => `${a.streetNumber} ${a.streetName}, Phường ${a.wardName}, ${a.stateOrProvince}`;

// ——— AC-1 ——————————————————————————————————————————————————————————————————————————————————————————————

const chayNode = (args) => spawnSync(process.execPath, args, { encoding: "utf8" });

test("AC-1 tất định: hai tiến trình ra cùng từng byte, trùng tệp trong kho; --kiem bắt bản sao lệch", () => {
  const [a, b] = [tam(), tam()];
  for (const ra of [a, b]) assert.equal(chayNode([SINH, "--ra", ra]).status, 0);
  for (const ten of TEP) {
    const goc = sha(readFileSync(path.join(MAU, ten)));
    assert.equal(sha(readFileSync(path.join(a, ten))), sha(readFileSync(path.join(b, ten))), `hai lần sinh lệch: ${ten}`);
    assert.equal(sha(readFileSync(path.join(a, ten))), goc, `lệch tệp trong kho: ${ten}`);
  }
  const kiem = chayNode([SINH, "--kiem"]);
  assert.equal(kiem.status, 0, kiem.stderr);
  // Đối chứng: hạt giống khác ra bộ dữ liệu khác.
  const c = tam();
  assert.equal(chayNode([SINH, "--ra", c, "--hat", "7"]).status, 0);
  assert.notEqual(sha(readFileSync(path.join(c, TEP[0]))), sha(readFileSync(path.join(MAU, TEP[0]))));
  // Phá thử: sửa một byte bản sao một tệp.
  const sao = tam();
  cpSync(MAU, sao, { recursive: true });
  const p = path.join(sao, TEP[2]);
  const buf = readFileSync(p);
  buf[10] = buf[10] ^ 1;
  writeFileSync(p, buf);
  const hong = chayNode([SINH, "--kiem", "--ra", sao]);
  assert.equal(hong.status, 1);
  assert.match(hong.stderr, /lệch tệp trong kho/);
});

// ——— AC-2 ——————————————————————————————————————————————————————————————————————————————————————————————

test("AC-2 danh mục đơn vị hành chính: có nguồn và ngày; mọi tên tỉnh, phường của ba nguồn thuộc danh mục", () => {
  assert.deepEqual(kiemDanhMuc(DON_VI_HANH_CHINH), []);
  const d = docD();
  assert.deepEqual(d.donViHanhChinh, { nguon: DON_VI_HANH_CHINH.nguon, ngay: DON_VI_HANH_CHINH.ngay });
  const kq = kiemTenHanhChinh(d, docDapAn(), docLuoi());
  assert.deepEqual(kq.loi, []);
  for (const [nguon, n] of Object.entries(kq.dem)) assert.ok(n > 0, `không tên nào được kiểm ở nguồn ${nguon}`);
  // Phá thử.
  const sai = banSao(d);
  sai.canNgoaiKhu[0].diaChi.wardName = "[Tên lạ]";
  assert.ok(coLoi(kiemTenHanhChinh(sai, docDapAn(), docLuoi()).loi, "tên đơn vị hành chính ngoài danh mục"));
  const thieuNguon = banSao(DON_VI_HANH_CHINH);
  delete thieuNguon.nguon;
  assert.ok(coLoi(kiemDanhMuc(thieuNguon), "danh mục thiếu nguồn"));
});

// ——— AC-3 ——————————————————————————————————————————————————————————————————————————————————————————————

function kiemKhu(dm) {
  const loi = [];
  const thay = new Set();
  const loai = new Set();
  let dem = 0;
  for (const khu of dm.subdivisions)
    for (const b of khu.blocks)
      for (const u of b.units) {
        dem++;
        loai.add(u.propertySubType);
        if (!CatalogUnit.safeParse(u).success || unitFieldErrors(u).length) loi.push(`lô sai loại hình: ${u.unitNumber}`);
        if (thay.has(u.unitNumber)) loi.push(`mã lô trùng: ${u.unitNumber}`);
        thay.add(u.unitNumber);
        const m = /^([A-Z]{2}\d)-(\d{2})$/.exec(u.unitNumber);
        if (!m || m[1] !== b.blockKey) loi.push(`mã lô lệch dãy: ${u.unitNumber}`);
        if (!u.upi.startsWith(TIEN_TO_UPI)) loi.push(`lô thiếu UPI mẫu: ${u.unitNumber}`);
      }
  if (!bang(loai, BA_LOAI)) loi.push(`thiếu loại hình lô: ${[...loai].join(", ")}`);
  return { loi, dem, loai };
}

test("AC-3 khu thấp tầng: mỗi lô qua khuôn CatalogUnit và bảng loại hình; ba loại hình; mã lô duy nhất, khớp dãy", () => {
  const d = docD();
  const kq = kiemKhu(d.danhMucThapTang);
  assert.deepEqual(kq.loi, []);
  assert.ok(kq.dem > 0);
  const lo = d.danhMucThapTang.subdivisions[0].blocks.flatMap((b) => b.units);
  for (const t of BA_LOAI) assert.ok(lo.filter((u) => u.propertySubType === t).length > 0, `không lô nào loại ${t}`);
  // Phá thử.
  const sai1 = banSao(d.danhMucThapTang);
  sai1.subdivisions[0].blocks.find((b) => b.units[0].propertySubType === "Unimproved Land").units[0].livingArea = 100;
  assert.ok(coLoi(kiemKhu(sai1).loi, "lô sai loại hình"));
  const sai2 = banSao(d.danhMucThapTang);
  sai2.subdivisions[0].blocks[0].units[1].unitNumber = sai2.subdivisions[0].blocks[0].units[0].unitNumber;
  assert.ok(coLoi(kiemKhu(sai2).loi, "mã lô trùng"));
  const sai3 = banSao(d.danhMucThapTang);
  sai3.subdivisions[0].blocks[1].units.push(sai3.subdivisions[0].blocks[0].units.pop());
  assert.ok(coLoi(kiemKhu(sai3).loi, "mã lô lệch dãy"));
});

// ——— AC-4 ——————————————————————————————————————————————————————————————————————————————————————————————

function kiemNgoaiKhu(ds) {
  const loi = [];
  const khoa = new Set();
  for (const u of ds) {
    const a = u.diaChi;
    if (!/^Đường Mẫu \d+$/.test(a.streetName)) loi.push(`tên đường không phải Đường Mẫu: ${u.ma} «${a.streetName}»`);
    if (!/^\d+[A-Z]?(?:\/\d+)*$/.test(a.streetNumber)) loi.push(`số nhà sai dạng: ${u.ma}`);
    const k = [a.stateOrProvince, a.wardName, a.streetName, a.streetNumber].join("|");
    if (khoa.has(k)) loi.push(`hai căn cùng địa chỉ: ${u.ma}`);
    khoa.add(k);
    const typed = { upi: `${TIEN_TO_UPI}${u.ma}`, unitNumber: u.ma, stack: null, floor: null, ...Object.fromEntries(Object.entries(u).filter(([k2]) => !["ma", "diaChi", "nhan"].includes(k2))) };
    if (!CatalogUnit.safeParse(typed).success || unitFieldErrors(typed).length) loi.push(`căn ngoài khu sai loại hình: ${u.ma}`);
  }
  const cap = (n) => ds.filter((u) => u.diaChi.streetNumber.split("/").length === n).length;
  if (!cap(1) || !cap(2) || !cap(3)) loi.push("thiếu số nhà mặt đường hay hẻm hai, ba cấp");
  if (new Set(ds.map((u) => u.diaChi.wardName)).size < 3) loi.push("căn ngoài khu dưới ba phường");
  if (!bang(new Set(ds.map((u) => u.propertySubType)), BA_LOAI)) loi.push("căn ngoài khu thiếu loại hình");
  return loi;
}

test("AC-4 căn ngoài khu: Đường Mẫu N, số nhà mặt đường và hẻm nhiều cấp, ≥3 phường, ba loại hình, địa chỉ duy nhất", () => {
  const d = docD();
  assert.deepEqual(kiemNgoaiKhu(d.canNgoaiKhu), []);
  const sai1 = banSao(d.canNgoaiKhu);
  sai1[0].diaChi.streetName = "Đường [Tên thật]";
  assert.ok(coLoi(kiemNgoaiKhu(sai1), "tên đường không phải Đường Mẫu"));
  const sai2 = banSao(d.canNgoaiKhu);
  sai2[1].diaChi = { ...sai2[0].diaChi };
  assert.ok(coLoi(kiemNgoaiKhu(sai2), "hai căn cùng địa chỉ"));
});

// ——— AC-5 ——————————————————————————————————————————————————————————————————————————————————————————————

function kiemDiaChiThu(ds, canNgoaiKhu) {
  const loi = [];
  const can = new Map(canNgoaiKhu.map((u) => [u.ma, u]));
  for (const k of KIEU_VIET) if (!ds.some((x) => x.kieu.includes(k))) loi.push(`thiếu kiểu viết: ${k}`);
  for (const x of ds) {
    const u = can.get(x.canDich);
    if (!u) {
      loi.push(`đáp án lệch căn: ${x.ma}`);
      continue;
    }
    // Đáp án dựng lại từ địa chỉ chuẩn của căn đích, không từ chuỗi viết.
    const a = u.diaChi;
    const mong = { stateOrProvince: a.stateOrProvince, wardName: a.wardName, streetName: a.streetName, streetNumber: a.streetNumber, thieu: [] };
    if (x.kieu.includes("thieu-so-nha")) Object.assign(mong, { streetNumber: null, thieu: ["streetNumber"] });
    let dapAn = x.dapAn;
    if (x.kieu.includes("phuong-cu-tach")) {
      const ten = docChu(x.chu).phuong;
      const cu = TINH.phuongCu.find((c) => c.ten === ten);
      const w = x.dapAn.wardName;
      if (!cu || w?.canNguoiChon !== true || !bang(w.ungVien ?? [], cu.vao) || !cu.vao.includes(a.wardName)) loi.push(`ứng viên lệch danh mục: ${x.ma}`);
      dapAn = { ...x.dapAn, wardName: a.wardName };
    }
    if (JSON.stringify(dapAn) !== JSON.stringify(mong)) loi.push(`đáp án lệch căn: ${x.ma}`);
    if (!chuChiCan(x.chu, u)) loi.push(`chuỗi lệch căn đích: ${x.ma}`);
    if (!x.kieu.includes("thieu-so-nha") && docChu(x.chu).so === null) loi.push(`chuỗi lệch căn đích: ${x.ma} (không đọc được số nhà)`);
  }
  // Cặp gần trùng: cùng phường và đường, số hơn kém một cấp hẻm hay một chữ cái.
  let cap = 0;
  for (const p of canNgoaiKhu)
    for (const q of canNgoaiKhu) {
      if (p === q || p.diaChi.wardName !== q.diaChi.wardName || p.diaChi.streetName !== q.diaChi.streetName) continue;
      const [a, b] = [p.diaChi.streetNumber, q.diaChi.streetNumber];
      if (/^\/\d+$/.test(b.slice(a.length)) && b.startsWith(a)) cap++;
      else if (b.startsWith(a) && /^[A-Z]$/.test(b.slice(a.length))) cap++;
    }
  if (cap < 2) loi.push(`thiếu cặp gần trùng: ${cap}`);
  return { loi, cap };
}

test("AC-5 địa chỉ thử: tám kiểu viết; đáp án đúng căn; phường cũ tách hỏi người; thiếu số nhà; chuỗi khớp căn đích", () => {
  const d = docD();
  const ds = docDapAn().diaChi;
  const kq = kiemDiaChiThu(ds, d.canNgoaiKhu);
  assert.deepEqual(kq.loi, []);
  assert.ok(kq.cap >= 2);
  // Phá thử: đổi căn đích một cách viết của NK-03 sang NK-04.
  const sai1 = banSao(ds);
  sai1.find((x) => x.canDich === "NK-03").canDich = "NK-04";
  assert.ok(coLoi(kiemDiaChiThu(sai1, d.canNgoaiKhu).loi, "đáp án lệch căn"));
  // Tráo chuỗi của một cặp gần trùng, giữ căn đích.
  const sai2 = banSao(ds);
  const x3 = sai2.find((x) => x.canDich === "NK-03" && x.kieu.includes("phuong-moi"));
  const x4 = sai2.find((x) => x.canDich === "NK-04" && x.kieu.includes("phuong-moi"));
  [x3.chu, x4.chu] = [x4.chu, x3.chu];
  assert.ok(coLoi(kiemDiaChiThu(sai2, d.canNgoaiKhu).loi, "chuỗi lệch căn đích"));
  const sai3 = banSao(ds);
  sai3.find((x) => x.kieu.includes("phuong-cu-tach")).dapAn.wardName.ungVien.pop();
  assert.ok(coLoi(kiemDiaChiThu(sai3, d.canNgoaiKhu).loi, "ứng viên lệch danh mục"));
  const sai4 = banSao(ds).filter((x) => !x.kieu.includes("hem-xe-hoi"));
  assert.ok(coLoi(kiemDiaChiThu(sai4, d.canNgoaiKhu).loi, "thiếu kiểu viết: hem-xe-hoi"));
});

// ——— AC-6 ——————————————————————————————————————————————————————————————————————————————————————————————

const LOAI_SACH = { Townhouse: "Nhà phố", "Single Family Residence": "Biệt thự", "Unimproved Land": "Đất", Condominium: "Căn hộ" };
const TT_SACH = { Incomplete: "Chưa đủ để rao", Active: "Đang bán", Pending: "Đang giao dịch", Closed: "Đã bán", Hold: "Tạm ngừng", Withdrawn: "Ngừng hẳn" };
const so = (s) => Number(String(s).replace(",", "."));

/** Bảng ghép tay «đích → cách lấy từ bộ dữ liệu» — không gọi bộ ghi file. */
function giaTriDung(d, hang5) {
  const can = new Map();
  for (const b of d.danhMucThapTang.subdivisions[0].blocks) for (const u of b.units) can.set(u.unitNumber, u);
  for (const u of d.canNgoaiKhu) can.set(u.ma, u);
  for (const p of hang5.danhMuc.subdivisions) for (const b of p.buildings) for (const u of b.units) can.set(u.unitNumber, u);
  const chu = new Map(d.chuNha.map((c) => [c.ma, c]));
  const v = (x) => (x === undefined ? null : x);
  const LAY = {
    rowIndex: (_h, _u, i) => i + 1,
    propertySubType: (h) => h.propertySubType,
    unitNumber: (h) => (h.loai === "ngoai-khu" ? null : h.maCan),
    unparsedAddress: (h, u) => (h.loai === "ngoai-khu" ? diaChiChuan(u.diaChi) : null),
    lotSizeArea: (_h, u) => v(u.lotSizeArea),
    livingArea: (_h, u) => v(u.livingArea),
    storiesTotal: (h, u) => (h.loai === "can-ho" ? null : v(u.storiesTotal)),
    frontageLength: (_h, u) => v(u.frontageLength),
    accessRoadWidth: (_h, u) => v(u.accessRoadWidth),
    directionFaces: (_h, u) => v(u.directionFaces),
    listPrice: (h) => h.gia,
    standardStatus: (h) => h.trangThai,
    ownerName: (h) => chu.get(h.chuNha).ten,
    ownerPhone: (h) => chu.get(h.chuNha).soDienThoai,
    note: (h) => h.ghiChu || null,
    label: (h) => h.nhan,
  };
  return { LAY, can };
}

/** Bộ giải đóng theo nhãn lỗi cấy: trả giá trị chuẩn, hay null khi nhãn là «phải hỏi người». */
function giai(nhan, o) {
  const s = String(o);
  switch (nhan) {
    case "loai-hinh-nhan-san":
      return { "Liền kề": "Townhouse", Shophouse: "Townhouse", "Đất nền": "Unimproved Land", "Đất thổ cư": "Unimproved Land" }[s] ?? undefined;
    case "ma-lo-lech-dang":
      return s.toUpperCase().replace(/[\s.]+/, "-");
    case "dien-tich-nhan": {
      const x = /^([\d,]+)x([\d,]+)$/.exec(s);
      if (x) return Math.round(so(x[1]) * so(x[2]) * 10) / 10;
      const m = /^([\d,]+)m2$/.exec(s);
      return m ? so(m[1]) : undefined;
    }
    case "so-tang-chu": {
      const t = /^1 trệt (\d+) lầu$/.exec(s);
      if (t) return Number(t[1]) + 1;
      const n = /^(\d+)T$/.exec(s);
      return n ? Number(n[1]) : undefined;
    }
    case "gia-ty": {
      const g = /^([\d.,]+) (?:tỷ|ty)$/.exec(s);
      return g ? Math.round(so(g[1]) * 1e9) : undefined;
    }
    case "gia-thoa-thuan":
      return s === "Thỏa thuận" ? null : undefined;
    case "so-dien-thoai-dang-khac": {
      let c = s.replace(/\D/g, "");
      if (c.startsWith("84")) c = `0${c.slice(2)}`;
      return c.length === 10 ? `${c.slice(0, 4)} ${c.slice(4, 7)} ${c.slice(7)}` : undefined;
    }
    case "dia-chi-phuong-cu": {
      const r = docChu(s);
      const cu = TINH.phuongCu.find((c) => c.ten === r.phuong);
      if (!cu) return undefined;
      if (cu.vao.length > 1) return null;
      return `${r.so} Đường Mẫu ${r.duong}, Phường ${cu.vao[0]}, ${TINH.ten}`;
    }
    default:
      return undefined;
  }
}

const ghiSach = (dich, v) => (dich === "propertySubType" ? LOAI_SACH[v] : dich === "standardStatus" ? TT_SACH[v] : v);

function kiemFile(luoi, dapAn, d, hang5) {
  const loi = [];
  const tieuDe = luoi[dapAn.headerRow] ?? [];
  if (dapAn.cot.length !== tieuDe.length || dapAn.cot.some((c) => !c.dich)) loi.push("đáp án thiếu đích cột");
  if (JSON.stringify(tieuDe) !== JSON.stringify(dapAn.cot.map((c) => c.tieuDe))) loi.push("dòng tiêu đề lệch đáp án");
  const { LAY, can } = giaTriDung(d, hang5);
  if (dapAn.dong.length !== d.hang.length) loi.push(`đáp án sai số dòng: ${dapAn.dong.length}`);
  for (const nhan of NHAN_LOI) if (!dapAn.loiCay.some((l) => l.nhan === nhan)) loi.push(`thiếu lỗi cấy: ${nhan}`);
  for (const l of dapAn.loiCay) if (!NHAN_LOI.includes(l.nhan) || (l.ask !== true && !("value" in l))) loi.push(`lỗi cấy thiếu nhãn: dòng ${l.dong} cột ${l.cot}`);
  d.hang.forEach((h, i) => {
    const r = dapAn.dong[i];
    const u = can.get(h.maCan);
    dapAn.cot.forEach((c, k) => {
      const dung = LAY[c.dich] ? LAY[c.dich](h, u, i) : undefined;
      if (JSON.stringify(dapAn.dung[i]?.[k]) !== JSON.stringify(dung)) loi.push(`đáp án lệch dữ liệu: dòng ${r} cột ${k}`);
      const o = luoi[r]?.[k] ?? null;
      const lc = dapAn.loiCay.find((l) => l.dong === r && l.cot === k);
      if (!lc) {
        if (JSON.stringify(o) !== JSON.stringify(ghiSach(c.dich, dung) ?? null)) loi.push(`ô lệch đáp án: dòng ${r} cột ${k}`);
      } else {
        if (JSON.stringify(o) === JSON.stringify(ghiSach(c.dich, dung))) loi.push(`lỗi cấy trùng chữ giá trị đúng: dòng ${r} cột ${k}`);
        const g = giai(lc.nhan, o);
        if (lc.ask ? g !== null : JSON.stringify(g) !== JSON.stringify(dung)) loi.push(`ô lệch đáp án: dòng ${r} cột ${k}`);
      }
    });
    // Dòng chỉ đúng căn đáp án gán.
    if (dapAn.canCuaDong[i] !== h.maCan) loi.push(`ô lệch đáp án: dòng ${r} căn`);
    const kMa = dapAn.cot.findIndex((c) => c.dich === "unitNumber");
    const kDc = dapAn.cot.findIndex((c) => c.dich === "unparsedAddress");
    if (h.loai === "ngoai-khu") {
      if (!chuChiCan(String(luoi[r]?.[kDc] ?? ""), u)) loi.push(`ô lệch đáp án: dòng ${r} căn`);
    } else {
      const lc = dapAn.loiCay.find((l) => l.dong === r && l.cot === kMa);
      const ma = lc ? giai(lc.nhan, luoi[r]?.[kMa]) : luoi[r]?.[kMa];
      if (ma !== dapAn.canCuaDong[i]) loi.push(`ô lệch đáp án: dòng ${r} căn`);
    }
  });
  const kLoai = dapAn.cot.findIndex((c) => c.dich === "propertySubType");
  if (!bang(new Set(dapAn.dung.map((x) => x[kLoai])), BON_LOAI)) loi.push("file thiếu loại hình");
  return loi;
}

test("AC-6 file bẩn: tiêu đề, đích mọi cột, giá trị đúng từ bộ dữ liệu, tám nhãn lỗi cấy, ô giải ra đúng đáp án", () => {
  const d = docD();
  const hang5 = docHang5();
  const dapAn = docDapAn().file;
  const tep = path.join(MAU, TEP[1]);
  const luoi = docLuoi(tep);
  assert.deepEqual(kiemFile(luoi, dapAn, d, hang5), []);
  // Phá thử trên bản sao đáp án.
  const kGia = dapAn.cot.findIndex((c) => c.dich === "listPrice");
  const sai1 = banSao(dapAn);
  sai1.dung[0][kGia] += 1e8;
  assert.ok(coLoi(kiemFile(luoi, sai1, d, hang5), "đáp án lệch dữ liệu"));
  const sai2 = banSao(dapAn);
  sai2.cot.pop();
  assert.ok(coLoi(kiemFile(luoi, sai2, d, hang5), "đáp án thiếu đích cột"));
  const sai3 = banSao(dapAn);
  delete sai3.loiCay.find((l) => !l.ask).value;
  assert.ok(coLoi(kiemFile(luoi, sai3, d, hang5), "lỗi cấy thiếu nhãn"));
  // Phá thử trên bản sao xlsx: tráo ô giá của hai dòng số (không qua bộ ghi).
  const [r1, r2] = dapAn.dong.filter((r) => typeof luoi[r][kGia] === "number").slice(0, 2);
  const ref = (r) => `${chuCot(kGia)}${r + 1}`;
  const t1 = thayO(tep, ref(r1), `<c r="${ref(r1)}"><v>${luoi[r2][kGia]}</v></c>`);
  const t2 = thayO(t1, ref(r2), `<c r="${ref(r2)}"><v>${luoi[r1][kGia]}</v></c>`);
  assert.ok(coLoi(kiemFile(docLuoi(t2), dapAn, d, hang5), "ô lệch đáp án"));
});

// ——— AC-7 ——————————————————————————————————————————————————————————————————————————————————————————————

function kiemLuat(d, hang5) {
  const loi = [];
  if (!bang(new Set(d.hang.map((h) => h.trangThai)), SAU_TRANG_THAI)) loi.push("thiếu trạng thái");
  if (!bang(new Set(d.hang.map((h) => h.propertySubType)), BON_LOAI)) loi.push("hàng thiếu loại hình");
  const moTheoCan = new Map();
  for (const h of [...d.hang, ...hang5.hang].filter((x) => TRANG_THAI_MO.includes(x.trangThai))) {
    const k = h.upi ?? h.maCan;
    moTheoCan.set(k, (moTheoCan.get(k) ?? 0) + 1);
  }
  for (const [k, n] of moTheoCan) if (n > 1) loi.push(`căn có hai hàng mở: ${k}`);
  const dauChu = new Map();
  for (const h of d.hang) dauChu.set(h.chuNha, new Set([...(dauChu.get(h.chuNha) ?? []), h.dauChu]));
  for (const [c, s] of dauChu) if (s.size > 1) loi.push(`một chủ hai đầu chủ: ${c}`);
  for (const ca of CA_LEAD) if (!d.lead.some((l) => l.ca === ca)) loi.push(`thiếu ca lead: ${ca}`);
  const lo = new Map(d.danhMucThapTang.subdivisions[0].blocks.flatMap((b) => b.units.map((u) => [u.unitNumber, b.blockKey])));
  const nk = new Map(d.canNgoaiKhu.map((u) => [u.ma, u]));
  const hangMo = (ma, can) => d.hang.some((h) => h.ma === ma && h.maCan === can && TRANG_THAI_MO.includes(h.trangThai));
  for (const l of d.lead) {
    const a = l.dapAn;
    const dung = {
      "biet-lo": () => lo.has(l.maLo) && a.can === l.maLo,
      "chi-biet-day": () => [...lo.values()].includes(l.day) && a.can === null && a.day === l.day,
      "ngoai-khu-du": () => nk.has(a.can) && chuChiCan(l.diaChi, nk.get(a.can)) && docChu(l.diaChi).so !== null,
      "ngoai-khu-thieu-so": () => a.can === null && docChu(l.diaChi).so === null && a.thieu?.includes("streetNumber"),
      "trung-lo-mo": () => a.can === l.maLo && hangMo(a.trungHangMo, a.can),
      "trung-nha-ngoai-khu-mo": () => nk.has(a.can) && hangMo(a.trungHangMo, a.can) && chuChiCan(l.diaChi, nk.get(a.can)) && l.diaChi !== diaChiChuan(nk.get(a.can).diaChi),
      "trung-so-chu": () => d.chuNha.some((c) => c.ma === a.trungChuNha && c.soDienThoai === l.soDienThoai),
    }[l.ca];
    if (!dung || !dung()) loi.push(`ca lead sai đáp án: ${l.ma}`);
  }
  return loi;
}

test("AC-7 luật Tham chiếu: sáu trạng thái, bốn loại hình, một hàng mở mỗi căn (kể cả bộ hàng 5), bảy ca lead đúng đáp án", () => {
  const d = docD();
  const hang5 = docHang5();
  assert.deepEqual(kiemLuat(d, hang5), []);
  assert.ok(d.hang.some((h) => h.upi && hang5.danhMuc.subdivisions[0].buildings.some((b) => b.units.some((u) => u.upi === h.upi))), "không hàng căn hộ nào trên danh mục hàng 5");
  // Phá thử: thêm hàng mở trên căn hộ đang có hàng mở ở bộ hàng 5.
  const mo5 = hang5.hang.find((h) => TRANG_THAI_MO.includes(h.trangThai));
  const sai1 = banSao(d);
  sai1.hang.push({ ...sai1.hang.find((h) => h.loai === "can-ho"), ma: "HT-99", maCan: mo5.maCan, upi: mo5.upi, trangThai: "Active" });
  assert.ok(coLoi(kiemLuat(sai1, hang5), "căn có hai hàng mở"));
  const sai2 = banSao(d);
  const chuHai = [...new Set(sai2.hang.map((h) => h.chuNha))].find((c) => sai2.hang.filter((h) => h.chuNha === c).length > 1);
  sai2.hang.find((h) => h.chuNha === chuHai).dauChu = "dau-chu-khac";
  assert.ok(coLoi(kiemLuat(sai2, hang5), "một chủ hai đầu chủ"));
  const sai3 = banSao(d);
  sai3.lead = sai3.lead.filter((l) => l.ca !== "chi-biet-day");
  assert.ok(coLoi(kiemLuat(sai3, hang5), "thiếu ca lead: chi-biet-day"));
});

// ——— AC-8 ——————————————————————————————————————————————————————————————————————————————————————————————

const SO_MAU = /^09000000\d\d$/;
// Ứng viên số điện thoại: chuỗi bắt đầu bằng «+84» hay «0», chữ số xen chấm hay cách, dài từ 9 chữ số. Dò SAU khi đã gỡ
// các đoạn được phép (CHO_PHEP) — dò trước thì dãy số nằm trong một UUID ngẫu nhiên («…-03408001142f») bị bắt dở thành số
// và bài đỏ chập chờn (va-ac8-uuid-nham-so).
const UNG_VIEN_SO = /(?:\+84|(?<!\d)0)[\d .]{7,14}\d/g;
const CHO_PHEP = [
  /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})/g, // mốc giờ ISO
  /\d{4}-\d{2}-\d{2}/g, // ngày
  /\d{1,2}\/\d{1,2}\/\d{4}/g, // ngày viết tay của nguồn
  /\d+\/NQ-UBTVQH\d+/g, // số hiệu nghị quyết của nguồn
  /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi, // khoá dòng cơ sở dữ liệu
  /(?<![\p{L}\p{Nd}])[A-Z]{2}\d-\d{2}(?!\p{Nd})/gu, // mã lô
  /(?<![\p{L}\p{Nd}])[A-Z]-\d{2}\.\d{2}(?!\p{Nd})/gu, // mã căn hộ
];

function quetSo(chuoi, noi) {
  const loi = [];
  let con = String(chuoi).normalize("NFKC");
  for (const re of CHO_PHEP) con = con.replace(re, " ");
  let dem = 0;
  for (const m of con.matchAll(UNG_VIEN_SO)) {
    let c = m[0].replace(/\D/g, "");
    if (m[0].startsWith("+84")) c = `0${c.slice(2)}`;
    if (c.length < 9) continue;
    dem++;
    if (!SO_MAU.test(c)) loi.push(`số không đúng dạng mẫu: ${noi} «${m[0]}»`);
  }
  con = con.replace(UNG_VIEN_SO, " ");
  if ((con.match(/\p{Nd}/gu)?.length ?? 0) >= 9) loi.push(`số không đúng dạng mẫu: ${noi} «${String(chuoi).slice(0, 80)}»`);
  return { loi, dem };
}

// Ma trận viết trước của phép dò số (va-ac8-uuid-nham-so): mỗi chuỗi một kỳ vọng — không cần cơ sở dữ liệu.
const DO_SO_SACH = [
  "14a1928b-9906-4b2b-af5e-03408001142f", // UUID mà đoạn cuối mở bằng 0 và đủ 11 chữ số — ca đã làm CI đỏ 06/11
  "0e8a1c2d-0123-4567-8901-012345678901", // UUID có nhiều đoạn mở bằng 0
  "00000000-0000-0000-0000-000000000000", // UUID toàn số 0
  "Gọi 0900 000 012", // số mẫu đúng dạng
  "2026-11-06T17:03:07.982Z", // mốc giờ
  "14A1928B-9906-4B2B-AF5E-03408001142F", // UUID của sự cố viết hoa
];
const DO_SO_BAN = [
  "Gọi 0912 345 678", // số thật đứng riêng
  "+84 912 345 678", // số thật dạng quốc tế
  "liên hệ 0912345678.", // số thật liền, có dấu chấm sau
  "id 03408001142 x", // dãy số đứng riêng — không phải UUID nên vẫn là số lạ
  "0912-345-678", // số thật viết gạch ngang — lọt mẫu ứng viên, phép đếm chữ số còn lại bắt
  "SĐT0912345678", // số thật dính chữ
];

const TU_DIA_CHI = [
  TINH.ten,
  "TP. Hồ Chí Minh",
  ...TINH.phuongMoi,
  ...TINH.phuongCu.map((c) => c.ten),
].flatMap((t) => [t, boDau(t)]);
const TU_KHOA = ["TP.HCM", "TPHCM", "TP HCM", "Phường", "Quận", "HXH", "hẻm", "số", "P.", "Q."];

/** Danh sách trắng: bỏ số nhà, Đường Mẫu N, tên trong bảng trích, từ khoá đóng — không được còn chữ nào. */
function quetDiaChi(chuoi, noi) {
  let con = String(chuoi).replace(/(?:Đường Mẫu|Duong Mau) \d+/g, " ");
  for (const t of [...TU_DIA_CHI].sort((a, b) => b.length - a.length)) con = con.split(t).join(" ");
  for (const t of TU_KHOA) con = con.split(t).join(" ");
  con = con.replace(/\d+[A-Z]?(?:\/\d+)*/g, " ").replace(/[\s,.\-—/]+/g, "");
  return con ? [`tên đường không phải Đường Mẫu: ${noi} «${chuoi}»`] : [];
}

function* moiChuoi(gt, duong = "") {
  if (typeof gt === "string") yield [duong, gt];
  else if (Array.isArray(gt)) for (const [i, x] of gt.entries()) yield* moiChuoi(x, `${duong}[${i}]`);
  else if (gt && typeof gt === "object") for (const [k, x] of Object.entries(gt)) yield* moiChuoi(x, `${duong}.${k}`);
}

/** Bốn nguồn: bộ dữ liệu, đáp án, lưới file bẩn, dòng cơ sở dữ liệu (chuỗi). */
function kiemKhongThat(d, dapAn, luoi, dongDb, hang5) {
  const loi = [];
  const dem = { so: 0, email: 0, ten: 0, duong: 0 };
  const quet = (s, noi) => {
    const q = quetSo(s, noi);
    loi.push(...q.loi);
    dem.so += q.dem;
    for (const m of String(s).matchAll(/[^\s@<>"',;()]+@[^\s@<>"',;()]+/g)) {
      dem.email++;
      if (!m[0].toLowerCase().endsWith(DUOI_MAU)) loi.push(`email không thuộc miền mẫu: ${noi} «${m[0]}»`);
    }
  };
  for (const [duong, s] of moiChuoi(d)) quet(s, `dữ liệu${duong}`);
  for (const [duong, s] of moiChuoi(dapAn)) quet(s, `đáp án${duong}`);
  for (const [r, dong] of luoi.entries()) for (const [k, o] of dong.entries()) if (typeof o === "string") quet(o, `file ${r}:${k}`);
  for (const [duong, s] of moiChuoi(dongDb)) quet(s, `cơ sở dữ liệu${duong}`);
  // Ô số ở cột điện thoại của file: số điện thoại không bao giờ là ô số.
  const kSdt = dapAn.file.cot.findIndex((c) => c.dich === "ownerPhone");
  for (const r of dapAn.file.dong) if (typeof luoi[r][kSdt] === "number") loi.push(`số không đúng dạng mẫu: file ${r} ô số`);
  // Số của bộ này không trùng bộ hàng 5, trừ lead ca trung-so-chu.
  const so5 = new Set([...hang5.chuNha, ...hang5.lead].map((x) => x.soDienThoai));
  for (const x of [...d.chuNha, ...d.lead.filter((l) => l.ca !== "trung-so-chu")]) if (so5.has(x.soDienThoai)) loi.push(`số trùng bộ hàng 5: ${x.ma}`);
  const kTen = dapAn.file.cot.findIndex((c) => c.dich === "ownerName");
  const ten = [d.san.ten, ...d.nguoi.map((x) => x.ten), ...d.chuNha.map((x) => x.ten), ...d.lead.map((x) => x.ten), ...dapAn.file.dong.map((r) => luoi[r][kTen]), ...dongDb.ten];
  for (const t of ten) {
    dem.ten++;
    if (!String(t).startsWith("[Mẫu]")) loi.push(`tên không mang nhãn mẫu: «${t}»`);
  }
  const kDc = dapAn.file.cot.findIndex((c) => c.dich === "unparsedAddress");
  const diaChi = [
    ...d.canNgoaiKhu.map((u) => [u.ma, diaChiChuan(u.diaChi)]),
    ...dapAn.diaChi.map((x) => [x.ma, x.chu]),
    ...d.lead.filter((l) => l.diaChi).map((l) => [l.ma, l.diaChi]),
    ...dapAn.file.dong.filter((r) => luoi[r][kDc]).map((r) => [`file ${r}`, luoi[r][kDc]]),
  ];
  for (const [noi, s] of diaChi) {
    dem.duong++;
    loi.push(...quetDiaChi(s, noi));
  }
  for (const u of d.canNgoaiKhu) if (!/^Đường Mẫu \d+$/.test(u.diaChi.streetName)) loi.push(`tên đường không phải Đường Mẫu: ${u.ma}`);
  return { loi, dem };
}

function kiemNhanLoai(d, dapAn, luoi) {
  const kNhan = dapAn.file.cot.findIndex((c) => c.dich === "label");
  const loai = {
    lô: d.danhMucThapTang.subdivisions.flatMap((s) => s.blocks.flatMap((b) => b.units)).map((u) => u.upi.startsWith(TIEN_TO_UPI)),
    "căn ngoài khu": d.canNgoaiKhu.map((x) => x.nhan === NHAN),
    "chủ nhà": d.chuNha.map((x) => x.nhan === NHAN),
    hàng: d.hang.map((x) => x.nhan === NHAN),
    lead: d.lead.map((x) => x.nhan === NHAN),
    người: d.nguoi.map((x) => x.nhan === NHAN && x.email.endsWith(DUOI_MAU)),
    "dòng file bẩn": dapAn.file.dong.map((r) => luoi[r][kNhan] === NHAN),
  };
  const loi = [];
  for (const [k, ds] of Object.entries(loai)) {
    if (!ds.length) loi.push(`không có bản ghi: ${k}`);
    else if (!ds.every(Boolean)) loi.push(`thiếu nhãn mẫu: ${k}`);
  }
  return loi;
}

// ——— Cơ sở dữ liệu ———————————————————————————————————————————————————————————————————————————————————

const BANG = [
  ["companies", "select id, name from companies"],
  ["user", 'select id, name, email from identity."user"'],
  ["company_members", "select company_id, user_id, roles from company_members"],
  ["company_zones", "select id, company_id, name from company_zones"],
  ["member_zones", "select company_id, user_id, zone_id from member_zones"],
];

async function anhChup(c) {
  const out = {};
  for (const [ten, sql] of BANG) out[ten] = (await c.query(sql)).rows.map((r) => JSON.stringify(r)).sort();
  return out;
}
function chenh(sau, truoc) {
  const out = {};
  for (const [ten] of BANG) out[ten] = sau[ten].filter((r) => !truoc[ten].includes(r)).map((r) => JSON.parse(r));
  return out;
}
/** Mọi dòng chênh mang nhãn: sàn tên mẫu, email miền mẫu, hay thuộc sàn mẫu. */
function kiemNhanDb(ch, sanMau) {
  const ok = [
    ...ch.companies.map((r) => r.name === TEN_SAN),
    ...ch.user.map((r) => String(r.email).endsWith(DUOI_MAU)),
    ...ch.company_members.map((r) => sanMau.has(r.company_id)),
    ...ch.company_zones.map((r) => sanMau.has(r.company_id)),
    ...ch.member_zones.map((r) => sanMau.has(r.company_id)),
  ];
  if (!ok.length) return ["không có bản ghi: dòng cơ sở dữ liệu"];
  return ok.every(Boolean) ? [] : ["thiếu nhãn mẫu: dòng cơ sở dữ liệu"];
}
const sanMauIds = async (c) => new Set((await c.query("select id from companies where name = $1", [TEN_SAN])).rows.map((r) => r.id));
// Phép đếm của AC-9 chỉ tính dòng do chính bài nạp: cơ sở dữ liệu có thể có sẵn sàn mẫu khác (bản thật có — job deploy
// chạy tệp này trên đó), nên mọi dòng mang nhãn mẫu đã có lúc chụp mốc là dữ liệu có sẵn, không đếm (va-ac9-mau-co-san).
const idMau = async (c) => ({
  san: (await c.query("select id from companies where name like '[Mẫu] Sàn%'")).rows.map((r) => r.id),
  nguoi: (await c.query('select id from identity."user" where email like $1', [`%${DUOI_MAU}`])).rows.map((r) => r.id),
});
/** Tập mã các dòng mang nhãn mẫu đang có — gọi lúc chụp mốc s0. */
async function mocMau(c) {
  const { san, nguoi } = await idMau(c);
  return { san: new Set(san), nguoi: new Set(nguoi) };
}
/** Số sàn tên «[Mẫu] Sàn…» và người miền mẫu mà mã không có trong mốc — dòng bài nạp còn sót. */
async function dongMauMoi(c, goc) {
  const { san, nguoi } = await idMau(c);
  return san.filter((id) => !goc.san.has(id)).length + nguoi.filter((id) => !goc.nguoi.has(id)).length;
}
/** Số sàn tên «[Mẫu] Sàn thử…» mà mã không có trong mốc. */
async function sanMauMoi(c, goc) {
  const ds = (await c.query("select id from companies where name like '[Mẫu] Sàn thử%'")).rows.map((r) => r.id);
  return ds.filter((id) => !goc.san.has(id)).length;
}

async function trongGiaoDich(fn) {
  const nha = await giuKhoaSanMau(URL_DB);
  const c = new pg.Client({ connectionString: URL_DB });
  await c.connect();
  try {
    // Repeatable read: ảnh chụp năm bảng chỉ thấy dòng của chính giao dịch này — dòng mà tệp kiểm khác (isolation.test.mjs
    // không lấy khoá sàn mẫu) commit giữa hai lần chụp không lọt vào phép chênh (S4 r1, t3).
    await c.query("begin isolation level repeatable read");
    await xoaMau(c); // cơ sở dữ liệu sạch dữ liệu mẫu trong giao dịch — hoàn lại cuối ca
    return await fn(c);
  } finally {
    await c.query("rollback").catch(() => {});
    await c.end();
    await nha();
  }
}
async function phaThu(c, fn) {
  await c.query("savepoint pha");
  try {
    return await fn();
  } finally {
    await c.query("rollback to savepoint pha");
  }
}

test("AC-8 không dữ liệu thật: số, email, tên người, tên đường, nhãn trên bốn nguồn", { skip: boQuaDb }, async () => {
  const d = docD();
  const dapAn = docDapAn();
  const luoi = docLuoi();
  const hang5 = docHang5();
  const dongDb = await trongGiaoDich(async (c) => {
    const truoc = await anhChup(c);
    await napThapTang(c, d);
    const ch = chenh(await anhChup(c), truoc);
    assert.deepEqual(kiemNhanDb(ch, await sanMauIds(c)), []);
    return { ...ch, ten: ch.user.map((r) => r.name) };
  });
  const kq = kiemKhongThat(d, dapAn, luoi, dongDb, hang5);
  assert.deepEqual(kq.loi, []);
  for (const [k, n] of Object.entries(kq.dem)) assert.ok(n > 0, `đối chứng dương: không đếm được ${k}`);
  assert.deepEqual(kiemNhanLoai(d, dapAn, luoi), []);
  // Ô giá đồng ≥ 1e9 không bị đếm là số điện thoại.
  const kGia = dapAn.file.cot.findIndex((c) => c.dich === "listPrice");
  assert.ok(dapAn.file.dong.some((r) => typeof luoi[r][kGia] === "number" && luoi[r][kGia] >= 1e9));
  // Phá thử trên bản sao.
  const thu = (sua, ghim) => {
    const [d2, a2, l2] = [banSao(d), banSao(dapAn), banSao(luoi)];
    sua(d2, a2, l2);
    assert.ok(coLoi(kiemKhongThat(d2, a2, l2, dongDb, hang5).loi, ghim), `phá thử không đỏ «${ghim}»`);
  };
  const kDc = dapAn.file.cot.findIndex((c) => c.dich === "unparsedAddress");
  const kSdt = dapAn.file.cot.findIndex((c) => c.dich === "ownerPhone");
  thu((d2) => (d2.hang[0].ghiChu = "Gọi 0912 345 678"), "số không đúng dạng mẫu");
  thu((_d, a2, l2) => (l2[a2.file.dong[0]][kSdt] = "+84 912 345 678"), "số không đúng dạng mẫu");
  thu((d2) => (d2.hang[0].ghiChu = "ten@gmail.com"), "email không thuộc miền mẫu");
  thu((d2) => (d2.chuNha[0].ten = "Nguyễn Văn A"), "tên không mang nhãn mẫu");
  thu((_d, a2) => (a2.diaChi[0].chu = "45 Lê Lợi, P. Bến Thành"), "tên đường không phải Đường Mẫu");
  thu((_d, a2, l2) => (l2[a2.file.dong.find((r) => l2[r][kDc])][kDc] = "12 Đ. Hai Bà Trưng"), "tên đường không phải Đường Mẫu");
  const kNhan = dapAn.file.cot.findIndex((c) => c.dich === "label");
  const xoaNhan = {
    lô: (d2) => (d2.danhMucThapTang.subdivisions[0].blocks[0].units[0].upi = "urn:onehub:upi:LK1-01"),
    "căn ngoài khu": (d2) => delete d2.canNgoaiKhu[0].nhan,
    "chủ nhà": (d2) => delete d2.chuNha[0].nhan,
    hàng: (d2) => delete d2.hang[0].nhan,
    lead: (d2) => delete d2.lead[0].nhan,
    người: (d2) => delete d2.nguoi[0].nhan,
    "dòng file bẩn": (_d, a2, l2) => (l2[a2.file.dong[0]][kNhan] = null),
  };
  for (const [loai, sua] of Object.entries(xoaNhan)) {
    const [d2, a2, l2] = [banSao(d), banSao(dapAn), banSao(luoi)];
    sua(d2, a2, l2);
    assert.ok(coLoi(kiemNhanLoai(d2, a2, l2), `thiếu nhãn mẫu: ${loai}`), `phá thử nhãn không đỏ: ${loai}`);
  }
});

test("AC-8 dò số: dãy chữ số trong UUID không bị nhận là số điện thoại; số thật vẫn bị bắt", () => {
  assert.equal(DO_SO_SACH.length, 6, "ma trận chuỗi sạch phải đủ 6 phần tử viết trước");
  assert.equal(DO_SO_BAN.length, 6, "ma trận chuỗi có số thật phải đủ 6 phần tử viết trước");
  for (const s of DO_SO_SACH) assert.deepEqual(quetSo(s, "thử").loi, [], `nhận nhầm số trong «${s}»`);
  for (const s of DO_SO_BAN) assert.ok(coLoi(quetSo(s, "thử").loi, "số không đúng dạng mẫu"), `bỏ sót số thật trong «${s}»`);
  // Đối chứng dương của chính phép dò: số mẫu đúng dạng được đếm, không bị coi là chuỗi không có số.
  assert.equal(quetSo("Gọi 0900 000 012", "thử").dem, 1, "không đếm được số mẫu đúng dạng");
});

// ——— AC-9 ——————————————————————————————————————————————————————————————————————————————————————————————

test("AC-9 nạp và xoá một lần: nạp lại không đổi; hai thứ tự nạp ra một sàn mẫu; một lệnh xoá gỡ sạch hai bộ", { skip: boQuaDb }, async () => {
  const d = docD();
  const hang5 = docHang5();
  await trongGiaoDich(async (c) => {
    // Đối chứng không nhãn.
    const sanDc = (await c.query("insert into companies (name) values ('[Tên sàn] đối chứng thấp tầng') returning id")).rows[0].id;
    await c.query(`insert into identity."user" (id, name, email, "emailVerified") values (gen_random_uuid()::text, '[Tên] đối chứng', 'doi-chung-tt@vi-du.test', true)`);
    const s0 = await anhChup(c);
    const goc = await mocMau(c);

    // Nhánh một: cơ sở dữ liệu không có sàn mẫu.
    await napThapTang(c, d);
    const s1 = await anhChup(c);
    const ch = chenh(s1, s0);
    assert.ok(Object.values(ch).flat().length > 0, "lần nạp không tạo dòng nào");
    assert.deepEqual(kiemNhanDb(ch, await sanMauIds(c)), []);
    await napThapTang(c, d);
    assert.deepEqual(await anhChup(c), s1, "lần nạp hai đổi dòng");
    await napMau(c, hang5);
    await xoaMau(c);
    assert.deepEqual(await anhChup(c), s0, "còn dòng mẫu sau xoá");
    assert.equal(await dongMauMoi(c, goc), 0, "còn dòng mẫu sau xoá");

    // Nhánh hai: bộ hàng 5 nạp trước.
    await napMau(c, hang5);
    await napThapTang(c, d);
    const s4 = await anhChup(c);
    await napThapTang(c, d);
    assert.deepEqual(await anhChup(c), s4, "lần nạp hai đổi dòng (sau bộ hàng 5)");
    const san = [...(await sanMauIds(c))];
    assert.equal(san.length, 1, "hai sàn mẫu");
    const email = (await c.query('select u.email from company_members m join identity."user" u on u.id = m.user_id where m.company_id = $1', [san[0]])).rows.map((r) => r.email);
    for (const n of [...d.nguoi, ...hang5.nguoi]) assert.ok(email.includes(n.email), `thiếu thành viên ${n.khoa}`);
    await xoaMau(c);
    assert.deepEqual(await anhChup(c), s0, "còn dòng mẫu sau xoá");
    assert.equal((await c.query("select count(*) n from companies where id = $1", [sanDc])).rows[0].n, "1");

    // Phá thử, mỗi cái hoàn lại về điểm lưu.
    await phaThu(c, async () => {
      const truoc = await anhChup(c);
      const sai = banSao(d);
      sai.nguoi.push({ khoa: "la", ten: "[Tên] lạ", email: "la@vi-du.test", vai: ["listing_agent"], khu: [] });
      await napThapTang(c, sai);
      assert.ok(coLoi(kiemNhanDb(chenh(await anhChup(c), truoc), await sanMauIds(c)), "thiếu nhãn mẫu: dòng cơ sở dữ liệu"));
    });
    await phaThu(c, async () => {
      await napThapTang(c, d);
      await xoaMau(c, CAU_XOA.slice(1));
      const loi = (await dongMauMoi(c, goc)) > 0 ? ["còn dòng mẫu sau xoá"] : [];
      assert.ok(coLoi(loi, "còn dòng mẫu sau xoá"));
    });
    await phaThu(c, async () => {
      await napMau(c, hang5);
      await napThapTang(c, { ...d, san: { ...d.san, ten: `${TEN_SAN} (sai)` } });
      const loi = (await sanMauMoi(c, goc)) > 1 ? ["hai sàn mẫu"] : [];
      assert.ok(coLoi(loi, "hai sàn mẫu"));
    });
  });
});
