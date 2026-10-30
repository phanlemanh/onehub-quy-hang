// Bài kiểm tám tiêu chí của hồ sơ du-lieu-mau-san-thu (E1–E8). Mỗi phép đo có đối chứng dương trên vật lành và phá
// thử trên bản sao, đỏ với thông điệp ghim. Tệp Excel đọc lại bằng doc-xlsx.py (thư viện chuẩn Python), không bằng mã
// ghi. Ca cơ sở dữ liệu chạy trên kết nối chủ; phá thử trên cơ sở dữ liệu chạy trong giao dịch rồi hoàn lại.
//   DATABASE_URL=postgres://…@localhost:5547/postgres node --test "packages/db/seed/*.test.mjs"
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { cpSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { after, test } from "node:test";
import pg from "pg";
import { CatalogFeed } from "../../connect/src/catalog-feed.ts";
import { moSan } from "../scripts/mo-san.mjs";
import {
  MIEN_EMAIL,
  NHAN,
  TEN_SAN,
  TIEN_TO_TEN,
  TRANG_THAI,
  TRANG_THAI_MO,
  demNhan,
  kiemDuLieuThat,
  kiemKhuonDanhMuc,
  kiemLuatThamChieu,
  kiemNhan,
  kiemOSoDienThoai,
  quetChuoi,
  sinhDuLieuMau,
} from "./du-lieu-mau.mjs";
import { CAU_XOA, napMau, xoaMau } from "./nap.mjs";
import { MAU_A, MAU_B } from "./mau-file.mjs";
import { THU_MUC_MAU } from "./sinh.mjs";
import { chuCot } from "./xlsx.mjs";

const GOC = path.dirname(fileURLToPath(import.meta.url));
// Vắng DATABASE_URL (lượt chấm chạy trong vỏ mới) thì lùi về Postgres dãy T — luật 7 của đợt nen-dau: T → 5547.
const URL_DB = process.env.DATABASE_URL ?? "postgres://postgres:quyhang@localhost:5547/postgres";
const TEP = ["du-lieu-mau.json", "mau-a.xlsx", "mau-b.xlsx"];
const SAN_DOI_CHUNG = "[Tên sàn] đối chứng";
const EMAIL_DOI_CHUNG = "doi-chung@vi-du.test";
const DUOI_MAU = `@${MIEN_EMAIL}`;
const SO_DUNG_MAU = /^0900 000 0\d\d$/;

const sha = (b) => createHash("sha256").update(b).digest("hex");
const tam = () => mkdtempSync(path.join(tmpdir(), "du-lieu-mau-"));
const banSao = (x) => structuredClone(x);
const docGoc = () => JSON.parse(readFileSync(path.join(THU_MUC_MAU, "du-lieu-mau.json"), "utf8"));
const chayNode = (args) =>
  spawnSync(process.execPath, args, { encoding: "utf8", env: { ...process.env, DATABASE_URL: URL_DB } });
const coLoi = (loi, ghim) => loi.some((l) => l.startsWith(ghim));

function docPy(tep) {
  const r = spawnSync("python3", ["-I", path.join(GOC, "doc-xlsx.py"), tep], { encoding: "utf8" });
  if (r.status !== 0) throw new Error(`doc-xlsx.py thoát ${r.status}: ${r.stderr.trim().split("\n").at(-1)}`);
  return JSON.parse(r.stdout);
}

// Thay một ô của bản sao tệp bằng zipfile của Python — tạo vật phá thử không qua bộ ghi của kho.
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
const oChu = (ref, s) => `<c r="${ref}" t="inlineStr"><is><t>${s}</t></is></c>`;
const oSo = (ref, n) => `<c r="${ref}"><v>${n}</v></c>`;
const refCot = (mau, tieuDe, dong) => `${chuCot(mau.cot.findIndex((c) => c.tieuDe === tieuDe))}${dong}`;

/** Quét một tệp Excel đọc lại: chuỗi, ô số ở cột điện thoại (tìm theo tiêu đề), cột tên người. */
function kiemXlsxThat(doc) {
  const [dau, ...dong] = doc.dong;
  const cotSo = dau.flatMap((t, i) => (/SĐT|điện thoại/i.test(t) ? [i] : []));
  const cotTen = dau.flatMap((t, i) => (/^(Chủ nhà|Tên chủ nhà|Đầu chủ|Người phụ trách)$/.test(t) ? [i] : []));
  const loi = [];
  const dem = { so: 0, email: 0, ten: 0, giaLon: 0 };
  for (const [r, cac] of dong.entries()) {
    for (const [i, gt] of cac.entries()) {
      const noi = `${doc.sheet}!${chuCot(i)}${r + 2}`;
      if (typeof gt === "string") {
        const q = quetChuoi(gt, noi);
        loi.push(...q.loi);
        dem.so += q.so;
        dem.email += q.email;
        if (cotSo.includes(i) && !SO_DUNG_MAU.test(gt)) loi.push(`số không đúng dạng mẫu: ${noi}`);
      } else if (typeof gt === "number") {
        if (cotSo.includes(i)) loi.push(...kiemOSoDienThoai(gt, noi));
        else if (gt >= 1e9) dem.giaLon++;
      }
      if (cotTen.includes(i)) {
        dem.ten++;
        if (!String(gt).startsWith(TIEN_TO_TEN)) loi.push(`tên không mang nhãn mẫu: ${noi}`);
      }
    }
  }
  return { loi, dem, cotSo };
}

// ——— Cơ sở dữ liệu ———————————————————————————————————————————————————————————————————————————————

const host = new URL(URL_DB).hostname;
assert.ok(["localhost", "127.0.0.1", "::1", "[::1]"].includes(host), `bài kiểm chỉ chạy trên Postgres của máy, không trên ${host}`);
const pool = new pg.Pool({ connectionString: URL_DB, max: 2 });
after(async () => {
  const c = await pool.connect();
  try {
    await donSach(c);
  } finally {
    c.release();
    await pool.end();
  }
});

async function voiKetNoi(fn) {
  const c = await pool.connect();
  try {
    return await fn(c);
  } finally {
    c.release();
  }
}

/** Trong một giao dịch rồi hoàn lại — cho mọi phá thử ghi vào cơ sở dữ liệu. */
async function roiHoanLai(c, fn) {
  await c.query("begin");
  try {
    return await fn();
  } finally {
    await c.query("rollback");
  }
}

async function donSach(c) {
  await xoaMau(c);
  await c.query(`delete from identity."user" where email = $1`, [EMAIL_DOI_CHUNG]);
  await c.query("delete from companies where name = $1", [SAN_DOI_CHUNG]);
}

function napQuaTienTrinhCon() {
  const r = chayNode([path.join(GOC, "nap.mjs"), "--nap"]);
  assert.equal(r.status, 0, `nap.mjs --nap thoát ${r.status}: ${r.stderr}`);
}

/** Ảnh chụp năm bảng, mỗi dòng một khoá; không lọc theo nhãn. */
async function chup(c) {
  const q = async (sql) => (await c.query(sql)).rows;
  return {
    companies: await q("select id::text as k, name from companies"),
    users: await q(`select id as k, name, email from identity."user"`),
    company_members: await q(`select m.company_id || '/' || m.user_id as k, c.name as san, u.email, m.roles
      from company_members m join companies c on c.id = m.company_id join identity."user" u on u.id = m.user_id`),
    company_zones: await q(`select z.id::text as k, c.name as san, z.name
      from company_zones z join companies c on c.id = z.company_id`),
    member_zones: await q(`select mz.company_id || '/' || mz.user_id || '/' || mz.zone_id as k, c.name as san, u.email, z.name as khu
      from member_zones mz join companies c on c.id = mz.company_id join identity."user" u on u.id = mz.user_id
      join company_zones z on z.id = mz.zone_id`),
  };
}
const chenhLech = (truoc, sau) =>
  Object.fromEntries(Object.entries(sau).map(([b, ds]) => [b, ds.filter((r) => !truoc[b].some((x) => x.k === r.k))]));

const NHAN_DONG = {
  companies: (r) => r.name === TEN_SAN,
  users: (r) => r.email.endsWith(DUOI_MAU),
  company_members: (r) => r.san === TEN_SAN && r.email.endsWith(DUOI_MAU),
  company_zones: (r) => r.san === TEN_SAN,
  member_zones: (r) => r.san === TEN_SAN && r.email.endsWith(DUOI_MAU),
};
const nhanDong = (moi) => Object.entries(moi).flatMap(([b, ds]) => ds.map((r) => NHAN_DONG[b](r)));

/** Dòng mẫu còn lại ở từng bảng: mang tên sàn thử hoặc email miền mẫu. */
async function demDongMau(c) {
  const s = await chup(c);
  const la = { users: (r) => r.email.endsWith(DUOI_MAU), companies: (r) => r.name === TEN_SAN };
  const conLai = (r) => r.san === TEN_SAN || (r.email ?? "").endsWith(DUOI_MAU);
  return Object.fromEntries(Object.entries(s).map(([b, ds]) => [b, ds.filter(la[b] ?? conLai).length]));
}

/** Nội dung mẫu không kèm mã: so được giữa hai lần nạp. */
async function noiDungMau(c) {
  const s = await chup(c);
  const xep = (ds) => ds.map((r) => JSON.stringify({ ...r, k: undefined })).sort();
  return {
    companies: xep(s.companies.filter((r) => r.name === TEN_SAN)),
    users: xep(s.users.filter((r) => r.email.endsWith(DUOI_MAU))),
    company_members: xep(s.company_members.filter((r) => r.san === TEN_SAN)),
    company_zones: xep(s.company_zones.filter((r) => r.san === TEN_SAN)),
    member_zones: xep(s.member_zones.filter((r) => r.san === TEN_SAN)),
  };
}

// Ma trận viết trước: vai và khu phụ trách của từng người mẫu (Tham chiếu §2).
const MA_TRAN_VAI = {
  telesales: ["telesales"],
  "dau-chu-1": ["listing_agent"],
  "dau-chu-2": ["listing_agent"],
  "dau-khach": ["buyer_agent"],
  "truong-nhom": ["team_lead"],
  "quan-tri": ["company_admin"],
};
const MA_TRAN_KHU = ['{"san":"[Mẫu] Sàn thử","email":"dau-chu-1@mau.quy-hang.test","khu":"Toà A"}', '{"san":"[Mẫu] Sàn thử","email":"dau-chu-2@mau.quy-hang.test","khu":"Toà B"}'];

async function kiemNap(c) {
  const loi = [];
  const s = await chup(c);
  const san = s.companies.filter((r) => r.name === TEN_SAN);
  if (san.length !== 1) loi.push(`sàn thử: ${san.length} dòng`);
  const nguoi = s.users.filter((r) => r.email.endsWith(DUOI_MAU));
  if (nguoi.length !== 6) loi.push(`tài khoản mẫu: ${nguoi.length}`);
  for (const [khoa, vai] of Object.entries(MA_TRAN_VAI)) {
    const m = s.company_members.find((r) => r.san === TEN_SAN && r.email === `${khoa}${DUOI_MAU}`);
    if (!m || JSON.stringify([...m.roles].sort()) !== JSON.stringify(vai)) loi.push(`vai lệch: ${khoa}`);
  }
  const khu = s.company_zones.filter((r) => r.san === TEN_SAN).map((r) => r.name).sort();
  if (JSON.stringify(khu) !== JSON.stringify(["Toà A", "Toà B"])) loi.push(`khu lệch: ${khu.join(", ")}`);
  const mz = (await noiDungMau(c)).member_zones;
  if (JSON.stringify(mz) !== JSON.stringify(MA_TRAN_KHU)) loi.push(`khu phụ trách lệch: ${mz.join(" ")}`);
  return loi;
}

async function anhDoiChung(c) {
  const s = await chup(c);
  return {
    san: s.companies.filter((r) => r.name === SAN_DOI_CHUNG).map((r) => r.k),
    nguoi: s.users.filter((r) => r.email === EMAIL_DOI_CHUNG).map((r) => r.k),
    vai: s.company_members.filter((r) => r.san === SAN_DOI_CHUNG).map((r) => `${r.email}:${r.roles}`),
  };
}
async function kiemDoiChung(c, truoc) {
  const sau = await anhDoiChung(c);
  return JSON.stringify(sau) === JSON.stringify(truoc) ? [] : [`xoá ngoài nhãn mẫu: ${JSON.stringify(sau)}`];
}

// ——— Tiêu chí ————————————————————————————————————————————————————————————————————————————————————

test("AC-1 tất định", () => {
  const ra = [tam(), tam()];
  for (const d of ra) {
    const r = chayNode([path.join(GOC, "sinh.mjs"), "--ra", d]);
    assert.equal(r.status, 0, r.stderr);
  }
  for (const t of TEP) {
    const [a, b] = ra.map((d) => sha(readFileSync(path.join(d, t))));
    assert.equal(a, b, `${t}: hai tiến trình ra hai băm`);
    assert.equal(a, sha(readFileSync(path.join(THU_MUC_MAU, t))), `${t}: lệch tệp đã commit`);
  }
  const kiem = chayNode([path.join(GOC, "sinh.mjs"), "--kiem"]);
  assert.equal(kiem.status, 0, kiem.stderr);

  // Đối chứng: hạt giống khác thì bộ dữ liệu khác.
  assert.notEqual(JSON.stringify(sinhDuLieuMau({ hatGiong: 7 })), JSON.stringify(sinhDuLieuMau()));

  // Phá thử: sửa một byte bản sao tệp trong kho → --kiem đỏ.
  const pha = tam();
  cpSync(THU_MUC_MAU, pha, { recursive: true });
  const tep = path.join(pha, "du-lieu-mau.json");
  const b = readFileSync(tep);
  b[100] = b[100] === 0x61 ? 0x62 : 0x61;
  writeFileSync(tep, b);
  const r = chayNode([path.join(GOC, "sinh.mjs"), "--kiem", "--ra", pha]);
  assert.equal(r.status, 1);
  assert.match(r.stderr, /lệch tệp trong kho/);
});

test("AC-2 không dữ liệu thật", async () => {
  const d = docGoc();
  const kq = kiemDuLieuThat(d);
  assert.deepEqual(kq.loi, []);
  assert.ok(kq.dem.so > 0 && kq.dem.email > 0 && kq.dem.ten > 0, `đối chứng dương: ${JSON.stringify(kq.dem)}`);

  const tepA = path.join(THU_MUC_MAU, MAU_A.tenTep);
  const tepB = path.join(THU_MUC_MAU, MAU_B.tenTep);
  for (const t of [tepA, tepB]) {
    const x = kiemXlsxThat(docPy(t));
    assert.deepEqual(x.loi, [], t);
    assert.ok(x.cotSo.length === 1 && x.dem.so > 0 && x.dem.ten > 0, `${t}: ${JSON.stringify(x.dem)}`);
  }
  // Đối chứng: ô giá ≥ 1e9 của mẫu B không bị đếm là số điện thoại.
  const xB = kiemXlsxThat(docPy(tepB));
  assert.equal(xB.dem.giaLon, 40);

  await voiKetNoi(async (c) => {
    await donSach(c);
    const truoc = await chup(c);
    napQuaTienTrinhCon();
    const moi = chenhLech(truoc, await chup(c));
    const loi = [];
    const dem = { email: 0, ten: 0 };
    for (const [bang, ds] of Object.entries(moi))
      for (const r of ds)
        for (const [k, gt] of Object.entries(r)) {
          if (typeof gt !== "string" || k === "k") continue;
          const q = quetChuoi(gt, `${bang}.${k}`);
          loi.push(...q.loi);
          dem.email += q.email;
        }
    for (const r of [...moi.companies, ...moi.users]) {
      dem.ten++;
      if (!r.name.startsWith(TIEN_TO_TEN)) loi.push(`tên không mang nhãn mẫu: ${r.name}`);
    }
    assert.deepEqual(loi, []);
    assert.ok(dem.email > 0 && dem.ten === 7, JSON.stringify(dem));
  });

  // Phá thử trên bản sao bộ dữ liệu.
  const p1 = banSao(d);
  p1.hang[0].ghiChu = "0912 345 678";
  assert.ok(coLoi(kiemDuLieuThat(p1).loi, "số không đúng dạng mẫu"));
  const p2 = banSao(d);
  p2.hang[0].ghiChu = "ten@gmail.com";
  assert.ok(coLoi(kiemDuLieuThat(p2).loi, "email không thuộc miền mẫu"));
  const p3 = banSao(d);
  p3.chuNha[0].ten = "Nguyễn Văn A";
  assert.ok(coLoi(kiemDuLieuThat(p3).loi, "tên không mang nhãn mẫu"));
  // Ma trận dạng viết viết trước, số giả 0999 999 999 (không phải số mẫu): mọi dạng phải đỏ. Bất biến kiểm: không
  // chuỗi nào chứa đủ chữ số của một số điện thoại mà qua lặng (không đỏ, không được đếm là số mẫu).
  const DAU_NOI = [" ", ".", "-", "–", "—", "/", "\t", "\u00a0", "\u202f", " - ", ") ", ",", ";", ":", "    ", " -- ", "\n"];
  for (const dau of DAU_NOI) {
    const that = quetChuoi(`Gọi ${["0999", "999", "999"].join(dau)} nhé`);
    assert.ok(coLoi(that.loi, "số không đúng dạng mẫu"), `số giả nối bằng ${JSON.stringify(dau)}`);
    const mau = quetChuoi(`Gọi ${["0900", "000", "001"].join(dau)} nhé`);
    assert.ok(mau.loi.length > 0 || mau.so === 1, `số mẫu nối bằng ${JSON.stringify(dau)} qua lặng`);
  }
  for (const s of [
    "０９９９９９９９９９",
    "٠٩٩٩٩٩٩٩٩٩",
    "999,999,999",
    "(099) 999 9999",
    "0999 lần 999 rồi 999",
    "0999999999 0999999998",
    "0999 999 999 2 phòng",
    "+84 999 999 999",
    "Gọi 0900 000 001 hoặc +84999999999",
    "0900 000 0011",
  ])
    assert.ok(coLoi(quetChuoi(s).loi, "số không đúng dạng mẫu"), s);
  // Đối chứng dương: chỗ được phép có chữ số không đỏ; số mẫu đúng dạng được đếm.
  for (const s of ["2026-10-30T00:00:00+07:00", "urn:onehub:upi:mau:A-12.05", "Xem nhà sau 18 giờ", "[Mẫu] Chủ nhà 30", "Diện tích (m²)"])
    assert.deepEqual(quetChuoi(s).loi, [], s);
  assert.equal(quetChuoi("0900 000 001, 0900 000 002").so, 2);
  assert.deepEqual(quetChuoi("0900 000 001, 0900 000 002").loi, []);

  // Phá thử trên bản sao mau-b.xlsx.
  const pB1 = thayO(tepB, refCot(MAU_B, "Số điện thoại chủ nhà", 2), oSo(refCot(MAU_B, "Số điện thoại chủ nhà", 2), 912345678));
  assert.ok(coLoi(kiemXlsxThat(docPy(pB1)).loi, "số không đúng dạng mẫu"));
  const pB2 = thayO(tepB, refCot(MAU_B, "Dự án", 2), oChu(refCot(MAU_B, "Dự án", 2), "ten@gmail.com"));
  assert.ok(coLoi(kiemXlsxThat(docPy(pB2)).loi, "email không thuộc miền mẫu"));
});

test("AC-3 nhãn mẫu", async () => {
  const d = docGoc();
  const dongA = docPy(path.join(THU_MUC_MAU, MAU_A.tenTep)).dong;
  const dongB = docPy(path.join(THU_MUC_MAU, MAU_B.tenTep)).dong;
  const nhanTep = (dong) => {
    const i = dong[0].indexOf("Nhãn");
    return dong.slice(1).map((r) => r[i] === NHAN);
  };
  const moi = await voiKetNoi(async (c) => {
    await donSach(c);
    const truoc = await chup(c);
    napQuaTienTrinhCon();
    return chenhLech(truoc, await chup(c));
  });

  const MA_TRAN = { sàn: 1, người: 6, căn: 180, "chủ nhà": 30, hàng: 40, lead: 12, "dòng mẫu A": 40, "dòng mẫu B": 40, "dòng cơ sở dữ liệu": 17 };
  const ca = (dl, a, b, db) => {
    const k = kiemNhan(dl);
    const t = demNhan({ "dòng mẫu A": nhanTep(a), "dòng mẫu B": nhanTep(b), "dòng cơ sở dữ liệu": nhanDong(db) });
    return { loi: [...k.loi, ...t.loi], dem: { ...k.dem, ...t.dem } };
  };
  const kq = ca(d, dongA, dongB, moi);
  assert.deepEqual(kq.loi, []);
  for (const [loai, n] of Object.entries(MA_TRAN)) {
    assert.equal(kq.dem[loai].tong, n, `${loai}: số bản ghi`);
    assert.equal(kq.dem[loai].nhan, n, `${loai}: số mang nhãn`);
  }

  // Phá thử: xoá nhãn một bản ghi mỗi loại trong bản sao.
  const pha = {
    sàn: (x) => delete x.san.nhan,
    người: (x) => delete x.nguoi[2].nhan,
    căn: (x) => (x.danhMuc.projects[0].buildings[1].units[7].upi = "urn:onehub:upi:B-02.02"),
    "chủ nhà": (x) => delete x.chuNha[4].nhan,
    hàng: (x) => delete x.hang[9].nhan,
    lead: (x) => delete x.lead[3].nhan,
  };
  for (const [loai, fn] of Object.entries(pha)) {
    const x = banSao(d);
    fn(x);
    assert.ok(ca(x, dongA, dongB, moi).loi.includes(`thiếu nhãn mẫu: ${loai}`), loai);
  }
  for (const [loai, a, b] of [["dòng mẫu A", banSao(dongA), dongB], ["dòng mẫu B", dongA, banSao(dongB)]]) {
    const dong = loai === "dòng mẫu A" ? a : b;
    dong[5][dong[0].indexOf("Nhãn")] = null;
    assert.ok(ca(d, a, b, moi).loi.includes(`thiếu nhãn mẫu: ${loai}`), loai);
  }
  // Phá thử: bản sao bộ nạp chèn thêm một người email @vi-du.test vào sàn thử.
  await voiKetNoi(async (c) => {
    await xoaMau(c);
    const truoc = await chup(c);
    const lech = await roiHoanLai(c, async () => {
      const { san } = await napMau(c, d);
      const u = (await c.query(`insert into identity."user" (id, name, email, "emailVerified")
        values (gen_random_uuid()::text, '[Mẫu] Người lạ', 'nguoi-la@vi-du.test', true) returning id`)).rows[0].id;
      await c.query("insert into company_members (company_id, user_id, roles) values ($1, $2, '{telesales}')", [san, u]);
      return chenhLech(truoc, await chup(c));
    });
    assert.ok(ca(d, dongA, dongB, lech).loi.includes("thiếu nhãn mẫu: dòng cơ sở dữ liệu"));
    napQuaTienTrinhCon();
  });
});

test("AC-4 khuôn danh mục", () => {
  const d = docGoc();
  const kq = kiemKhuonDanhMuc(d.danhMuc, CatalogFeed);
  assert.deepEqual(kq.loi, []);
  assert.equal(kq.tong, 180);
  assert.equal(kq.duyNhat, 180);
  assert.ok(CatalogFeed.safeParse(d.danhMuc).success);

  const p1 = banSao(d.danhMuc);
  p1.projects[0].buildings[0].units[0].nhan = NHAN;
  assert.equal(CatalogFeed.safeParse(p1).success, false, "khuôn phải từ chối khoá lạ");
  assert.ok(coLoi(kiemKhuonDanhMuc(p1, CatalogFeed).loi, "khuôn danh mục từ chối"));
  const p2 = banSao(d.danhMuc);
  p2.projects[0].buildings[1].units[40].floor += 1;
  assert.ok(coLoi(kiemKhuonDanhMuc(p2, CatalogFeed).loi, "mã căn lệch thuộc tính"));
  const p3 = banSao(d.danhMuc);
  p3.projects[0].buildings[1].units[12].stack = "07";
  assert.ok(kiemKhuonDanhMuc(p3, CatalogFeed).loi.includes(`mã căn lệch thuộc tính: ${p3.projects[0].buildings[1].units[12].unitNumber}`), "lệch trục");
  const p4 = banSao(d.danhMuc);
  p4.projects[0].buildings[1].units[30].unitNumber = p4.projects[0].buildings[1].units[30].unitNumber.replace(/^B/, "C");
  assert.ok(kiemKhuonDanhMuc(p4, CatalogFeed).loi.includes(`mã căn lệch thuộc tính: ${p4.projects[0].buildings[1].units[30].unitNumber}`), "lệch toà");
});

test("AC-5 luật Tham chiếu", () => {
  const d = docGoc();
  assert.deepEqual(kiemLuatThamChieu(d).loi, []);
  assert.deepEqual([...new Set(d.hang.map((h) => h.trangThai))].sort(), [...TRANG_THAI].sort());

  const mo = d.hang.find((h) => TRANG_THAI_MO.includes(h.trangThai));
  const p1 = banSao(d);
  p1.hang.push({ ...mo, ma: "H-41", trangThai: "Active" });
  assert.ok(coLoi(kiemLuatThamChieu(p1).loi, "căn có hai hàng mở"));

  const demChu = Object.groupBy(d.hang, (h) => h.chuNha);
  const chuNhieu = Object.keys(demChu).find((k) => demChu[k].length > 1);
  assert.ok(chuNhieu, "phải có chủ nhiều căn");
  const p2 = banSao(d);
  const h = p2.hang.find((x) => x.chuNha === chuNhieu);
  h.dauChu = h.dauChu === "dau-chu-1" ? "dau-chu-2" : "dau-chu-1";
  assert.ok(coLoi(kiemLuatThamChieu(p2).loi, "một chủ hai đầu chủ"));

  const p3 = banSao(d);
  for (const x of p3.hang) if (x.trangThai === "Withdrawn") x.trangThai = "Closed";
  assert.ok(coLoi(kiemLuatThamChieu(p3).loi, "thiếu trạng thái"));

  const p4 = banSao(d);
  for (const l of p4.lead) l.maCan = null;
  assert.ok(kiemLuatThamChieu(p4).loi.includes("thiếu lead trên căn đã có hàng mở"));
  const p5 = banSao(d);
  const soChu = new Set(p5.chuNha.map((c) => c.soDienThoai));
  for (const l of p5.lead) if (soChu.has(l.soDienThoai)) l.soDienThoai = "0900 000 099";
  assert.ok(kiemLuatThamChieu(p5).loi.includes("thiếu lead mang số của chủ nhà đã có"));
});

// Kỳ vọng từng cột viết riêng ở bài kiểm, không lấy từ mau-file.mjs.
const TT_DU = { Incomplete: "Chưa đủ để rao", Active: "Đang bán", Pending: "Đang giao dịch", Closed: "Đã bán", Hold: "Tạm ngừng", Withdrawn: "Ngừng hẳn" };
const TT_TAT = { Incomplete: "Chưa đủ", Active: "Đang bán", Pending: "Đang GD", Closed: "Đã bán", Hold: "Tạm ngừng", Withdrawn: "Ngừng" };
function kyVong(d) {
  const can = new Map(d.danhMuc.projects[0].buildings.flatMap((b) => b.units.map((u) => [u.unitNumber, { ...u, toa: b.buildingName }])));
  const chu = new Map(d.chuNha.map((x) => [x.ma, x]));
  const ten = new Map(d.nguoi.map((x) => [x.khoa, x.ten]));
  const chung = (h) => ({
    "Mã căn": h.maCan,
    Toà: can.get(h.maCan).toa,
    "Ghi chú": h.ghiChu || null,
    Nhãn: "Mẫu",
  });
  return {
    a: (h) => ({
      ...chung(h),
      DT: can.get(h.maCan).livingArea,
      PN: can.get(h.maCan).bedroomsTotal,
      Hướng: can.get(h.maCan).directionFaces,
      "Giá (tỷ)": Math.round(h.gia / 1e7) / 100,
      "Phí CN": h.dieuKienPhi === "bao_phi" ? "BP" : "KBP",
      TT: TT_TAT[h.trangThai],
      "Chủ nhà": chu.get(h.chuNha).ten,
      "SĐT chủ": chu.get(h.chuNha).soDienThoai,
      "Đầu chủ": ten.get(h.dauChu),
    }),
    b: (h, i) => ({
      ...chung(h),
      STT: i + 1,
      "Trạng thái": TT_DU[h.trangThai],
      "Dự án": "[Mẫu] Dự án căn hộ thử",
      Tầng: can.get(h.maCan).floor,
      "Diện tích (m²)": can.get(h.maCan).livingArea,
      "Số phòng ngủ": can.get(h.maCan).bedroomsTotal,
      "Hướng ban công": can.get(h.maCan).directionFaces,
      "Giá chào (VNĐ)": h.gia,
      "Điều kiện phí": h.dieuKienPhi === "bao_phi" ? "Đã gồm phí" : "Chưa gồm phí",
      "Người phụ trách": ten.get(h.dauChu),
      "Tên chủ nhà": chu.get(h.chuNha).ten,
      "Số điện thoại chủ nhà": chu.get(h.chuNha).soDienThoai,
    }),
  };
}
function soTep(doc, khoa, d) {
  const [dau, ...dong] = doc.dong;
  const loi = [];
  if (dong.length !== d.hang.length) loi.push(`số dòng ${dong.length} ≠ ${d.hang.length}`);
  const iMa = dau.indexOf("Mã căn");
  const theoMa = new Map(dong.map((r) => [r[iMa], r]));
  const kv = kyVong(d)[khoa];
  for (const [i, h] of d.hang.entries()) {
    const r = theoMa.get(h.maCan);
    if (!r) {
      loi.push(`thiếu dòng: ${h.maCan}`);
      continue;
    }
    const mong = kv(h, i);
    if (Object.keys(mong).length !== dau.length) loi.push(`số cột kỳ vọng ${Object.keys(mong).length} ≠ ${dau.length}`);
    for (const [c, tieuDe] of dau.entries()) if ((r[c] ?? null) !== mong[tieuDe]) loi.push(`ô lệch hàng mẫu: ${h.maCan} «${tieuDe}»`);
  }
  return loi;
}

test("AC-6 hai mẫu file", () => {
  const d = docGoc();
  const docA = docPy(path.join(THU_MUC_MAU, MAU_A.tenTep));
  const docB = docPy(path.join(THU_MUC_MAU, MAU_B.tenTep));
  assert.deepEqual(soTep(docA, "a", d), []);
  assert.deepEqual(soTep(docB, "b", d), []);
  assert.equal(docA.sheet, "Sheet đầu chủ");
  assert.notDeepEqual(docA.dong[0], docB.dong[0]);
  assert.notEqual(docA.dong[0].indexOf("Mã căn"), docB.dong[0].indexOf("Mã căn"), "thứ tự cột phải khác");
  assert.ok(docB.dong[0].includes("Diện tích (m²)") && docB.dong[1].includes("[Mẫu] Dự án căn hộ thử"), "chữ có dấu phải nguyên");

  // Phá thử: sửa một ô giá trong bản sao tệp.
  const ref = refCot(MAU_B, "Giá chào (VNĐ)", 2);
  const pha = thayO(path.join(THU_MUC_MAU, MAU_B.tenTep), ref, oSo(ref, d.hang[0].gia + 1));
  assert.ok(soTep(docPy(pha), "b", d).includes(`ô lệch hàng mẫu: ${d.hang[0].maCan} «Giá chào (VNĐ)»`));
  // Phá thử: lật một byte giữa tệp → bộ đọc Python từ chối (CRC).
  const hong = path.join(tam(), "hong.xlsx");
  const b = readFileSync(path.join(THU_MUC_MAU, MAU_A.tenTep));
  b[2000] ^= 0xff;
  writeFileSync(hong, b);
  assert.throws(() => docPy(hong), /doc-xlsx.py thoát/);
});

test("AC-7 nạp", async () => {
  await voiKetNoi(async (c) => {
    await donSach(c);
    assert.deepEqual(Object.values(await demDongMau(c)), [0, 0, 0, 0, 0]);
    napQuaTienTrinhCon();
    assert.deepEqual(await kiemNap(c), []);
    const dem1 = await demDongMau(c);
    const nd1 = await noiDungMau(c);
    assert.deepEqual(dem1, { companies: 1, users: 6, company_members: 6, company_zones: 2, member_zones: 2 });
    napQuaTienTrinhCon();
    assert.deepEqual(await demDongMau(c), dem1);
    assert.deepEqual(await noiDungMau(c), nd1);

    // Phá thử: nạp bản sao ma trận vai sai một vai.
    const p = banSao(docGoc());
    p.nguoi.find((n) => n.khoa === "dau-khach").vai = ["telesales"];
    const loi = await roiHoanLai(c, async () => {
      await napMau(c, p);
      return kiemNap(c);
    });
    assert.ok(loi.includes("vai lệch: dau-khach"), JSON.stringify(loi));
  });
});

test("AC-8 xoá một lần", async () => {
  await voiKetNoi(async (c) => {
    await donSach(c);
    napQuaTienTrinhCon();
    await c.query("begin");
    await moSan(c, { ten: SAN_DOI_CHUNG, email: EMAIL_DOI_CHUNG });
    await c.query("commit");
    const doiChung = await anhDoiChung(c);
    assert.ok(doiChung.san.length === 1 && doiChung.nguoi.length === 1 && doiChung.vai.length === 1, JSON.stringify(doiChung));
    const nd1 = await noiDungMau(c);

    const r = chayNode([path.join(GOC, "nap.mjs"), "--xoa"]);
    assert.equal(r.status, 0, r.stderr);
    assert.deepEqual(await demDongMau(c), { companies: 0, users: 0, company_members: 0, company_zones: 0, member_zones: 0 });
    assert.deepEqual(await kiemDoiChung(c, doiChung), []);
    napQuaTienTrinhCon();
    assert.deepEqual(await noiDungMau(c), nd1);

    // Phá thử: bản sao lệnh xoá bỏ điều kiện miền email.
    const banSaoXoa = CAU_XOA.map(([sql, t]) => (sql.includes("email like") ? [sql.replace(/ where email like \$1/, ""), []] : [sql, t]));
    assert.notDeepEqual(banSaoXoa, CAU_XOA, "bản sao phải khác lệnh thật");
    const loi = await roiHoanLai(c, async () => {
      await xoaMau(c, banSaoXoa);
      return kiemDoiChung(c, doiChung);
    });
    assert.ok(coLoi(loi, "xoá ngoài nhãn mẫu"), JSON.stringify(loi));
  });
});
