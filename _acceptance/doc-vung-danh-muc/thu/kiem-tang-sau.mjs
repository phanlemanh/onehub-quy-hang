// E10b (hàng 99): tầng máy chủ đi cặp với bài nhìn màn E10. Chạy riêng doc-vung.test.ts trên Postgres dãy D: gói nạp qua cửa nhận thật,
// đường tra mã và cả danh mục mà màn đọc trả đúng thuộc tính. Tệp kiểm có sẵn chiều đỏ (trước khi nạp, mã chưa found; gói khác thì giá
// trị ghép khác). Chạy riêng, không qua cả bộ, để không chồng lên các bài khác dùng chung vùng danh mục.
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const GOC = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");
const r = spawnSync(
  process.execPath,
  ["--import", "tsx", "--test", "--test-concurrency=1", "--test-reporter=spec", "test-db/catalog/doc-vung.test.ts"],
  {
    cwd: path.join(GOC, "packages/api"),
    env: { ...process.env, DATABASE_URL: "postgres://postgres:quyhang@localhost:5575/postgres" },
    encoding: "utf8",
  },
);
process.stdout.write(r.stdout ?? "");
process.stderr.write(r.stderr ?? "");
process.exit(r.status ?? 2);
