// Nút «Nạp dữ liệu mẫu» (hàng 87, vá ở hàng va-nap-mau). Không dò chuỗi: rút khối `run:` của từng bước rồi CHẠY THẬT bằng
// bash với tệp sự kiện và tệp môi trường giả, đo quan hệ (thoát đúng chiều, tệp môi trường không đổi). Luật tĩnh còn lại
// (kênh lộ input) ở kiemWorkflow. Phân tích theo dòng — kho không khai thư viện YAML; khuôn tệp do chính kho viết.
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";

const GOC = path.join(path.dirname(fileURLToPath(import.meta.url)), "../../..");
const TEP = path.join(GOC, ".github/workflows/nap-mau.yml");
const TEN_SAN = "[Mẫu] Sàn thử";
const THAT = readFileSync(TEP, "utf8");

/** Môi trường cấp job: các dòng 6 dấu cách dưới `    env:` của job, trước `    steps:`. */
export function envJob(text) {
  const dong = text.split("\n");
  const dau = dong.findIndex((d) => /^ {4}env:\s*$/.test(d));
  const env = {};
  if (dau < 0) return env;
  for (const d of dong.slice(dau + 1)) {
    const m = /^ {6}([A-Z0-9_]+): (.*)$/.exec(d);
    if (!m) break;
    env[m[1]] = m[2];
  }
  return env;
}

/** Các bước của job: tên, env của bước, khối run (bỏ thụt), điều kiện if. */
export function cacBuoc(text) {
  const dong = text.split("\n");
  const dau = dong.findIndex((d) => /^ {4}steps:\s*$/.test(d));
  const buoc = [];
  let vung = null;
  for (const d of dong.slice(dau + 1)) {
    if (d.trim() && !/^ {6}/.test(d)) break;
    const moi = /^ {6}- (\w+):\s*(.*)$/.exec(d);
    if (moi) {
      buoc.push({ name: "", env: {}, run: "", if: undefined, uses: undefined });
      vung = null;
      gan(buoc.at(-1), moi[1], moi[2]);
      if (moi[1] === "run" && moi[2] === "|") vung = "run";
      continue;
    }
    const b = buoc.at(-1);
    if (!b) continue;
    const khoa = /^ {8}(\w+):\s*(.*)$/.exec(d);
    if (khoa) {
      vung = khoa[1] === "run" && khoa[2] === "|" ? "run" : khoa[1] === "env" ? "env" : null;
      if (vung === null) gan(b, khoa[1], khoa[2]);
      continue;
    }
    if (vung === "run" && (/^ {10}/.test(d) || !d.trim())) b.run += d.replace(/^ {10}/, "") + "\n";
    else if (vung === "env") {
      const m = /^ {10}([A-Z0-9_]+): (.*)$/.exec(d);
      if (m) b.env[m[1]] = m[2];
    }
  }
  return buoc;
}
function gan(b, khoa, gia) {
  if (khoa === "name") b.name = gia;
  else if (khoa === "if") b.if = gia;
  else if (khoa === "uses") b.uses = gia;
  else if (khoa === "run" && gia !== "|") b.run = gia;
}
const buocTen = (text, ten) => cacBuoc(text).find((b) => b.name === ten);

/** Chạy khối run như runner (bash -e, pipefail) với tệp sự kiện và tệp môi trường giả. */
function chayBuoc(run, { email, env = {} } = {}) {
  const thu = mkdtempSync(path.join(tmpdir(), "nap-mau-yml-"));
  const suKien = path.join(thu, "event.json");
  const envFile = path.join(thu, "env");
  const outFile = path.join(thu, "out");
  writeFileSync(suKien, JSON.stringify({ inputs: email === undefined ? {} : { email } }));
  writeFileSync(envFile, "");
  writeFileSync(outFile, "");
  const r = spawnSync("bash", ["--noprofile", "--norc", "-eo", "pipefail", "-c", run], {
    env: { PATH: process.env.PATH, GITHUB_EVENT_PATH: suKien, GITHUB_ENV: envFile, GITHUB_OUTPUT: outFile, ...env },
    encoding: "utf8",
  });
  return { status: r.status, stdout: r.stdout, envFile: readFileSync(envFile, "utf8"), outFile: readFileSync(outFile, "utf8") };
}

