// Chạy bộ kiểm cần Postgres của hàng chu-san-du-vai trên Postgres của dãy Q (mật khẩu thử của AGENTS.md).
//   mo-san  packages/db/tests/mo-san.test.mjs      api  packages/api/test-db/chu-san-du-vai/*.test.ts
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const GOC = fileURLToPath(new URL("../../../", import.meta.url));
const env = { ...process.env, DATABASE_URL: process.env.DATABASE_URL || "postgres://postgres:quyhang@localhost:5577/postgres" };
const chay = (cmd, args, cwd = GOC) => spawnSync(cmd, args, { cwd, env, stdio: "inherit" }).status ?? 1;

const viec = process.argv[2];
if (viec !== "mo-san" && viec !== "api") {
  console.error("dùng: chay-db.mjs mo-san | api");
  process.exit(2);
}
const ma = chay("npm", ["run", "db:migrate", "--silent"]);
if (ma !== 0) process.exit(ma);
process.exit(
  viec === "mo-san"
    ? chay(process.execPath, ["--test", "packages/db/tests/mo-san.test.mjs"])
    : chay(process.execPath, ["--import", "tsx", "--test", "--test-concurrency=1", "test-db/chu-san-du-vai/*.test.ts"], `${GOC}packages/api`),
);
