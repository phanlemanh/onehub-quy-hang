// Chỗ thử của hồ sơ va-pool-ket-noi (eval E3, E3b): máy dev `web-su-co-pool` (.claude/launch.json, cổng 3499) nói với
// cơ sở dữ liệu ở cổng 5599. Cổng 5599 là một CÔNG TẮC mạng của script này, đứng trước Postgres riêng của hồ sơ (container
// quy-hang-db-pool-V, cổng 5598): tắt thì mọi kết nối bị cắt (như pooler cạn), mở thì chuyển thẳng tới Postgres.
//   node _acceptance/va-pool-ket-noi/thu/dung-su-co.mjs --dung     dựng Postgres, migrate, nạp nền mẫu, cấp phiên thật,
//                                                                  bật công tắc ở trạng thái TẮT; in JSON cookie
//   node _acceptance/va-pool-ket-noi/thu/dung-su-co.mjs --mo       mở công tắc (cơ sở dữ liệu hồi)
//   node _acceptance/va-pool-ket-noi/thu/dung-su-co.mjs --tat      tắt công tắc (cắt cả kết nối đang mở)
//   node _acceptance/va-pool-ket-noi/thu/dung-su-co.mjs --don      dừng công tắc và container
// Phiên: một dòng identity.session cho Đầu chủ mẫu 1, cookie `qh.session_token` ký bằng bí mật của cấu hình web-su-co-pool.
// Không dùng ở bản thật; mọi người và sàn là mẫu của packages/db/seed.
import { execFileSync, spawn } from "node:child_process";
import { createHmac, randomBytes } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import net from "node:net";
import path from "node:path";
import { fileURLToPath } from "node:url";

const GOC = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");
const CHAY = path.join(GOC, ".acceptance-runs/va-pool-ket-noi");
const TRANG_THAI = path.join(CHAY, "cong.json");
const PID = path.join(CHAY, "cong.pid");
const CONTAINER = "quy-hang-db-pool-V";
const DB_CONG = 5598;
const CONG_TAC = 5599;
const DATABASE_URL = `postgres://postgres:quyhang@localhost:${DB_CONG}/postgres`;
const BI_MAT = "dev-su-co-chuoi-thu-khong-dung-o-ban-that"; // khớp cấu hình web-su-co-pool
const EMAIL = "dau-chu-1@mau.quy-hang.test";

mkdirSync(CHAY, { recursive: true });
const ngu = (ms) => new Promise((r) => setTimeout(r, ms));
const env = { ...process.env, DATABASE_URL };
const chay = (cmd, args) => execFileSync(cmd, args, { cwd: GOC, env, stdio: ["ignore", "pipe", "inherit"] }).toString();
const psql = (sql) => chay("docker", ["exec", CONTAINER, "psql", "-U", "postgres", "-qAtc", sql]).trim();
const ghiTrangThai = (mo) => writeFileSync(TRANG_THAI, JSON.stringify({ mo, luc: new Date().toISOString() }));
const docMo = () => {
  try {
    return JSON.parse(readFileSync(TRANG_THAI, "utf8")).mo === true;
  } catch {
    return false;
  }
};

/** Tiến trình công tắc: nghe 5599, mở thì nối thẳng tới 5598, tắt thì cắt ngay và cắt cả cặp nối đang sống. */
function chayCongTac() {
  const dangNoi = new Set();
  let moTruoc = docMo();
  setInterval(() => {
    const mo = docMo();
    if (moTruoc && !mo) for (const s of dangNoi) s.destroy();
    moTruoc = mo;
  }, 200);
  net
    .createServer((khach) => {
      if (!docMo()) return khach.destroy();
      const db = net.connect(DB_CONG, "127.0.0.1");
      dangNoi.add(khach);
      const xong = () => {
        dangNoi.delete(khach);
        khach.destroy();
        db.destroy();
      };
      khach.on("error", xong).on("close", xong);
      db.on("error", xong).on("close", xong);
      khach.pipe(db).pipe(khach);
    })
    .listen(CONG_TAC, "127.0.0.1");
}

const lenh = process.argv[2];
if (lenh === "--cong-tac") {
  chayCongTac();
} else if (lenh === "--mo" || lenh === "--tat") {
  ghiTrangThai(lenh === "--mo");
  await ngu(400); // một nhịp của công tắc
  console.log(`công tắc cổng ${CONG_TAC}: ${lenh === "--mo" ? "MỞ" : "TẮT"}`);
} else if (lenh === "--don") {
  if (existsSync(PID)) {
    try {
      process.kill(Number(readFileSync(PID, "utf8")));
    } catch {
      // tiến trình đã thoát
    }
    rmSync(PID, { force: true });
  }
  try {
    chay("docker", ["rm", "-f", CONTAINER]);
  } catch {
    // container đã không còn
  }
  console.log("đã dọn công tắc và container");
} else if (lenh === "--dung") {
  // 1. Postgres riêng của hồ sơ.
  const co = chay("docker", ["ps", "-a", "--format", "{{.Names}} {{.State}}"]).split("\n").find((l) => l.startsWith(`${CONTAINER} `));
  if (!co) chay("docker", ["run", "--rm", "-d", "--name", CONTAINER, "-e", "POSTGRES_PASSWORD=quyhang", "-p", `${DB_CONG}:5432`, "postgres:16"]);
  else if (!co.endsWith("running")) chay("docker", ["start", CONTAINER]);
  for (let i = 0; ; i++) {
    try {
      chay("docker", ["exec", CONTAINER, "pg_isready", "-U", "postgres"]);
      break;
    } catch {
      if (i > 60) throw new Error("Postgres của hồ sơ không lên");
      await ngu(1000);
    }
  }
  await ngu(1500);
  chay("npm", ["run", "db:migrate"]);
  chay("node", ["packages/db/seed/nap.mjs", "--nap"]);

  // 2. Phiên thật cho Đầu chủ mẫu 1 (token ngẫu nhiên, hạn 1 ngày).
  const userId = psql(`select id from identity."user" where email = '${EMAIL}'`);
  if (!userId) throw new Error(`không thấy người mẫu ${EMAIL} sau khi nạp`);
  const token = randomBytes(24).toString("hex");
  psql(`insert into identity.session (id, "expiresAt", token, "updatedAt", "userId")
        values ('${randomBytes(12).toString("hex")}', now() + interval '1 day', '${token}', now(), '${userId}')`);
  const ky = encodeURIComponent(createHmac("sha256", BI_MAT).update(token).digest("base64"));

  // 3. Công tắc, bắt đầu TẮT (cơ sở dữ liệu «nghẽn»).
  ghiTrangThai(false);
  if (!existsSync(PID)) {
    const p = spawn(process.execPath, [fileURLToPath(import.meta.url), "--cong-tac"], { detached: true, stdio: "ignore" });
    p.unref();
    writeFileSync(PID, String(p.pid));
    await ngu(500);
  }
  console.log(JSON.stringify({ cookie: { name: "qh.session_token", value: `${token}.${ky}`, domain: "localhost", path: "/" }, cong_tac: "TẮT" }));
} else {
  console.error("dùng: --dung | --mo | --tat | --don");
  process.exit(2);
}