/** Luật tĩnh: kênh lộ input và hình dạng nút. Danh sách lỗi; rỗng = đạt. */
export function kiemWorkflow(text) {
  const loi = [];
  const dong = text.split("\n");
  const khoaOn = dong.findIndex((d) => /^on:\s*$/.test(d));
  const conOn = [];
  for (const d of dong.slice(khoaOn + 1)) {
    if (/^\S/.test(d)) break;
    if (/^ {2}\S/.test(d)) conOn.push(d.trim());
  }
  if (khoaOn < 0 || conOn.length !== 1 || conOn[0] !== "workflow_dispatch:") loi.push("chỉ workflow_dispatch");
  for (const t of ["viec", "email", "xac_nhan"]) if (!dong.some((d) => d === `      ${t}:`)) loi.push(`thiếu tham số ${t}`);
  if (!dong.some((d) => /^ {4}environment: production\s*$/.test(d))) loi.push("environment production");
  const buoc = cacBuoc(text);
  // Chỉ xét lệnh, không xét chú thích: nhắc tên tệp trong lời giải thích không phải ghi vào nó.
  if (buoc.some((b) => /GITHUB_ENV|GITHUB_OUTPUT/.test(b.run))) loi.push("ghi vào tệp môi trường của job");
  if ("EMAIL" in envJob(text) || buoc.some((b) => "EMAIL" in b.env)) loi.push("email nằm trong env");
  if ("NODE_ENV" in envJob(text)) loi.push("NODE_ENV ở cấp job");
  const nap = buoc.find((b) => b.run.includes("nap-ban-that.ts"));
  if (!nap?.run.includes("$GITHUB_EVENT_PATH")) loi.push("bước chạy bộ nạp không đọc email từ tệp sự kiện");
  if (nap?.env.NODE_ENV !== "production") loi.push("bước chạy bộ nạp thiếu NODE_ENV=production");
  for (const b of buoc) if (/\$\{\{/.test(b.run)) loi.push(`chèn thẳng vào lệnh ở bước «${b.name}»`);
  for (const d of dong) {
    // Bí mật chỉ là giá trị một khoá env — của job (6 dấu cách) hay của bước (10).
    if (/secrets\./.test(d) && !/^ {6}( {4})?[A-Z0-9_]+: \$\{\{ secrets\.[A-Z0-9_]+ \}\}\s*$/.test(d)) loi.push(`bí mật ngoài khoá env: ${d.trim()}`);
    if (/(echo|printf).*(OWNER_PHONE_KEY|DATABASE_URL)/.test(d)) loi.push(`in bí mật: ${d.trim()}`);
  }
  return loi;
}

/** Môi trường của bước `npm ci` = env job + env bước; hỏi npm có bỏ devDependencies không. */
function omitCuaNpmCi(text) {
  const b = cacBuoc(text).find((x) => x.run.trim() === "npm ci");
  assert.ok(b, "không thấy bước npm ci");
  const env = { ...process.env };
  delete env.NODE_ENV;
  delete env.npm_config_omit;
  for (const [k, v] of Object.entries({ ...envJob(text), ...b.env })) if (!/\$\{\{/.test(v)) env[k] = v;
  return spawnSync("npm", ["config", "get", "omit"], { cwd: GOC, env, encoding: "utf8" }).stdout;
}

test("npm-ci-giu-tsx: bước npm ci không bỏ devDependencies, bước bộ nạp chạy chế độ thật (E1)", () => {
  assert.ok(!/dev/.test(omitCuaNpmCi(THAT)), "npm ci bỏ devDependencies — tsx sẽ không được cài");
  assert.equal(buocTen(THAT, "Chạy bộ nạp")?.env.NODE_ENV, "production");
  // Chiều đỏ cùng phép đo: NODE_ENV ở cấp job thì npm ci bỏ dev.
  const sai = THAT.replace("    env:\n", "    env:\n      NODE_ENV: production\n");
  assert.match(omitCuaNpmCi(sai), /dev/, "đối chứng: NODE_ENV cấp job phải làm npm ci bỏ devDependencies");
});

// Ma trận viết trước: [viec, email, thoát 0?]. Email hợp lệ phải được che đúng nguyên văn.
const MA_TRAN = [
  ["nap", "T-x@example.test", true],
  ["nap", "a@b.co\nNODE_OPTIONS=--require /tmp/x", false],
  ["nap", "a@b.co\u0007", false],
  ["nap", "a@b.co\r", false],
  ["nap", "a b@c.co", false],
  ["nap", "", false],
  ["nap", "a%0Ab@x.co", false],
  ["go", "", true],
  ["go", "rac\nX=1", true],
];

test("email-ma-tran: bước kiểm email chạy thật trên 9 ca (E2)", () => {
  const run = buocTen(THAT, "Kiểm và che email")?.run;
  assert.ok(run, "không thấy bước «Kiểm và che email»");
  for (const [viec, email, dat] of MA_TRAN) {
    const r = chayBuoc(run, { email, env: { VIEC: viec } });
    const nhan = `${viec} ${JSON.stringify(email)}`;
    assert.equal(r.status === 0, dat, `${nhan}: thoát ${r.status}`);
    if (viec === "nap") assert.equal(r.stdout.includes(`::add-mask::${email}\n`), dat, `${nhan}: che email`);
    assert.equal(r.envFile + r.outFile, "", `${nhan}: tệp môi trường của job bị ghi`);
  }
  // Chiều đỏ: bỏ điều kiện viec thì nút gỡ chết khi ô email trống.
  const boDieuKien = run.replace('if [ "$VIEC" = "nap" ]; then', "if true; then");
  assert.notEqual(boDieuKien, run);
  assert.notEqual(chayBuoc(boDieuKien, { email: "", env: { VIEC: "go" } }).status, 0, "gỡ: bỏ điều kiện viec phải làm ca gỡ đỏ");
});

test("khong-ghi-tep-moi-truong: không kênh nào lộ input (E3)", () => {
  assert.deepEqual(kiemWorkflow(THAT), []);
  const ghiEnv = THAT.replace('echo "::add-mask::$EMAIL"', 'echo "::add-mask::$EMAIL"\n            echo "EMAIL=$EMAIL" >> "$GITHUB_ENV"');
  assert.ok(kiemWorkflow(ghiEnv).includes("ghi vào tệp môi trường của job"));
  const envJobCoEmail = THAT.replace("    env:\n", "    env:\n      EMAIL: ${{ inputs.email }}\n");
  assert.ok(kiemWorkflow(envJobCoEmail).includes("email nằm trong env"));
  const chen = THAT.replace('--email "$EMAIL"', '--email "${{ inputs.email }}"');
  assert.ok(kiemWorkflow(chen).some((l) => l.startsWith("chèn thẳng vào lệnh")));
});

test("chan-nhanh-va-xac-nhan: hai rào chạy đúng chiều (E5)", () => {
  const nhanh = buocTen(THAT, "Chỉ nhánh main").run;
  assert.equal(chayBuoc(nhanh, { env: { GITHUB_REF: "refs/heads/main" } }).status, 0, "main phải qua");
  assert.notEqual(chayBuoc(nhanh, { env: { GITHUB_REF: "refs/heads/khac" } }).status, 0, "nhánh khác phải bị chặn");
  const go = buocTen(THAT, "Xác nhận gỡ");
  assert.match(go.if ?? "", /inputs\.viec == 'go'/);
  assert.equal(chayBuoc(go.run, { env: { XAC_NHAN: TEN_SAN } }).status, 0, "xác nhận đúng phải qua");
  assert.notEqual(chayBuoc(go.run, { env: { XAC_NHAN: "bat ky" } }).status, 0, "xác nhận sai phải bị chặn");
  // Chiều đỏ: đảo điều kiện chặn nhánh thì chính main bị chặn.
  const dao = nhanh.replace("] || {", "] && {");
  assert.notEqual(dao, nhanh);
  assert.notEqual(chayBuoc(dao, { env: { GITHUB_REF: "refs/heads/main" } }).status, 0, "chặn nhánh: bản đảo phải chặn main");
});

const KHOA_KHO = ["STORAGE_S3_ACCESS_KEY", "STORAGE_S3_SECRET_KEY", "STORAGE_S3_ENDPOINT"];
/** Ba khoá kho ảnh chỉ ở bước «Chạy bộ nạp», từ secrets, cạnh NODE_ENV production (hàng nap-mau-co-anh). Danh sách lỗi. */
export function kiemKhoaKho(text) {
  const loi = [];
  const buoc = cacBuoc(text);
  const nap = buoc.find((b) => b.name === "Chạy bộ nạp");
  if (!nap) return ["không thấy bước «Chạy bộ nạp»"];
  for (const k of KHOA_KHO) {
    if (nap.env[k] !== `\${{ secrets.${k} }}`) loi.push(`bước «Chạy bộ nạp» thiếu ${k} từ secrets.${k}`);
    if (k in envJob(text)) loi.push(`${k} khai ở env mức job`);
    for (const b of buoc) if (b !== nap && k in b.env) loi.push(`${k} khai ở bước «${b.name}»`);
  }
  if (nap.env.NODE_ENV !== "production") loi.push("bước «Chạy bộ nạp» thiếu NODE_ENV: production");
  return loi;
}

test("ba-khoa-kho-anh: bước chạy bộ nạp nhận ba khoá kho ảnh từ secrets, không nơi nào khác (E8 nap-mau-co-anh)", () => {
  assert.deepEqual(kiemKhoaKho(THAT), []);
  assert.deepEqual(kiemWorkflow(THAT), [], "luật tĩnh cũ vẫn đạt");
  // Luật tĩnh nhận env của bước nhưng vẫn bắt bí mật nằm trong lệnh.
  const trongLenh = THAT.replace('--email "$EMAIL"', '--email "$EMAIL" --khoa ${{ secrets.STORAGE_S3_SECRET_KEY }}');
  assert.ok(kiemWorkflow(trongLenh).some((l) => l.startsWith("bí mật ngoài khoá env: node")), "bí mật trong lệnh phải bị bắt");
  // Chiều đỏ trên bản sao: dời một biến lên env mức job.
  const dong = "          STORAGE_S3_ENDPOINT: ${{ secrets.STORAGE_S3_ENDPOINT }}\n";
  assert.ok(THAT.includes(dong));
  const len = THAT.replace(dong, "").replace("    env:\n", "    env:\n      STORAGE_S3_ENDPOINT: ${{ secrets.STORAGE_S3_ENDPOINT }}\n");
  assert.deepEqual(kiemKhoaKho(len), ["bước «Chạy bộ nạp» thiếu STORAGE_S3_ENDPOINT từ secrets.STORAGE_S3_ENDPOINT", "STORAGE_S3_ENDPOINT khai ở env mức job"]);
  // Chiều đỏ: bỏ NODE_ENV khỏi bước thì ca đỏ, thông điệp nêu NODE_ENV.
  const boNodeEnv = THAT.replace("          NODE_ENV: production\n", "");
  assert.notEqual(boNodeEnv, THAT);
  assert.deepEqual(kiemKhoaKho(boNodeEnv), ["bước «Chạy bộ nạp» thiếu NODE_ENV: production"]);
});
