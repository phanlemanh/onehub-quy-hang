// Thước của va-e7-loi-that-cap-han: chạy phép nhìn E7 (_acceptance/luat-chia-lead-cap-han-hong/thu/chay-ui.mjs) rồi chấm
// khung 3 — thân phản hồi lấy nguyên từ GET thật của máy chủ khi cặp hạn hỏng, màn phải báo «chưa áp» nêu «Hạn gọi lần đầu»,
// không «Đã lưu». Đối chứng dương: khung 1 có toast «Đã lưu».
//   node kiem-e7.mjs              chấm cây chứa tệp này
//   node kiem-e7.mjs --doi-cau    chấm một bản sao cây (worktree dưới .acceptance-runs) mà câu lỗi cặp của máy chủ
//                                 (packages/core/src/config/giai.ts) không còn nêu khoá — phải ĐỎ ở khung 3. Không sửa cây đang chấm.
// Exit (chế độ thường): 0 = khung 3 đạt · 1 = khung 3 đỏ · 2 = không chấm được.
// Exit (--doi-cau, --nguon --tu: chiều đỏ, S4-r1 08/11): 0 = ĐỎ đúng như mong đợi · 1 = KHÔNG đỏ (thước không phân biệt) ·
// 2 = không chấm được. Mọi ngoại lệ bất ngờ thoát 2 — không bao giờ trùng mã với một kết luận.
// Khoá: E1 và E2 cùng dùng máy dev 3495 — một lượt chấm một lúc (.acceptance-runs/va-e7-loi-that-cap-han/.khoa).
// Chỗ thử dãy D: Postgres 5575/postgres, máy dev 3495 (dung-d.mjs của hàng 48 bật từ đúng cây được chấm).
import { execFileSync, spawnSync } from "node:child_process";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const GOC = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");
const RA = path.join(GOC, ".acceptance-runs/va-e7-loi-that-cap-han");
const doiCau = process.argv.includes("--doi-cau");
const chieuDo = doiCau || process.argv.includes("--tu");
process.on("uncaughtException", (e) => {
  console.log(`e7: lỗi bất ngờ — không chấm được: ${e?.message ?? e}`);
  process.exit(2);
});
process.on("unhandledRejection", (e) => {
  console.log(`e7: lỗi bất ngờ — không chấm được: ${e?.message ?? e}`);
  process.exit(2);
});
// Kết luận: ở chiều đỏ, «đỏ» là đạt (0) và «xanh» là trượt (1).
const ketLuan = (do_, chu) => {
  console.log(chu);
  if (!chieuDo) process.exit(do_ ? 1 : 0);
  console.log(do_ ? "chiều đỏ ĐẠT: thước đỏ đúng như mong đợi" : "chiều đỏ TRƯỢT: thước không đỏ — không phân biệt được bản lỗi");
  process.exit(do_ ? 0 : 1);
};
// --nguon: chỉ đọc mã nguồn chay-ui.mjs — không còn phản hồi giả viết tay (AC-3). Đối chứng dương: có lớp thay thân bằng GET thật.
if (process.argv.includes("--nguon")) {
  // --tu <ref>: đọc bản của một commit (đối chứng: bản trước vòng phải đỏ).
  const iTu = process.argv.indexOf("--tu");
  const TEP = "_acceptance/luat-chia-lead-cap-han-hong/thu/chay-ui.mjs";
  const nguon = iTu > 0 ? execFileSync("git", ["show", `${process.argv[iTu + 1]}:${TEP}`], { cwd: GOC, encoding: "utf8" }) : readFileSync(path.join(GOC, TEP), "utf8");
  const gia = [/__traGia/, /`[^`]*— cặp về mặc định[^`]*`/, /"[^"]*— cặp về mặc định[^"]*"/].filter((re) => re.test(nguon));
  if (!/await api\(\)/.test(nguon)) {
    console.log("nguồn: đối chứng dương hỏng — tệp không có lời gọi GET thật api(), không phải phép nhìn E7");
    process.exit(2);
  }
  if (gia.length) {
    ketLuan(true, `nguồn ĐỎ: còn phản hồi giả viết tay — ${gia.map(String).join(", ")}`);
  }
  if (!/__thanTuGet/.test(nguon)) {
    ketLuan(true, "nguồn ĐỎ: khung 3 không lấy thân từ GET thật (__thanTuGet)");
  }
  ketLuan(false, "nguồn ĐẠT: khung 3 lấy thân từ GET thật, không còn câu lỗi gõ tay");
}
const thoat = (ma, chu) => {
  console.log(chu);
  process.exit(ma);
};
const tat = (cay) => spawnSync(process.execPath, [path.join(cay, "_acceptance/luat-chia-lead/thu/dung-d.mjs"), "--tat"], { cwd: cay, stdio: "ignore" });

