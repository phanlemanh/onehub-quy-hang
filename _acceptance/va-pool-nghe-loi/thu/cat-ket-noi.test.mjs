// va-pool-nghe-loi AC-3 (E3), AC-6 (E8): cắt kết nối thật trên chỗ thử của hồ sơ va-pool-ket-noi — Postgres riêng (cổng
// 5598) sau công tắc mạng (cổng 5599). Tiến trình con `con-giu-pool.mts` nạp dungPools THẬT (hay pool trần làm đối chứng),
// giữ một kết nối rảnh hoặc đã mượn; bài thử cắt công tắc, chờ, mở lại, rồi bảo tiến trình con làm bước kế.
// Cần Docker. Chỗ thử dựng một lần ở đầu và dọn ở cuối.
import assert from "node:assert/strict";
import { execFileSync, spawn } from "node:child_process";
import { dirname, resolve } from "node:path";
import { after, before, test } from "node:test";
import { fileURLToPath } from "node:url";

const DAY = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(DAY, "../../..");
const CHO_THU = resolve(ROOT, "_acceptance/va-pool-ket-noi/thu/dung-su-co.mjs");
const CON = resolve(DAY, "con-giu-pool.mts");
const URL = "postgres://postgres:quyhang@127.0.0.1:5599/postgres";
const ngu = (ms) => new Promise((r) => setTimeout(r, ms));
const congTac = (lenh) => execFileSync(process.execPath, [CHO_THU, lenh], { cwd: ROOT, stdio: ["ignore", "pipe", "inherit"] }).toString();

before(() => {
  congTac("--dung");
  congTac("--mo");
});
after(() => {
  congTac("--don");
});

/** Chạy một kịch bản: giữ kết nối → cắt → chờ → mở → bảo bước kế. Trả mã thoát, stdout, stderr của tiến trình con. */
async function kichBan(cach, kieu) {
  congTac("--mo");
  const con = spawn(process.execPath, ["--import", "tsx", CON, cach, kieu], {
    cwd: ROOT,
    env: { ...process.env, DATABASE_URL: URL },
    stdio: ["pipe", "pipe", "pipe"],
  });
  let out = "";
  let err = "";
  con.stdout.on("data", (d) => (out += d));
  con.stderr.on("data", (d) => (err += d));
  const thoat = new Promise((r) => con.on("exit", (code, sig) => r(code ?? (sig ? 128 : 1))));
  for (let i = 0; !out.includes("san-sang"); i++) {
    if (con.exitCode !== null || i > 300) throw new Error(`cắt kết nối: tiến trình con không sẵn sàng\n${out}\n${err}`);
    await ngu(100);
  }
  congTac("--tat");
  await ngu(2000);
  const songSauCat = con.exitCode === null;
  congTac("--mo");
  await ngu(500);
  if (songSauCat) con.stdin.write("tiep\n");
  const ma = await Promise.race([thoat, ngu(20000).then(() => "het-gio")]);
  if (ma === "het-gio") con.kill("SIGKILL");
  return { ma, songSauCat, out, err };
}

test("cắt kết nối rảnh: tiến trình dùng dungPools sống qua cú cắt và truy vấn lại được", async () => {
  const r = await kichBan("dungPools", "ranh");
  assert.ok(r.songSauCat, `cắt kết nối rảnh: tiến trình con chết sau cú cắt\n${r.err}`);
  const dong = r.err.split("\n").filter((l) => l.includes("[pool:ung-dung·trang]"));
  assert.equal(dong.length, 1, `cắt kết nối rảnh: cần đúng 1 dòng nhật ký của pool, có ${dong.length}\n${r.err}`);
  assert.ok(r.out.includes("ket-qua 1"), `cắt kết nối rảnh: truy vấn sau khi mở lại không chạy\n${r.out}\n${r.err}`);
  assert.equal(r.ma, 0, `cắt kết nối rảnh: tiến trình con thoát ${r.ma}\n${r.err}`);
});

test("cắt kết nối rảnh: đối chứng — pool trần làm tiến trình chết", async () => {
  const r = await kichBan("tran", "ranh");
  assert.equal(r.songSauCat, false, "cắt kết nối rảnh: đối chứng pool trần vẫn sống — phép đo không phân biệt được");
  assert.notEqual(r.ma, 0, "cắt kết nối rảnh: đối chứng pool trần thoát 0");
  assert.match(r.err, /ECONNRESET|Connection terminated/, `cắt kết nối rảnh: đối chứng chết không vì lỗi kết nối\n${r.err}`);
});

test("cắt kết nối đã mượn: tiến trình dùng dungPools sống, truy vấn trên kết nối ấy nhận lỗi, pool chạy lại sau khi trả", async () => {
  const r = await kichBan("dungPools", "muon");
  assert.ok(r.songSauCat, `cắt kết nối đã mượn: tiến trình con chết sau cú cắt\n${r.err}`);
  assert.ok(r.out.includes("muon-tu-choi"), `cắt kết nối đã mượn: truy vấn trên kết nối đã cắt không nhận lỗi\n${r.out}`);
  assert.ok(r.out.includes("ket-qua 1"), `cắt kết nối đã mượn: pool không chạy lại sau khi trả\n${r.out}\n${r.err}`);
  assert.equal(r.ma, 0, `cắt kết nối đã mượn: tiến trình con thoát ${r.ma}\n${r.err}`);
});

test("cắt kết nối đã mượn: đối chứng — pool trần làm tiến trình chết", async () => {
  const r = await kichBan("tran", "muon");
  assert.equal(r.songSauCat, false, "cắt kết nối đã mượn: đối chứng pool trần vẫn sống — phép đo không phân biệt được");
  assert.notEqual(r.ma, 0, "cắt kết nối đã mượn: đối chứng pool trần thoát 0");
});
