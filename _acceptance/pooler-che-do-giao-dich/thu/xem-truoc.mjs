// pooler-che-do-giao-dich AC-6 (E7): bản xem trước của nhánh chạy qua Supavisor chế độ giao dịch (cổng 6543).
//   APP_URL=<địa chỉ triển khai xem trước> VERCEL_LINK_DIR=<thư mục đã vercel link> node xem-truoc.mjs
// Bốn bước: (1) nhật ký của ĐÚNG triển khai ấy có dòng dựng bể «cổng 6543» — chứng biến đã đổi cổng mà không đọc bí mật;
// (2) 20 /api/v1/me + 20 /today đồng thời với cookie phiên giả, không 5xx; health 200; (3) nhật ký bản xem trước trong
// khoảng thử không có lỗi cạn kết nối, lỗi bể, lỗi lược đồ, lỗi câu lệnh chuẩn bị; (4) nhật ký bản thật cùng khoảng không
// có EMAXCONNSESSION hay 5xx. Chạy trong giờ vắng (Hỏi-3), một đợt. Thoát 0 xanh · 1 đỏ · 2 thiếu tiền đề.
import { spawn, spawnSync } from "node:child_process";

const APP_URL = process.env.APP_URL ?? "";
const DIR = process.env.VERCEL_LINK_DIR ?? "";
const NHANH = "claude/pooler-che-do-giao-dich";
const BAN_THAT = "quyhang.onehub.center";
const LOI_XEM_TRUOC = /EMAXCONNSESSION|\[pool:(danh-tinh|ung-dung)|max clients|relation .* does not exist|Could not validate the database schema|prepared statement/i;
const ngu = (ms) => new Promise((r) => setTimeout(r, ms));
const dung = (ma, cau) => {
  console.error(`xem-truoc: ${cau}`);
  process.exit(ma);
};

const vercel = (args) => spawnSync("vercel", args, { cwd: DIR, encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });

/** Một yêu cầu qua `vercel curl` (vượt Vercel Authentication bằng phiên CLI); trả mã trạng thái. */
function curl(duong, cookie) {
  return new Promise((r) => {
    const a = ["curl", duong, "--deployment", APP_URL, "--", "-s", "-o", "/dev/null", "-w", "%{http_code}"];
    if (cookie) a.push("-H", `cookie: ${cookie}`);
    const p = spawn("vercel", a, { cwd: DIR, stdio: ["ignore", "pipe", "pipe"] });
    let out = "";
    p.stdout.on("data", (d) => (out += d));
    p.on("exit", () => r(Number(out.trim().slice(-3)) || 0));
  });
}

/** Bản ghi nhật ký (JSON Lines của `vercel logs --json`) trong khoảng, lọc theo đối số. */
function nhatKy(args) {
  const r = vercel(["logs", ...args, "--json", "-n", "5000"]);
  if (r.status !== 0) dung(2, `không đọc được nhật ký (${args.join(" ")}): ${r.stderr.trim().split("\n").at(-1)}`);
  return r.stdout
    .split("\n")
    .filter(Boolean)
    .map((l) => JSON.parse(l))
    .filter((x) => x.type === "log")
    .map((x) => x.data);
}

// Tiền đề.
if (!APP_URL || !DIR) dung(2, "cần APP_URL (bản xem trước của nhánh) và VERCEL_LINK_DIR (thư mục đã vercel link)");
if (new URL(APP_URL.startsWith("http") ? APP_URL : `https://${APP_URL}`).hostname === BAN_THAT) dung(2, "APP_URL là tên miền bản thật — chỉ đo bản xem trước");
const tt = vercel(["inspect", APP_URL, "--json"]);
if (tt.status !== 0) dung(2, `không đọc được triển khai ${APP_URL}: ${tt.stderr.trim().split("\n").at(-1)}`);
const trienKhai = JSON.parse(tt.stdout);
if (trienKhai.target === "production") dung(2, "triển khai là bản thật — chỉ đo bản xem trước");
// `vercel inspect --json` không mang tên nhánh; nhánh đọc từ chính dòng nhật ký dựng bể ở bước 1.
let nhanhCua = "";
const maTrienKhai = trienKhai.id ?? trienKhai.uid;
// Công tắc cổng của bản xem trước nhánh (biến thường — chỉ đọc tên và phạm vi).
const ds = vercel(["env", "ls", "preview", NHANH]);
if (ds.status !== 0 || !/\bDATABASE_POOLER_PORT\b/.test(ds.stdout)) dung(2, `bản xem trước nhánh ${NHANH} chưa có DATABASE_POOLER_PORT`);

const batDau = new Date(Date.now() - 5_000).toISOString();

// Bước 1 — đánh thức hàm (dựng bể), rồi tìm dòng cổng trong nhật ký đúng triển khai ấy.
const health = await curl("/api/v1/health");
await curl("/api/v1/me", "qh.session_token=gia.gia");
let cong = null;
for (let i = 0; i < 12 && cong === null; i++) {
  await ngu(5_000);
  const dong = nhatKy(["--deployment", APP_URL, "--since", batDau]).find((d) => /\[pool:ket-noi\] cổng \d+/.test(d.message ?? ""));
  if (dong) {
    cong = /cổng (\d+)/.exec(dong.message)[1];
    nhanhCua = dong.branch ?? "";
  }
}
if (cong !== null && nhanhCua !== NHANH) dung(2, `triển khai thuộc nhánh «${nhanhCua}», không phải ${NHANH}`);
if (cong !== "6543") dung(1, `triển khai không chạy qua pooler giao dịch: dòng dựng bể ${cong === null ? "vắng" : `nêu cổng ${cong}`}`);

// Bước 2 — 40 yêu cầu đồng thời, cookie phiên giả (mỗi yêu cầu đọc phiên qua bể danh tính).
const yeuCau = [...Array(20).fill("/api/v1/me"), ...Array(20).fill("/today")];
const ma = await Promise.all(yeuCau.map((d) => curl(d, "qh.session_token=gia.gia")));
console.log("i\tđường\tmã");
yeuCau.forEach((d, i) => console.log(`${i + 1}\t${d}\t${ma[i]}`));
const sai = ma.filter((m) => ![200, 307, 401].includes(m));
const tot = ma.length - sai.length;

await ngu(20_000); // nhật ký tới chậm vài giây
const ketThuc = new Date().toISOString();

// Bước 3 — nhật ký bản xem trước trong khoảng thử.
const loiXT = nhatKy(["--deployment", APP_URL, "--since", batDau, "--until", ketThuc]).filter((d) => LOI_XEM_TRUOC.test(d.message ?? ""));
// Bước 4 — nhật ký bản thật cùng khoảng: không EMAXCONNSESSION, không 5xx.
const banThat = nhatKy(["-e", "production", "--since", batDau, "--until", ketThuc]);
const loiBT = banThat.filter((d) => /EMAXCONNSESSION/.test(d.message ?? "") || Number(d.statusCode ?? d.status ?? 0) >= 500);

const ok = health === 200 && sai.length === 0 && loiXT.length === 0 && loiBT.length === 0;
console.log(`triển khai: ${maTrienKhai} · nhánh ${nhanhCua} · khoảng ${batDau} → ${ketThuc}`);
for (const d of loiXT) console.log(`nhật ký xem trước: ${d.timestamp} ${d.message.split("\n")[0].slice(0, 200)}`);
for (const d of loiBT) console.log(`nhật ký bản thật: ${d.timestamp} ${(d.message ?? "").split("\n")[0].slice(0, 200)}`);
if (!ok) {
  dung(1, `${tot}/40 không 5xx · health ${health} · cổng ${cong} · nhật ký xem trước ${loiXT.length} lỗi · bản thật ${loiBT.length} lỗi${loiBT.length ? " — bản thật bị ảnh hưởng trong khoảng thử" : ""}`);
}
console.log("xem-truoc: 40/40 không 5xx · health 200 · cổng 6543 · nhật ký sạch · bản thật sạch");
