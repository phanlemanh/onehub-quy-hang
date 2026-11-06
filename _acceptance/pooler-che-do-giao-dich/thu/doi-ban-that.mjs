// pooler-che-do-giao-dich AC-6 (E7): đổi bản thật sang pooler chế độ giao dịch bằng công tắc cổng, đo, và tự lùi.
// CHỈ chạy sau khi PR đã gộp và chủ kho duyệt đổi ở Cổng Bằng chứng (chủ kho chọn «Đo trên bản thật» 06/11), vào giờ vắng.
//   VERCEL_LINK_DIR=<thư mục đã vercel link> node doi-ban-that.mjs --kiem [--phut 30]   chỉ đọc nhật ký bản thật
//   VERCEL_LINK_DIR=… node doi-ban-that.mjs --doi [--phut 30]   đặt DATABASE_POOLER_PORT=6543 (Production), triển khai
//                                                              lại, chờ dòng «cổng 6543», theo dõi, tự lùi khi có lỗi
//   VERCEL_LINK_DIR=… node doi-ban-that.mjs --lui              xoá DATABASE_POOLER_PORT (Production), triển khai lại
// Không đọc hay in DATABASE_URL — công tắc là biến thường. Thoát 0 xanh · 1 đỏ (đã lùi nếu đang đổi) · 2 thiếu tiền đề.
import { spawnSync } from "node:child_process";

const DIR = process.env.VERCEL_LINK_DIR ?? "";
const TEN_MIEN = "quyhang.onehub.center";
const LOI = /EMAXCONNSESSION|max clients|\[pool:(danh-tinh|ung-dung)|relation .* does not exist|Could not validate the database schema|prepared statement/i;
const lenh = process.argv[2];
const phut = Number(process.argv[process.argv.indexOf("--phut") + 1]) || 30;
const ngu = (ms) => new Promise((r) => setTimeout(r, ms));
const dung = (ma, cau) => {
  console.error(`doi-ban-that: ${cau}`);
  process.exit(ma);
};
const vercel = (args, input) => spawnSync("vercel", args, { cwd: DIR, encoding: "utf8", input, maxBuffer: 64 * 1024 * 1024 });

/** Bản ghi nhật ký runtime của bản thật trong khoảng. */
function nhatKy(since, until = "now") {
  const r = vercel(["logs", "-e", "production", "--since", since, "--until", until, "--json", "-n", "5000"]);
  if (r.status !== 0) dung(2, `không đọc được nhật ký bản thật: ${r.stderr.trim().split("\n").at(-1)}`);
  return r.stdout
    .split("\n")
    .filter(Boolean)
    .map((l) => JSON.parse(l))
    .filter((x) => x.type === "log")
    .map((x) => x.data);
}
const cong = (ds) => [...new Set(ds.map((d) => /\[pool:ket-noi\] cổng (\d+)/.exec(d.message ?? "")?.[1]).filter(Boolean))];
const loi = (ds) => ds.filter((d) => LOI.test(d.message ?? ""));

function trienKhaiHienTai() {
  const r = vercel(["inspect", TEN_MIEN, "--json"]);
  if (r.status !== 0) dung(2, `không đọc được triển khai của ${TEN_MIEN}`);
  return JSON.parse(r.stdout).url;
}

function trienKhaiLai() {
  const cu = trienKhaiHienTai();
  const r = vercel(["redeploy", cu, "-e", "production"]);
  if (r.status !== 0) dung(2, `triển khai lại thất bại: ${r.stderr.trim().split("\n").at(-1)}`);
  const moi = r.stdout.trim().split("\n").at(-1);
  console.log(`triển khai lại: ${cu} → ${moi}`);
  return moi;
}

/** Đánh thức hàm và chờ dòng dựng bể nêu cổng mong đợi trên bản thật. */
async function choCong(muon, tu) {
  for (let i = 0; i < 24; i++) {
    await fetch(`https://${TEN_MIEN}/api/v1/me`, { headers: { cookie: "qh.session_token=gia.gia" } }).catch(() => {});
    await ngu(5_000);
    if (cong(nhatKy(tu)).includes(muon)) return true;
  }
  return false;
}

function datCongTac(gia) {
  vercel(["env", "rm", "DATABASE_POOLER_PORT", "production", "-y"]);
  if (gia === null) return;
  const r = vercel(["env", "add", "DATABASE_POOLER_PORT", "production"], gia);
  if (r.status !== 0) dung(2, `không đặt được DATABASE_POOLER_PORT: ${r.stderr.trim().split("\n").at(-1)}`);
}

async function lui(lyDo) {
  console.error(`doi-ban-that: LÙI — ${lyDo}`);
  const tu = new Date().toISOString();
  datCongTac(null);
  trienKhaiLai();
  const ve = await choCong("5432", tu);
  console.error(`doi-ban-that: đã lùi về 5432${ve ? "" : " — chưa thấy dòng «cổng 5432», soi nhật ký ngay"}`);
}

if (!DIR) dung(2, "cần VERCEL_LINK_DIR (thư mục đã vercel link với dự án onehub-quy-hang)");

if (lenh === "--kiem") {
  const ds = nhatKy(`${phut}m`);
  const c = cong(ds);
  const l = loi(ds);
  for (const d of l) console.log(`lỗi: ${d.timestamp} ${d.message.split("\n")[0].slice(0, 200)}`);
  console.log(`kiem: ${phut} phút · cổng thấy: ${c.join(", ") || "chưa có dòng dựng bể"} · lỗi: ${l.length}`);
  process.exit(c.includes("6543") && !c.includes("5432") && l.length === 0 ? 0 : 1);
} else if (lenh === "--doi") {
  // Tiền đề: mã có công tắc đã chạy trên bản thật (dòng dựng bể có mặt trong 6 giờ gần nhất).
  if (cong(nhatKy("6h")).length === 0) dung(2, "bản thật chưa chạy mã có dòng dựng bể — gộp PR và triển khai trước");
  const truoc = loi(nhatKy("30m")).length;
  if (truoc > 0) dung(2, `bản thật đang có ${truoc} lỗi kết nối trong 30 phút qua — không đổi lúc này`);
  const tu = new Date().toISOString();
  datCongTac("6543");
  trienKhaiLai();
  if (!(await choCong("6543", tu))) {
    await lui("không thấy dòng «cổng 6543» sau khi triển khai lại");
    process.exit(1);
  }
  console.log("đã đổi: bản thật dựng bể ở cổng 6543 — theo dõi");
  const het = Date.now() + phut * 60_000;
  while (Date.now() < het) {
    await ngu(60_000);
    const l = loi(nhatKy(tu));
    if (l.length > 0) {
      for (const d of l) console.error(`lỗi: ${d.timestamp} ${d.message.split("\n")[0].slice(0, 200)}`);
      await lui(`${l.length} lỗi kết nối sau khi đổi`);
      process.exit(1);
    }
    console.log(`${new Date().toISOString()} · sạch · còn ${Math.round((het - Date.now()) / 60_000)} phút`);
  }
  console.log(`doi-ban-that: ${phut} phút sạch ở cổng 6543 — giữ chế độ giao dịch`);
} else if (lenh === "--lui") {
  await lui("chủ kho hay người vận hành gọi lùi");
} else {
  dung(2, "dùng: --kiem [--phut N] | --doi [--phut N] | --lui");
}
