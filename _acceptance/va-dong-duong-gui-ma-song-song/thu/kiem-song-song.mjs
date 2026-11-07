// Bộ đo của hàng va-dong-duong-gui-ma-song-song (E1–E3). Chép tệp kiểm ra .acceptance-runs/<slug>/ (đường nhập viết lại
// thành tuyệt đối), chèn một câu ghi người ngay trước lần đếm «sau», chạy riêng trên Postgres của DATABASE_URL (mặc định
// dãy Q 5577). Không ghi gì vào cây kho. Người chèn mang tiền tố RUN của tệp nên after(cleanup) của tệp xoá đi.
//   --song-song    người email khác → bản cây xanh; bản 987c78c6 cùng phép chèn đỏ «đường đăng ký tạo người»
//   --dang-ky-tao  người mang đúng emailMoi → bản cây đỏ «đường đăng ký tạo người»; nguồn gọi đúng đường của bảng lõi
//   --that         tệp thật của cây, không chèn → xanh trọn bốn ca; nguồn còn đủ khẳng định cũ
//   --nguon <tệp>  đọc nguồn từ tệp khác thay cho tệp của cây (chỉ để phá thử phép đo)
import { spawnSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const API = join(ROOT, "packages/api");
const REL = "packages/api/test-db/dong-duong-gui-ma/dong-duong-gui-ma.test.ts";
const OUT = join(ROOT, ".acceptance-runs/va-dong-duong-gui-ma-song-song");
const BAN_TRUOC = "987c78c6726ac5e54f8dcfe0f51b259567adb02a";
const MOC = "  const sauNguoi =";
const TEN_CA = "đường lõi mật khẩu đóng";
const THONG_DIEP = "đường đăng ký tạo người";
const DB = process.env.DATABASE_URL ?? "postgres://postgres:quyhang@localhost:5577/postgres";

const args = process.argv.slice(2);
const ca = args.find((a) => ["--song-song", "--dang-ky-tao", "--that"].includes(a))?.slice(2);
const iNguon = args.indexOf("--nguon");
const nguonCay = readFileSync(iNguon >= 0 ? resolve(args[iNguon + 1]) : join(ROOT, REL), "utf8");
const loi = [];
const ket = (ok) => {
  console.log(JSON.stringify({ ca, ok, loi }));
  process.exit(ok ? 0 : 1);
};

if (!ca) {
  console.error("dùng: kiem-song-song.mjs --song-song | --dang-ky-tao | --that [--nguon <tệp>]");
  process.exit(2);
}
const host = new URL(DB).hostname;
if (!["localhost", "127.0.0.1", "::1", "[::1]"].includes(host) || /[?&](host|hostaddr)=/.test(DB)) {
  console.error(`từ chối: DATABASE_URL không trỏ Postgres trên máy (${host}) — bộ đo ghi người thử`);
  process.exit(2);
}

/** Chép nguồn, viết lại đường nhập, chèn câu trước mốc; trả đường tệp chép. */
function chep(nguon, ten, chen) {
  let s = nguon
    .replaceAll('from "../../src/', `from "${API}/src/`)
    .replaceAll('from "../helpers"', `from "${API}/test-db/helpers"`);
  if (chen) {
    const n = s.split(MOC).length - 1;
    if (n !== 1) throw new Error(`không tìm thấy đúng một mốc chèn «${MOC.trim()}» (thấy ${n})`);
    s = s.replace(MOC, `  ${chen}\n${MOC}`);
  }
  mkdirSync(OUT, { recursive: true });
  // Tệp chép nằm ngoài gói api: khai module để tsx dịch như ESM (gói db dùng await cấp đầu).
  writeFileSync(join(OUT, "package.json"), '{"type":"module"}\n');
  const tep = join(OUT, `${ten}.test.ts`);
  writeFileSync(tep, s);
  return tep;
}

function chay(tep) {
  const r = spawnSync(process.execPath, ["--import", "tsx", "--test", "--test-reporter=spec", tep], {
    cwd: API,
    env: { ...process.env, DATABASE_URL: DB },
    encoding: "utf8",
    timeout: 240_000,
  });
  return { exit: r.status, out: `${r.stdout ?? ""}\n${r.stderr ?? ""}` };
}

const xanhCa = (r) => r.exit === 0 && r.out.includes(`✔ ${TEN_CA}`);
const doDungThongDiep = (r) => r.exit !== 0 && r.out.includes(THONG_DIEP);
const dongLoi = (out) => out.split("\n").find((l) => /Error|✖|expected|actual/.test(l))?.trim() ?? "(không có dòng lỗi)";
const chenNguoi = (bien) =>
  `await identityPool.query(\`insert into identity."user" (id, name, email, "emailVerified") values (gen_random_uuid()::text, $1, $1, true)\`, [${bien}]);`;

try {
  if (ca === "song-song") {
    const cay = chay(chep(nguonCay, "song-song-cay", chenNguoi('mail("nguoi-khac")')));
    if (!xanhCa(cay)) loi.push(`bản cây đỏ khi có người email khác: ${dongLoi(cay.out)}`);
    const nguonTruoc = spawnSync("git", ["show", `${BAN_TRUOC}:${REL}`], { cwd: ROOT, encoding: "utf8" });
    if (nguonTruoc.status !== 0) loi.push(`không đọc được bản tệp tại ${BAN_TRUOC.slice(0, 8)}`);
    else {
      const truoc = chay(chep(nguonTruoc.stdout, "song-song-truoc", chenNguoi('mail("nguoi-khac")')));
      if (truoc.exit === 0) loi.push("bản trước hàng xanh — phép chèn không chạm lần đếm");
      else if (!truoc.out.includes(THONG_DIEP)) loi.push(`bản trước hàng đỏ sai thông điệp: ${dongLoi(truoc.out)}`);
    }
  } else if (ca === "dang-ky-tao") {
    if (!/authPost\(auth,\s*BANG_LOI\.signUpEmail!?\[0\]!?,\s*\{\s*email:\s*emailMoi\b/.test(nguonCay))
      loi.push("lời gọi email mới không đi đường đăng ký của bảng lõi");
    if (!nguonCay.includes('assert.equal(emailMoi, emailMoi.trim().toLowerCase(), "email thử chưa ở dạng chuẩn")'))
      loi.push("mất khẳng định dạng chuẩn");
    if (!loi.length) {
      const r = chay(chep(nguonCay, "dang-ky-tao", chenNguoi("emailMoi")));
      if (r.exit === 0) loi.push("chèn người đúng email mà ca vẫn xanh");
      else if (!doDungThongDiep(r)) loi.push(`đỏ sai thông điệp: ${dongLoi(r.out)}`);
    }
  } else {
    // Ghim trong THÂN ca «đường lõi mật khẩu đóng» (từ dòng test(...) tới «\n});» đầu tiên sau nó) — chuỗi chung như
    // «trả ${res.status}» còn ở ca khác nên đo cả tệp là đo chuỗi-có-mặt, không phải khẳng định của ca (lượt chấm 1).
    const dau = nguonCay.indexOf(`test("${TEN_CA}"`);
    const cuoi = dau < 0 ? -1 : nguonCay.indexOf("\n});", dau);
    const than = dau < 0 || cuoi < 0 ? "" : nguonCay.slice(dau, cuoi + 4);
    if (!than) loi.push(`không tìm thấy thân ca «${TEN_CA}»`);
    const GHIM = [
      "for (const path of duong) {",
      "assert.equal(res.status, 404, `${path} lần ${k} trả ${res.status}`);",
      'assert.equal(sent.length, 0, "đường lõi đã tắt vẫn gửi thư");',
      'assert.equal(await demXinMa(email), truocMa, "đường lõi đã tắt đốt lượt xin mã");',
      'assert.equal(await demSai(), truocSai, "đường lõi đã tắt đếm thử sai");',
      'assert.equal((await authPost(auth, "/email-otp/send-verification-otp", { email, type: "sign-in" })).status, 200);\n});',
    ];
    for (const g of GHIM) if (than && !than.includes(g)) loi.push(`mất khẳng định: ${g.split("\n")[0]}`);
    // Khẳng định 404 phải nằm trong vòng qua các đường lõi, trước vòng đăng ký email mới.
    const iVong = than.indexOf(GHIM[0]), i404 = than.indexOf(GHIM[1]), iMoi = than.indexOf("email: emailMoi");
    if (than && i404 >= 0 && !(iVong >= 0 && i404 > iVong && (iMoi < 0 || i404 < iMoi))) loi.push("khẳng định 404 không nằm trong vòng đường lõi");
    const r = chay(iNguon >= 0 ? chep(nguonCay, "that", null) : join(ROOT, REL));
    if (r.exit !== 0) loi.push(`tệp thật đỏ: ${dongLoi(r.out)}`);
    else if (!/ℹ pass 4\b/.test(r.out) || !r.out.includes(`✔ ${TEN_CA}`)) loi.push("không đủ 4 ca đạt");
  }
} catch (e) {
  loi.push(String(e.message ?? e));
}
ket(loi.length === 0);
