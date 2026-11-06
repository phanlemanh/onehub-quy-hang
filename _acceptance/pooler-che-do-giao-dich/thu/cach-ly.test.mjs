// pooler-che-do-giao-dich AC-2 (E2): bộ kiểm cách ly và bộ kiểm API chạy xanh trên Postgres sạch với bể danh tính KHÔNG
// tham số khởi động — search_path mặc định không chứa `identity`, nên câu nào còn dựa vào nó sẽ đỏ. Cần Docker.
import assert from "node:assert/strict";
import { execFileSync, spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { after, before, test } from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const TEN = "quy-hang-db-pooler-V";
const CONG = 5597;
const URL = `postgres://postgres:quyhang@127.0.0.1:${CONG}/postgres`;
const docker = (...a) => spawnSync("docker", a, { encoding: "utf8" });

before(() => {
  docker("rm", "-f", TEN);
  const r = docker("run", "--rm", "-d", "--name", TEN, "-e", "POSTGRES_PASSWORD=quyhang", "-p", `${CONG}:5432`, "postgres:16");
  assert.equal(r.status, 0, `cach-ly: không dựng được Postgres ${TEN}: ${r.stderr}`);
  for (let i = 0; i < 60; i++) {
    // pg_isready báo sẵn sàng cả lúc máy chủ khởi động tạm của bước init — đợi một câu thật chạy được.
    if (docker("exec", TEN, "psql", "-U", "postgres", "-h", "127.0.0.1", "-qAtc", "select 1").status === 0) return;
    execFileSync("sleep", ["1"]);
  }
  throw new Error("cach-ly: Postgres không sẵn sàng sau 60 giây");
});
after(() => {
  docker("rm", "-f", TEN);
});

test("bộ kiểm db: migrate và db:test xanh trên Postgres sạch với bể danh tính không search_path", () => {
  // Bể danh tính của bộ kiểm dựng như máy chủ: rút từ chính tệp, không chép chuỗi kỳ vọng tay.
  const helpers = readFileSync(resolve(ROOT, "packages/api/test-db/helpers.ts"), "utf8");
  const dong = helpers.split("\n").find((l) => /export const identityPool\s*=/.test(l));
  assert.ok(dong, "cach-ly: helpers.ts không còn dựng identityPool");
  assert.doesNotMatch(dong, /options\s*:/, `cach-ly: bể danh tính của bộ kiểm còn tham số khởi động: ${dong.trim()}`);

  const r = spawnSync("sh", ["-c", "npm run db:migrate && npm run db:test"], {
    cwd: ROOT,
    // Bỏ NODE_TEST_CONTEXT: không có nó thì `node --test` lồng bên trong chạy như lệnh độc lập và in dòng tổng.
    env: Object.fromEntries(Object.entries({ ...process.env, DATABASE_URL: URL }).filter(([k]) => k !== "NODE_TEST_CONTEXT")),
    encoding: "utf8",
    maxBuffer: 64 * 1024 * 1024,
  });
  const ra = `${r.stdout}\n${r.stderr}`;
  const tong = ra.split("\n").filter((l) => /^ℹ (pass|fail) /.test(l));
  console.log(`cach-ly: ${tong.join(" · ")}`);
  assert.equal(r.status, 0, `cach-ly: migrate + db:test thoát ${r.status}\n${ra.split("\n").filter((l) => /✖|not ok|Error/.test(l)).slice(0, 30).join("\n")}`);
  assert.doesNotMatch(ra, /Could not validate the database schema|SchemaMismatch/, "cach-ly: better-auth báo lệch lược đồ");
  assert.ok(tong.length >= 4, `cach-ly: không thấy đủ dòng tổng của hai bộ kiểm: ${tong.join(" · ")}`);
});
