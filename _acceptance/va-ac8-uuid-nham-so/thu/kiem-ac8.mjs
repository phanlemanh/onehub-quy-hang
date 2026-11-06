// Bài đo của hàng vá va-ac8-uuid-nham-so: bài «AC-8 không dữ liệu thật» không còn đỏ chập chờn vì UUID ngẫu nhiên.
//   node kiem-ac8.mjs --lap <N>              chạy AC-8 (cần cơ sở dữ liệu) N lần trên một cơ sở dữ liệu tạm, mỗi lần UUID mới
//   node kiem-ac8.mjs --tron                 chạy CẢ tệp kiểm một lần trên cơ sở dữ liệu tạm; đòi ✔ của hai ca AC-8
//   node kiem-ac8.mjs --doi-chung-do <sha>   tệp kiểm của nhánh chính tại <sha> + ca «AC-8 dò số» của cây: ca ấy phải ĐỎ
// Cơ sở dữ liệu tạm tạo trên Postgres của DATABASE_URL (mặc định dãy D, cổng 5575), migrate, rồi DROP. Mỗi dòng JSON một ca.
// Thoát 0 = đạt kỳ vọng · 1 = lệch · 2 = không chạy được.
import { spawnSync } from "node:child_process";
import { readFileSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";

const DAY = path.dirname(fileURLToPath(import.meta.url));
const GOC = path.resolve(DAY, "../../..");
const TUONG_DOI = "packages/db/tests/du-lieu-mau-thap-tang.test.mjs";
const TEP = path.join(GOC, TUONG_DOI);
const URL_GOC = new URL(process.env.DATABASE_URL ?? "postgres://postgres:quyhang@localhost:5575/postgres");
const urlCua = (ten) => {
  const u = new URL(URL_GOC);
  u.pathname = `/${ten}`;
  return u.toString();
};
async function quanTri(sql) {
  const c = new pg.Client({ connectionString: urlCua(URL_GOC.pathname.slice(1) || "postgres") });
  await c.connect();
  try {
    await c.query(sql);
  } finally {
    await c.end();
  }
}
const chay = (tep, mau, db) =>
  spawnSync(process.execPath, ["--test", "--test-reporter=spec", "--test-name-pattern", mau, tep], {
    cwd: GOC,
    env: { ...process.env, ...(db ? { DATABASE_URL: urlCua(db) } : {}) },
    encoding: "utf8",
    timeout: 300_000,
  });

const ket = [];
const lapI = process.argv.indexOf("--lap");
const dcdI = process.argv.indexOf("--doi-chung-do");
try {
  if (lapI > 0) {
    const n = Number(process.argv[lapI + 1]);
    const ten = `ac8_lap_${process.pid}`;
    await quanTri(`drop database if exists "${ten}"`);
    await quanTri(`create database "${ten}"`);
    try {
      const m = spawnSync("npm", ["run", "db:migrate"], { cwd: GOC, env: { ...process.env, DATABASE_URL: urlCua(ten) }, encoding: "utf8" });
      if (m.status !== 0) throw new Error(`migrate lỗi: ${(m.stderr || m.stdout).slice(-300)}`);
      let do_ = 0;
      let chayThat = 0;
      const mau = [];
      for (let i = 0; i < n; i++) {
        const r = chay(TEP, "^AC-8", ten);
        const ra = `${r.stdout}\n${r.stderr}`;
        // Đối chứng dương: ca AC-8 cần cơ sở dữ liệu thật sự chạy (không bị bỏ qua) trong lần này.
        if (/✔ AC-8 không dữ liệu thật/.test(ra) || /✖ AC-8 không dữ liệu thật/.test(ra)) chayThat++;
        if (r.status !== 0) {
          do_++;
          if (mau.length < 2) mau.push(ra.split("\n").filter((l) => /số không đúng dạng|AssertionError/.test(l)).slice(0, 2).join(" | "));
        }
      }
      const loi = [];
      if (chayThat !== n) loi.push(`đối chứng dương hỏng: AC-8 cần cơ sở dữ liệu chỉ chạy ${chayThat}/${n} lần`);
      if (do_) loi.push(`AC-8 đỏ ${do_}/${n} lần: ${mau.join(" || ")}`);
      ket.push({ ca: "lap", lan: n, do: do_, ok: loi.length === 0, loi });
    } finally {
      await quanTri(`drop database if exists "${ten}" with (force)`).catch((e) => console.error(`cảnh báo: không xoá được ${ten}: ${e.message}`));
    }
  } else if (process.argv.includes("--tron")) {
    const ten = `ac8_tron_${process.pid}`;
    await quanTri(`drop database if exists "${ten}"`);
    await quanTri(`create database "${ten}"`);
    try {
      const m = spawnSync("npm", ["run", "db:migrate"], { cwd: GOC, env: { ...process.env, DATABASE_URL: urlCua(ten) }, encoding: "utf8" });
      if (m.status !== 0) throw new Error(`migrate lỗi: ${(m.stderr || m.stdout).slice(-300)}`);
      const r = spawnSync(process.execPath, ["--test", "--test-reporter=spec", TEP], { cwd: GOC, env: { ...process.env, DATABASE_URL: urlCua(ten) }, encoding: "utf8", timeout: 300_000 });
      const ra = `${r.stdout}\n${r.stderr}`;
      const loi = [];
      if (r.status !== 0) loi.push(`tệp kiểm đỏ: ${ra.split("\n").filter((l) => /^✖ |AssertionError|nhận nhầm|bỏ sót|phá thử/.test(l)).slice(0, 3).join(" | ")}`);
      for (const ca of ["AC-8 dò số", "AC-8 không dữ liệu thật"]) if (!ra.includes(`✔ ${ca}`)) loi.push(`không thấy «✔ ${ca}» — ca không chạy hay không đạt`);
      ket.push({ ca: "tron", ok: loi.length === 0, loi });
    } finally {
      await quanTri(`drop database if exists "${ten}" with (force)`).catch((e) => console.error(`cảnh báo: không xoá được ${ten}: ${e.message}`));
    }
  } else if (dcdI > 0) {
    const sha = process.argv[dcdI + 1];
    const cu = spawnSync("git", ["show", `${sha}:${TUONG_DOI}`], { cwd: GOC, encoding: "utf8", maxBuffer: 1 << 26 });
    if (cu.status !== 0) throw new Error(`không rút được ${TUONG_DOI} tại ${sha}: ${cu.stderr.trim()}`);
    // Ghép ca «AC-8 dò số» và ma trận của cây (giữa hai mốc trong tệp) vào bản cũ — cùng phép thử, khác phép dò.
    const nay = readFileSync(TEP, "utf8");
    const a = nay.indexOf("// Ma trận viết trước của phép dò số");
    const b = nay.indexOf("const TU_DIA_CHI = [");
    const c = nay.indexOf('test("AC-8 dò số:');
    const d = nay.indexOf("// ——— AC-9 ——");
    if (a < 0 || b < 0 || c < 0 || d < 0) throw new Error("không tìm thấy ma trận hay ca «AC-8 dò số» trong tệp kiểm của cây");
    const ghep = `${cu.stdout}\n${nay.slice(a, b)}\n${nay.slice(c, d)}\n`;
    const tep = path.join(path.dirname(TEP), `.ac8-cu-${process.pid}.test.mjs`);
    writeFileSync(tep, ghep);
    try {
      const r = chay(tep, "AC-8 dò số", null);
      const ra = `${r.stdout}\n${r.stderr}`;
      const loi = [];
      if (r.status === 0) loi.push("bản cũ xanh ở ca «AC-8 dò số» — phép đo không phân biệt được bản sửa");
      else if (!ra.includes("nhận nhầm số trong «14a1928b-9906-4b2b-af5e-03408001142f»")) loi.push(`bản cũ đỏ sai thông điệp: ${ra.split("\n").filter((l) => /AssertionError|nhận nhầm|bỏ sót/.test(l)).slice(0, 2).join(" | ")}`);
      ket.push({ ca: "doi-chung-do", sha, ok: loi.length === 0, loi });
    } finally {
      rmSync(tep, { force: true });
    }
  } else {
    console.error("thiếu --lap <N>, --tron hay --doi-chung-do <sha>");
    process.exit(2);
  }
} catch (e) {
  for (const k of ket) console.log(JSON.stringify(k));
  console.error(`không chạy được: ${e.message}`);
  process.exit(2);
}
for (const k of ket) console.log(JSON.stringify(k));
process.exit(ket.every((k) => k.ok) ? 0 : 1);
