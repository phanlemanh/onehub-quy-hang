// Thước của va-e7-loi-that-cap-han: chạy phép nhìn E7 (_acceptance/luat-chia-lead-cap-han-hong/thu/chay-ui.mjs) rồi chấm
// khung 3 — thân phản hồi lấy nguyên từ GET thật của máy chủ khi cặp hạn hỏng, màn phải báo «chưa áp» nêu «Hạn gọi lần đầu»,
// không «Đã lưu». Đối chứng dương: khung 1 có toast «Đã lưu».
//   node kiem-e7.mjs              chấm cây chứa tệp này
//   node kiem-e7.mjs --doi-cau    chấm một bản sao cây (worktree dưới .acceptance-runs) mà câu lỗi cặp của máy chủ
//                                 (packages/core/src/config/giai.ts) không còn nêu khoá — phải ĐỎ ở khung 3. Không sửa cây đang chấm.
// Exit 0 = khung 3 đạt · 1 = khung 3 đỏ (in lý do) · 2 = không chấm được.
// Chỗ thử dãy D: Postgres 5575/postgres, máy dev 3495 (dung-d.mjs của hàng 48 bật từ đúng cây được chấm).
import { execFileSync, spawnSync } from "node:child_process";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const GOC = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");
const RA = path.join(GOC, ".acceptance-runs/va-e7-loi-that-cap-han");
const doiCau = process.argv.includes("--doi-cau");
const thoat = (ma, chu) => {
  console.log(chu);
  process.exit(ma);
};
const tat = (cay) => spawnSync(process.execPath, [path.join(cay, "_acceptance/luat-chia-lead/thu/dung-d.mjs"), "--tat"], { cwd: cay, stdio: "ignore" });

let CAY = GOC;
if (doiCau) {
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
const chuaAp = (k3.baoDauKhung ?? []).some((b) => b.includes("chưa áp") && b.includes("Hạn gọi lần đầu"));
if (!chuaAp) thoat(1, "khung 3 ĐỎ: màn không báo «chưa áp» nêu «Hạn gọi lần đầu» với lỗi thật của máy chủ");
if (k3.toast?.includes("Đã lưu")) thoat(1, "khung 3 ĐỎ: màn vẫn báo «Đã lưu» khi phản hồi còn lỗi");
thoat(0, "khung 3 ĐẠT: lỗi thật của máy chủ → «chưa áp», không «Đã lưu»");