import { mkdirSync as mkdir_, rmdirSync, statSync } from "node:fs";
const KHOA = path.join(RA, ".khoa");
mkdir_(RA, { recursive: true });
for (let i = 0; ; i++) {
  try {
    mkdir_(KHOA);
    break;
  } catch {
    try {
      if (Date.now() - statSync(KHOA).mtimeMs > 60 * 60_000) rmdirSync(KHOA);
    } catch {
      // khoá vừa nhả
    }
    if (i > 360) thoat(2, "e7: chờ khoá máy dev 3495 quá 1 giờ");
    await new Promise((r) => setTimeout(r, 10_000));
  }
}
process.on("exit", () => {
  try {
    rmdirSync(KHOA);
  } catch {
    // đã nhả
  }
});
let CAY = GOC;
if (doiCau) {
  // Bản sao lấy theo HEAD: cây đang chấm còn đổi chưa commit ở vùng đo thì E1 và E2 chấm hai bản khác nhau — từ chối.
  const ban = execFileSync("git", ["status", "--porcelain", "--", "_acceptance/luat-chia-lead-cap-han-hong/thu", "_acceptance/luat-chia-lead/thu", "_acceptance/va-e7-loi-that-cap-han/thu", "packages/core/src/config"], { cwd: GOC, encoding: "utf8" }).trim();
  if (ban) thoat(2, `e7: cây đang chấm còn đổi chưa commit ở vùng đo — commit rồi chạy lại:\n${ban}`);
  const sha = execFileSync("git", ["rev-parse", "HEAD"], { cwd: GOC, encoding: "utf8" }).trim();
  CAY = path.join(RA, "wt-doi-cau");
  if (!existsSync(CAY)) execFileSync("git", ["worktree", "add", "-q", "--detach", CAY, sha], { cwd: GOC });
  execFileSync("git", ["checkout", "-q", "--detach", "--force", sha], { cwd: CAY });
  if (!existsSync(path.join(CAY, "node_modules"))) execFileSync("npm", ["ci", "--silent"], { cwd: CAY, stdio: "ignore" });
  const f = path.join(CAY, "packages/core/src/config/giai.ts");
  const goc = readFileSync(f, "utf8");
  const CU = "loi.push(`${loiCap(d.khoa, vPhu, d.khongNhoHon, vGoc)} — cặp về mặc định`);";
  if (!goc.includes(CU)) thoat(2, "e7: không thấy câu lỗi cặp trong giai.ts của bản sao — khuôn câu đã đổi, sửa lệnh đo");
  writeFileSync(f, goc.replace(CU, "loi.push(`cặp hạn trái luật — cặp về mặc định`);"));
}
// Máy dev 3495 phải chạy từ đúng cây được chấm: tắt máy của cả hai cây trước, tắt lại sau.
tat(GOC);
if (CAY !== GOC) tat(CAY);
const r = spawnSync(process.execPath, [path.join(CAY, "_acceptance/luat-chia-lead-cap-han-hong/thu/chay-ui.mjs"), "--ra", path.join(RA, doiCau ? "evidence-doi-cau" : "evidence")], {
  cwd: CAY,
  encoding: "utf8",
  timeout: 15 * 60_000,
});
tat(CAY);
const dong = (r.stdout ?? "")
  .split("\n")
  .filter((l) => l.startsWith("{"))
  .map((l) => JSON.parse(l));
const ca = Object.fromEntries(dong.map((d) => [d.ca, d]));
if (!ca["cap-ok"] || !ca["cap-con-loi"]) thoat(2, `e7: phép nhìn không ra đủ khung (mã ${r.status}) — ${(r.stderr ?? "").split("\n").filter(Boolean).slice(-2).join(" ")}`);
console.log(`cây ${execFileSync("git", ["rev-parse", "HEAD"], { cwd: CAY, encoding: "utf8" }).trim()}${doiCau ? " + câu lỗi cặp bỏ tên khoá" : ""}`);
const k1 = ca["cap-ok"];
const k3 = ca["cap-con-loi"];
console.log(`khung 1: toast «${k1.toast}»`);
console.log(`khung 3: errors từ GET thật ${JSON.stringify(k3.errorsTuGetThat)} · báo ${JSON.stringify(k3.baoDauKhung)} · toast ${JSON.stringify(k3.toast)}`);
if (!k1.toast?.includes("Đã lưu")) thoat(2, "e7: đối chứng dương hỏng — khung 1 không có toast «Đã lưu»");
if (!Array.isArray(k3.errorsTuGetThat) || !k3.errorsTuGetThat.length) thoat(2, "e7: GET thật không trả lỗi cặp — khung 3 không dựng được");
// AC-1: lỗi của GET thật phải nêu khoá vừa lưu (chế độ thường). Ở --doi-cau câu lỗi cố ý bỏ khoá — đó là đầu vào của chiều đỏ.
if (!doiCau && k3.errorsNeuKhoaGoi !== true) thoat(2, "e7: đối chứng dương hỏng — lỗi của GET thật không nêu lead_routing.first_call_minutes");
const chuaAp = (k3.baoDauKhung ?? []).some((b) => b.includes("chưa áp") && b.includes("Hạn gọi lần đầu"));
if (!chuaAp) ketLuan(true, "khung 3 ĐỎ: màn không báo «chưa áp» nêu «Hạn gọi lần đầu» với lỗi thật của máy chủ");
if (k3.toast?.includes("Đã lưu")) ketLuan(true, "khung 3 ĐỎ: màn vẫn báo «Đã lưu» khi phản hồi còn lỗi");
ketLuan(false, "khung 3 ĐẠT: lỗi thật của máy chủ → «chưa áp», không «Đã lưu»");
