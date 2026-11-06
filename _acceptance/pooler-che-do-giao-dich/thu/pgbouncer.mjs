// pooler-che-do-giao-dich: pooler chế độ giao dịch tại máy — PgBouncer (Homebrew) trước Postgres chỗ thử của hồ sơ
// va-pool-ket-noi (cổng 5598). `default_pool_size = 1`: MỌI kết nối khách dùng chung MỘT kết nối máy chủ, khắt khe hơn
// Supavisor bản thật (15). Đo 06/11: PgBouncer 1.26 giữ riêng `search_path` của từng khách (đặt lại khi đổi kết nối máy
// chủ), kể cả với `ignore_startup_parameters = options`, và từ chối tham số khởi động khác — nên bàn thử không làm cấu hình
// cũ hỏng; độc lập khỏi search_path được đo bằng cách cho kết nối mang search_path SAI (`public`). Supavisor xử thế nào
// chưa kiểm ở máy (bản xem trước đo). Tệp cấu hình và nhật ký ở .acceptance-runs/pooler-che-do-giao-dich/ (ngoài git).
// Mật khẩu thử của AGENTS.md; không dùng ở bản thật.
import { spawn, spawnSync } from "node:child_process";
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import net from "node:net";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
export const CHAY = join(ROOT, ".acceptance-runs/pooler-che-do-giao-dich");
export const CONG_POOLER = 5596;
export const CONG_DB = 5598;
export const URL_POOLER = `postgres://postgres:quyhang@127.0.0.1:${CONG_POOLER}/postgres`;
export const URL_DB = `postgres://postgres:quyhang@127.0.0.1:${CONG_DB}/postgres`;

const ngu = (ms) => new Promise((r) => setTimeout(r, ms));

function timPgbouncer() {
  for (const p of ["/opt/homebrew/bin/pgbouncer", "/usr/local/bin/pgbouncer"]) if (existsSync(p)) return p;
  const r = spawnSync("sh", ["-c", "command -v pgbouncer"], { encoding: "utf8" });
  if (r.status === 0 && r.stdout.trim()) return r.stdout.trim();
  throw new Error("pgbouncer: chưa cài — `brew install pgbouncer` (Hỏi-1 của hồ sơ pooler-che-do-giao-dich)");
}

async function moDuoc(cong) {
  return new Promise((r) => {
    const s = net.connect(cong, "127.0.0.1");
    s.once("connect", () => (s.destroy(), r(true)));
    s.once("error", () => r(false));
  });
}

/** Dựng PgBouncer chế độ giao dịch; trả tiến trình (gọi `donPgbouncer` để dừng). */
export async function dungPgbouncer() {
  mkdirSync(CHAY, { recursive: true });
  const ini = join(CHAY, "pgbouncer.ini");
  writeFileSync(join(CHAY, "userlist.txt"), '"postgres" "quyhang"\n');
  writeFileSync(
    ini,
    [
      "[databases]",
      `postgres = host=127.0.0.1 port=${CONG_DB} dbname=postgres user=postgres password=quyhang`,
      "[pgbouncer]",
      "listen_addr = 127.0.0.1",
      `listen_port = ${CONG_POOLER}`,
      "auth_type = plain",
      `auth_file = ${join(CHAY, "userlist.txt")}`,
      "admin_users = postgres",
      "pool_mode = transaction",
      "default_pool_size = 1",
      "max_client_conn = 400",
      `logfile = ${join(CHAY, "pgbouncer.log")}`,
      `pidfile = ${join(CHAY, "pgbouncer.pid")}`,
      "",
    ].join("\n"),
  );
  if (await moDuoc(CONG_POOLER)) throw new Error(`pgbouncer: cổng ${CONG_POOLER} đã có người nghe — dọn lượt trước`);
  const p = spawn(timPgbouncer(), [ini], { stdio: ["ignore", "ignore", "pipe"] });
  let loi = "";
  p.stderr.on("data", (d) => (loi += d));
  for (let i = 0; i < 50; i++) {
    if (await moDuoc(CONG_POOLER)) return p;
    if (p.exitCode !== null) break;
    await ngu(100);
  }
  p.kill("SIGKILL");
  throw new Error(`pgbouncer: không lên ở cổng ${CONG_POOLER}\n${loi}`);
}

export async function donPgbouncer(p) {
  if (!p || p.exitCode !== null) return;
  p.kill("SIGINT");
  for (let i = 0; i < 30 && p.exitCode === null; i++) await ngu(100);
  if (p.exitCode === null) p.kill("SIGKILL");
}
