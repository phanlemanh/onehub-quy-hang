#!/usr/bin/env node
// AC-8: chạy lặp ca đường ghi sổ trên Postgres thử riêng, ba luồng song song để lượt chấm không vượt giới hạn thời gian.
// Mỗi lần chạy mang nhãn riêng trong tên sàn nên các luồng không đụng nhau. Đầu lượt tự kiểm: lệnh giả thoát 1 phải bị đếm đỏ.
import { spawn, spawnSync } from "node:child_process";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const DATABASE_URL = "postgres://postgres:quyhang@localhost:5588/postgres";
const iLan = process.argv.indexOf("--lan");
const lan = iLan > 0 ? Number(process.argv[iLan + 1]) : 300;
const LUONG = 3;
const CA = ["--import", "tsx", "--test", "--test-concurrency=1", "--test-name-pattern", "cửa máy chủ", "test-db/imports/o-la.test.ts"];

const motLan = (lenh, doiSo) =>
  new Promise((xong) => {
    const p = spawn(lenh, doiSo, { cwd: resolve(ROOT, "packages/api"), env: { ...process.env, DATABASE_URL } });
    let log = "";
    p.stdout.on("data", (d) => (log += d));
    p.stderr.on("data", (d) => (log += d));
    p.on("close", (ma) => xong({ ma, log }));
  });

async function chay(n, lenh, doiSo) {
  let tiep = 1;
  let doSo = 0;
  await Promise.all(
    Array.from({ length: LUONG }, async () => {
      while (tiep <= n) {
        const i = tiep++;
        const { ma, log } = await motLan(lenh, doiSo);
        if (ma !== 0) {
          doSo++;
          const loi = log.split("\n").find((d) => /sổ chứa|AssertionError|Error:/.test(d)) ?? `exit ${ma}`;
          console.log(`lần ${i}: ĐỎ — ${loi.trim()}`);
        }
      }
    }),
  );
  return doSo;
}

if ((await chay(1, "node", ["-e", "process.exit(1)"])) !== 1) {
  console.log("HỎNG tự kiểm: lệnh thoát 1 không bị đếm là đỏ");
  process.exit(1);
}
console.log("ĐẠT tự kiểm: lệnh thoát 1 bị đếm là đỏ");

const mig = spawnSync("npm", ["run", "db:migrate"], { cwd: ROOT, encoding: "utf8", env: { ...process.env, DATABASE_URL } });
if (mig.status !== 0) {
  console.log(`HỎNG: không áp được migration\n${mig.stdout}\n${mig.stderr}`);
  process.exit(1);
}

const doSo = await chay(lan, "node", CA);
console.log(`KẾT: ${lan} lần, đỏ ${doSo}`);
process.exit(doSo === 0 ? 0 : 1);
