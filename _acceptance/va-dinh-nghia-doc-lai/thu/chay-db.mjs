// Chạy bộ kiểm trên API thật của hàng va-dinh-nghia-doc-lai trên Postgres của dãy Q (mật khẩu thử của AGENTS.md).
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const GOC = fileURLToPath(new URL("../../../", import.meta.url));
const env = { ...process.env, DATABASE_URL: process.env.DATABASE_URL || "postgres://postgres:quyhang@localhost:5577/postgres" };
const chay = (cmd, args, cwd = GOC) => spawnSync(cmd, args, { cwd, env, stdio: "inherit" }).status ?? 1;
const ma = chay("npm", ["run", "db:migrate", "--silent"]);
if (ma !== 0) process.exit(ma);
process.exit(chay(process.execPath, ["--import", "tsx", "--test", "src/lib/sync/test-db/dinh-nghia-doc-lai.db-test.mts"], `${GOC}apps/web`));
