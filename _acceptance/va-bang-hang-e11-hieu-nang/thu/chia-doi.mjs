// Chia đôi first-parent giữa bản tốt và bản chậm bằng phép đo cặp (do-cap.sh): mỗi bước 3 cặp, tỉ số trung vị
// (tỷ lệ khung > 50 ms bản xét / bản tốt cùng cặp) > 1,4 = chậm, < 1,2 = tốt, giữa thì thêm 3 cặp (tối đa 2 lần).
//   node chia-doi.mjs <worktree tốt> <worktree xét> <sha tốt> <sha chậm>
// In từng bước và commit chậm đầu tiên; bảng số ở .acceptance-runs/va-bang-hang-e11-hieu-nang/cap.tsv.
import { execFileSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const [TOT, XET, SHA_TOT, SHA_CHAM] = process.argv.slice(2);
const DAY = path.dirname(fileURLToPath(import.meta.url));
const GOC = path.resolve(DAY, "../../..");
const git = (...a) => execFileSync("git", a, { cwd: GOC, encoding: "utf8" }).trim();
// Danh sách first-parent của bản chậm từ cũ tới mới, chỉ giữ commit đã chứa bản tốt (bản tốt là commit nhánh, không nằm
// trên đường first-parent — phần tử đầu là lần gộp nó vào nhánh chính); phần tử cuối là bản chậm.
const coBanTot = (sha) => {
  try {
    execFileSync("git", ["merge-base", "--is-ancestor", SHA_TOT, sha], { cwd: GOC });
    return true;
  } catch {
    return false;
  }
};
const tatCa = git("rev-list", "--first-parent", "--reverse", `${SHA_TOT}..${SHA_CHAM}`).split("\n");
const ds = tatCa.slice(tatCa.findIndex(coBanTot));
const trungVi = (xs) => {
  const s = [...xs].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
};

function do_(sha, cap) {
  const ra = execFileSync("bash", [path.join(DAY, "do-cap.sh"), TOT, XET, sha, String(cap)], { cwd: GOC, encoding: "utf8" });
  return ra
    .trim()
    .split("\n")
    .map((l) => l.split("\t"))
    .map(([, , tot, , xet]) => Number(xet) / Number(tot))
    .filter((x) => Number.isFinite(x));
}

// Nối lại khoảng đã biết: CHIA_LO / CHIA_HI là chỉ số (0-based) của commit đã biết tốt / chậm.
let lo = Number(process.env.CHIA_LO ?? -1); // chỉ số cuối cùng đã biết tốt (−1 = SHA_TOT)
let hi = Number(process.env.CHIA_HI ?? ds.length - 1); // chỉ số đầu tiên đã biết chậm
console.log(`chia đôi ${ds.length} commit first-parent ${SHA_TOT.slice(0, 8)}..${SHA_CHAM.slice(0, 8)}`);
// Commit không đo được (màn lỗi, build hỏng) bỏ qua như «git bisect skip»: thử commit kề bên trong khoảng còn lại.
const boQua = new Set();
const chon = () => {
  const giua = Math.floor((lo + hi) / 2);
  for (let d = 0; d < hi - lo; d++) for (const i of [giua + d, giua - d]) if (i > lo && i < hi && !boQua.has(i)) return i;
  return -1;
};
while (hi - lo > 1) {
  const mid = chon();
  if (mid < 0) {
    console.log(`mọi commit giữa ${ds[lo]?.slice(0, 8) ?? SHA_TOT.slice(0, 8)} và ${ds[hi].slice(0, 8)} không đo được — commit chậm nằm trong khoảng ấy`);
    process.exit(3);
  }
  const sha = ds[mid];
  let ts = do_(sha, 1);
  if (!ts.length) {
    console.log(`${sha.slice(0, 8)} [${mid + 1}/${ds.length}]: không đo được — bỏ qua`);
    boQua.add(mid);
    continue;
  }
  ts = ts.concat(do_(sha, 2));
  for (let them = 0; them < 2 && trungVi(ts) >= 1.2 && trungVi(ts) <= 1.4; them++) ts = ts.concat(do_(sha, 3));
  const t = trungVi(ts);
  const cham = t > 1.3;
  console.log(`${sha.slice(0, 8)} [${mid + 1}/${ds.length}] tỉ số ${ts.map((x) => x.toFixed(2)).join(" ")} → trung vị ${t.toFixed(2)} → ${cham ? "chậm" : "tốt"}`);
  if (cham) hi = mid;
  else lo = mid;
}
const dau = ds[hi];
console.log(`commit chậm đầu tiên (first-parent): ${dau} — ${git("log", "-1", "--format=%s", dau)}`);
