// Bài đo của hàng vá va-cdp-tat-chrome: cdp.mjs có luôn tắt Chrome của chính nó không, ở mọi lối kết thúc của tiến trình
// gọi. Mỗi ca chạy một tiến trình gọi con (con.mjs) với Chrome thật, đối chứng dương TRƯỚC bước tắt, rồi trong 5 giây đòi:
// không còn tiến trình nào mang thư mục hồ sơ (dòng lệnh đầy đủ, ps -ww), thư mục không còn, dòng sổ không còn, người canh
// không còn, và mã thoát đúng ma trận viết trước. Mỗi ca in một dòng JSON; đỏ in thông điệp ghim.
//   node kiem-tat-chrome.mjs --ca <ca> [--ca <ca> …]      ca trên cdp.mjs của cây
//   node kiem-tat-chrome.mjs --doi-chung-do <sha>         mọi ca trên cdp.mjs của nhánh chính tại <sha>: ca tắt phải ĐỎ
// Thoát 0 = mọi ca đạt kỳ vọng · 1 = có ca lệch · 2 = không chạy được (không có Chrome, sha sai).
import { spawn, spawnSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const DAY = path.dirname(fileURLToPath(import.meta.url));
const GOC = path.resolve(DAY, "../../..");
const CDP_CAY = path.join(GOC, "_acceptance/bang-hang-kieu-sheet/thu/cdp.mjs");
const CDP_TUONG_DOI = "_acceptance/bang-hang-kieu-sheet/thu/cdp.mjs";
const CON = path.join(DAY, "con.mjs");
const SO_PID = path.join(GOC, ".acceptance-runs/cdp-chrome");
const RA = path.join(GOC, ".acceptance-runs/va-cdp-tat-chrome");
const CHROME = process.env.CHROME_PATH ?? "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const HAN_MS = 5000;
const ngu = (ms) => new Promise((r) => setTimeout(r, ms));

if (!existsSync(CHROME)) {
  console.error(`không có Chrome ở ${CHROME} — đặt CHROME_PATH`);
  process.exit(2);
}
mkdirSync(RA, { recursive: true });

const conSong = (pid) => {
  if (!Number.isInteger(pid) || pid <= 0) return false;
  try {
    process.kill(pid, 0);
    return true;
  } catch (e) {
    return e.code === "EPERM";
  }
};
/** Tiến trình còn sống mang thư mục hồ sơ trong dòng lệnh đầy đủ (bỏ tiến trình xác — <defunct>). */
const mangDir = (dir) =>
  spawnSync("ps", ["-axww", "-o", "pid=,stat=,command="], { encoding: "utf8" })
    .stdout.split("\n")
    .map((l) => /^\s*(\d+)\s+(\S+)\s+(.*)$/.exec(l))
    .filter((m) => m && !m[2].startsWith("Z") && m[3].includes(dir))
    .map((m) => Number(m[1]));
const deadPid = () => spawnSync("true").pid;
/** Gửi tín hiệu cho bước dọn: tiến trình vừa chết giữa lúc dò và lúc kill (ESRCH) không làm sập lượt đo. */
const diet = (pid, sig = "SIGKILL") => {
  try {
    process.kill(pid, sig);
    return true;
  } catch {
    return false;
  }
};
/** Giết nhóm tiến trình, nhóm không có thì giết riêng tiến trình. */
const dietNhom = (pid) => diet(-pid) || diet(pid);
// Vết lỗi Node của chính con.mjs khi lỗi chưa bắt: dòng nguồn, dòng mũi tên, dòng Error, các dòng «at …», dòng phiên bản.
const VET_LOI_CON = [/^file:\/\/\S*con\.mjs:\d+$/, /throw new Error\("lỗi thử của con"\);$/, /^\s*\^+\s*$/, /^Error: lỗi thử của con$/, /^\s+at /, /^Node\.js v\d/];
/** Phần stderr còn lại sau khi bỏ đúng vết lỗi của con — rỗng nghĩa là công cụ không in gì thêm. */
const stderrLa = (s) =>
  s
    .split("\n")
    .filter((l) => l.trim() && !VET_LOI_CON.some((r) => r.test(l)))
    .join("\n");

// Ma trận viết trước: mã thoát kỳ vọng của từng lối kết thúc (null = tiến trình con không tự thoát; bài kill nó).
const MA_THOAT = { dong: null, thoat: 0, loi: 1, "dong-exit-0": 0, "dong-exit-3": 3, SIGTERM: 143, SIGINT: 130, SIGHUP: 129, "bat-rieng": 7, "bat-rieng-once": 7, SIGKILL: null, api: null };
const TIN_HIEU = { SIGTERM: "SIGTERM", SIGINT: "SIGINT", SIGHUP: "SIGHUP", "bat-rieng": "SIGTERM", "bat-rieng-once": "SIGTERM", SIGKILL: "SIGKILL" };
// Thông điệp ghim chính của từng ca — E7 đòi ca tắt trên bản cũ đỏ bằng ít nhất một thông điệp trong đây. Ca mà bản cũ để
// Chrome sống thì CHỈ thông điệp về Chrome được tính — thông điệp thư mục chung không chứng được bộ dò Chrome. Ca dong và
// dong-exit-* bản cũ có tắt Chrome (p.kill), nên chiều đỏ của chúng là hồ sơ tạm còn trên đĩa.
const GHIM = {
  dong: ["Chrome còn sống sau dong()", "hồ sơ tạm còn trên đĩa"],
  thoat: ["Chrome mồ côi sau khi lời gọi thoát"],
  loi: ["Chrome mồ côi sau khi lời gọi thoát"],
  "dong-exit-0": ["Chrome mồ côi sau khi lời gọi thoát", "hồ sơ tạm còn trên đĩa"],
  "dong-exit-3": ["Chrome mồ côi sau khi lời gọi thoát", "hồ sơ tạm còn trên đĩa"],
  SIGTERM: ["Chrome mồ côi sau SIGTERM"],
  SIGINT: ["Chrome mồ côi sau SIGINT"],
  SIGHUP: ["Chrome mồ côi sau SIGHUP"],
  "bat-rieng": ["Chrome mồ côi sau SIGTERM"],
  "bat-rieng-once": ["Chrome mồ côi sau SIGTERM"],
  SIGKILL: ["Chrome mồ côi sau SIGKILL"],
  "mo-coi": ["mồ côi cũ không được dọn", "hồ sơ tạm của Chrome đã chết còn trên đĩa"],
};

function moCon(cdp, ca, them = []) {
  const p = spawn(process.execPath, [CON, "--cdp", cdp, "--ca", ca, ...them], { stdio: ["ignore", "pipe", "pipe"] });
  const kq = { p, dong: [], loi: "", ma: undefined, tin: undefined };
  let buf = "";
  p.stdout.on("data", (d) => {
    buf += d;
    const ds = buf.split("\n");
    buf = ds.pop();
    for (const l of ds) if (l.trim()) kq.dong.push(JSON.parse(l));
  });
  p.stderr.on("data", (d) => (kq.loi += d));
  p.on("exit", (ma, tin) => {
    kq.ma = ma;
    kq.tin = tin;
  });
  return kq;
}
async function cho(dk, han) {
  const dau = Date.now();
  while (Date.now() - dau < han) {
    if (await dk()) return true;
    await ngu(100);
  }
  return !!(await dk());
}
/** Dọn đúng thứ lượt đo đã ghi: tiến trình con, nhóm Chrome, tiến trình mang thư mục hồ sơ của lượt, thư mục, dòng sổ. */
function donLuot({ con, chrome, canh, dir }) {
  for (const pid of [con, canh]) if (conSong(pid)) diet(pid);
  if (conSong(chrome)) dietNhom(chrome);
  if (dir) for (const pid of mangDir(dir)) diet(pid);
  if (dir) rmSync(dir, { recursive: true, force: true });
  if (chrome) rmSync(path.join(SO_PID, `${chrome}.json`), { force: true });
}

/** Một ca tắt. coSo=false (bản cũ): bỏ phần đối chứng dương của sổ và người canh — bản cũ không có. */
async function caTat(cdp, ca, coSo) {
  const dau = path.join(RA, `dau-${process.pid}-${ca}`);
  rmSync(dau, { force: true });
  const k = moCon(cdp, ca, ca.startsWith("bat-rieng") ? ["--dau", dau] : []);
  const ok1 = await cho(() => k.dong.length > 0 || k.ma !== undefined, 30000);
  const info = k.dong[0];
  const loi = [];
  if (!ok1 || !info?.chrome || !info?.dir) {
    donLuot({ con: k.p.pid, ...(info ?? {}) });
    return { ca, ok: false, loi: [`đối chứng dương hỏng: con không in thông tin Chrome (${k.loi.trim().slice(0, 200)})`] };
  }
  const so = path.join(SO_PID, `${info.chrome}.json`);
  // Đối chứng dương, trước bước tắt (con đứng chờ hiệu lệnh SIGUSR2 hay tín hiệu): Chrome của lượt sống mang thư mục
  // hồ sơ, thư mục có, và (bản có sổ) dòng sổ ở đúng đường mang đúng PID + thư mục, người canh sống.
  if (mangDir(info.dir).length < 1) loi.push("đối chứng dương hỏng: bộ dò không thấy tiến trình mang thư mục hồ sơ");
  if (!existsSync(info.dir)) loi.push("đối chứng dương hỏng: thư mục hồ sơ không có trên đĩa");
  if (coSo) {
    let d = null;
    try {
      d = JSON.parse(readFileSync(so, "utf8"));
    } catch {
      // thiếu
    }
    if (!d) loi.push(`đối chứng dương hỏng: không có dòng sổ ở ${path.relative(GOC, so)}`);
    else if (d.chrome !== info.chrome || d.dir !== info.dir) loi.push("đối chứng dương hỏng: dòng sổ không mang đúng PID Chrome và thư mục");
    if (!conSong(info.canh)) loi.push("đối chứng dương hỏng: người canh không sống");
  }
  if (loi.length) {
    donLuot({ con: k.p.pid, ...info });
    return { ca, ok: false, loi };
  }
  process.kill(k.p.pid, TIN_HIEU[ca] ?? "SIGUSR2");
  const ky = MA_THOAT[ca];
  const tuThoat = ky !== null && ky !== undefined;
  const ten = TIN_HIEU[ca] ?? null;
  const sach = () =>
    mangDir(info.dir).length === 0 && !existsSync(info.dir) && (!coSo || (!existsSync(so) && !conSong(info.canh))) && (!tuThoat || k.ma !== undefined);
  await cho(sach, HAN_MS);
  const conChrome = mangDir(info.dir).length > 0;
  if (conChrome) {
    if (ca === "dong") loi.push("Chrome còn sống sau dong()");
    else if (ten) loi.push(`Chrome mồ côi sau ${ten}`);
    else loi.push(`Chrome mồ côi sau khi lời gọi thoát (${ca})`);
  }
  if (existsSync(info.dir)) loi.push(`hồ sơ tạm còn trên đĩa (${ca})`);
  if (coSo && existsSync(so)) loi.push(`dòng sổ PID còn (${ca})`);
  if (coSo && conSong(info.canh)) loi.push(`người canh còn sống (${ca})`);
  if (tuThoat) {
    if (k.ma === undefined) loi.push(ten ? `lời gọi không thoát sau ${ten}` : `lời gọi không thoát (${ca})`);
    else if (k.ma !== ky) loi.push(`mã thoát đổi (${ca}: ${k.ma ?? k.tin})`);
  }
  if (ca === "dong") {
    if (k.ma !== undefined) loi.push("lời gọi chết sau dong()");
    const l2 = k.dong.find((x) => "lan2" in x);
    if (l2 && l2.lan2 !== "ok") loi.push(`dong() lần hai ném lỗi: ${l2.lan2}`);
  }
  if (ca.startsWith("dong-exit") && k.loi.trim()) loi.push(`công cụ in ra stderr (${ca})`);
  if (ca === "loi" && stderrLa(k.loi)) loi.push("công cụ in ra stderr (loi)");
  // Đối chứng âm của chính phép kiểm: stderr thật của ca cộng một dòng lạ trước và sau phải bị bắt.
  if (ca === "loi" && stderrLa(`công cụ: cảnh báo thử\n${k.loi}\ncông cụ: cảnh báo sau`) !== "công cụ: cảnh báo thử\ncông cụ: cảnh báo sau")
    loi.push("phép đo stderr (loi) không bắt được dòng lạ");
  if (ca === "loi" && !k.loi.includes("lỗi thử của con")) loi.push("mã thoát đổi (loi: không thấy lỗi của con)");
  if (ca.startsWith("bat-rieng") && !existsSync(dau)) loi.push("bộ bắt riêng không chạy");
  rmSync(dau, { force: true });
  donLuot({ con: k.p.pid, ...info });
  return { ca, ok: loi.length === 0, loi };
}

async function caApi(cdp, coSo) {
  const k = moCon(cdp, "api");
  await cho(() => k.dong.length >= 2 || k.ma !== undefined, 30000);
  const [info, kq] = k.dong;
  const loi = [];
  if (!info?.dir || !kq) loi.push(`API đổi: không chạy hết lời gọi (${k.loi.trim().slice(0, 200)})`);
  else {
    if (kq.w !== 800) loi.push(`API đổi: innerWidth ${kq.w}`);
    if (!kq.png) loi.push(`API đổi: chup() không trả PNG (${kq.dai} byte)`);
    if (coSo) {
      await cho(() => mangDir(info.dir).length === 0 && !conSong(info.canh), HAN_MS);
      if (mangDir(info.dir).length) loi.push("API đổi: dong() không await không tắt Chrome");
      if (conSong(info.canh)) loi.push("API đổi: người canh còn sống sau dong()");
    }
  }
  donLuot({ con: k.p.pid, ...(info ?? {}) });
  return { ca: "api", ok: loi.length === 0, loi };
}

/** Khuôn dòng sổ rút từ bên viết thật: mở một Chrome bằng cdp.mjs của cây, đọc dòng sổ nó ghi, đóng. */
async function khuonSo() {
  const k = moCon(CDP_CAY, "SIGKILL");
  await cho(() => k.dong.length > 0, 30000);
  const info = k.dong[0];
  const d = JSON.parse(readFileSync(path.join(SO_PID, `${info.chrome}.json`), "utf8"));
  process.kill(k.p.pid, "SIGTERM");
  await cho(() => k.ma !== undefined && mangDir(info.dir).length === 0, HAN_MS);
  donLuot({ con: k.p.pid, ...info });
  return d;
}

async function caMoCoi(cdp) {
  const khuon = await khuonSo();
  const viet = (ten, d) => {
    mkdirSync(SO_PID, { recursive: true });
    const tep = path.join(SO_PID, `${ten}.json`);
    // Giữ đúng tập khoá bên viết ghi; chỉ thay giá trị.
    writeFileSync(tep, JSON.stringify(Object.fromEntries(Object.keys(khuon).map((x) => [x, x in d ? d[x] : khuon[x]]))));
    return tep;
  };
  const chaChet = deadPid();
  // (a) Chrome mồ côi thật, nhóm tiến trình riêng như cdp.mjs mở.
  const dirA = mkdtempSync(path.join(tmpdir(), "qh-b-chrome-"));
  const a = spawn(CHROME, ["--headless=new", "--remote-debugging-port=0", `--user-data-dir=${dirA}`, "--no-first-run", "about:blank"], { stdio: "ignore", detached: true });
  a.unref();
  // (b) PID tái dùng: một tiến trình khác đang sống.
  const b = spawn("sleep", ["120"], { stdio: "ignore", detached: true });
  b.unref();
  const dirB = path.join(tmpdir(), `qh-b-chrome-taidung-${process.pid}`);
  // (c) Chrome đã chết, hồ sơ còn.
  const dirC = mkdtempSync(path.join(tmpdir(), "qh-b-chrome-"));
  writeFileSync(path.join(dirC, "x"), "x");
  // (d) đường ngoài thư mục tạm, tên mang ĐÚNG tiền tố — chỉ rào «ngay dưới thư mục tạm» giữ được nó.
  const dirD = path.join(RA, `qh-b-chrome-ngoai-tmp-${process.pid}`);
  mkdirSync(dirD, { recursive: true });
  writeFileSync(path.join(dirD, "x"), "x");
  const pc = deadPid();
  const pd = deadPid();
  await cho(() => mangDir(dirA).length > 0, 10000);
  const tep = [
    viet(a.pid, { chrome: a.pid, canh: chaChet, cha: chaChet, dir: dirA }),
    viet(b.pid, { chrome: b.pid, canh: chaChet, cha: chaChet, dir: dirB }),
    viet(pc, { chrome: pc, canh: chaChet, cha: chaChet, dir: dirC }),
    viet(pd, { chrome: pd, canh: chaChet, cha: chaChet, dir: dirD }),
  ];
  const loi = [];
  // Đối chứng dương: trước lần mở mới, mồ côi và tiến trình khác đều sống, các thư mục đều có.
  if (mangDir(dirA).length < 1) loi.push("đối chứng dương hỏng: Chrome mồ côi (a) không sống");
  if (!conSong(b.pid)) loi.push("đối chứng dương hỏng: tiến trình khác (b) không sống");
  for (const [n, d] of [["a", dirA], ["c", dirC], ["d", dirD]]) if (!existsSync(d)) loi.push(`đối chứng dương hỏng: thư mục (${n}) không có`);
  if (!loi.length) {
    const k = moCon(cdp, "mo-coi");
    await cho(() => k.ma !== undefined, 30000);
    const info = k.dong[0] ?? {};
    await cho(() => mangDir(dirA).length === 0 && !existsSync(dirA) && !existsSync(dirC) && tep.every((t) => !existsSync(t)), HAN_MS);
    if (mangDir(dirA).length || existsSync(dirA)) loi.push("mồ côi cũ không được dọn");
    if (!conSong(b.pid)) loi.push("kill nhầm PID tái dùng");
    if (existsSync(dirC)) loi.push("hồ sơ tạm của Chrome đã chết còn trên đĩa");
    if (!existsSync(dirD) || !existsSync(path.join(dirD, "x"))) loi.push("xoá đường ngoài thư mục tạm");
    const con = tep.filter((t) => existsSync(t)).length;
    if (con) loi.push(`mồ côi cũ không được dọn: ${con} dòng sổ còn`);
    donLuot({ con: k.p.pid, ...info });
  }
  // Dọn đúng thứ bài đã dựng.
  if (conSong(a.pid)) dietNhom(a.pid);
  for (const pid of mangDir(dirA)) diet(pid);
  if (conSong(b.pid)) diet(b.pid);
  for (const d of [dirA, dirB, dirC, dirD]) rmSync(d, { recursive: true, force: true });
  for (const t of tep) rmSync(t, { force: true });
  return { ca: "mo-coi", ok: loi.length === 0, loi };
}

const CA_TAT = ["dong", "thoat", "loi", "dong-exit-0", "dong-exit-3", "SIGTERM", "SIGINT", "SIGHUP", "bat-rieng", "bat-rieng-once", "SIGKILL"];
async function chay(cdp, ca, coSo) {
  if (ca === "api") return caApi(cdp, coSo);
  if (ca === "mo-coi") return caMoCoi(cdp);
  if (!CA_TAT.includes(ca)) throw new Error(`ca lạ: ${ca}`);
  return caTat(cdp, ca, coSo);
}

const iDoi = process.argv.indexOf("--doi-chung-do");
let sai = 0;
if (iDoi > 0) {
  const sha = process.argv[iDoi + 1];
  const r = spawnSync("git", ["-C", GOC, "show", `${sha}:${CDP_TUONG_DOI}`], { encoding: "utf8" });
  if (r.status !== 0) {
    console.error(`không rút được cdp.mjs tại ${sha}: ${r.stderr.trim()}`);
    process.exit(2);
  }
  const tam = mkdtempSync(path.join(tmpdir(), "qh-cdp-cu-"));
  const cu = path.join(tam, "cdp.mjs");
  writeFileSync(cu, r.stdout);
  try {
    for (const ca of [...CA_TAT, "mo-coi"]) {
      const kq = await chay(cu, ca, false);
      const dung = !kq.ok && kq.loi.some((l) => GHIM[ca].some((g) => l.startsWith(g)));
      if (!dung) sai++;
      console.log(JSON.stringify({ ban: "cu", ca, ky_vong: "do", dung, ...(kq.ok ? { loi: [`phép đo ${ca} không phân biệt được bản sửa`] } : { loi: kq.loi }) }));
    }
    const api = await chay(cu, "api", false);
    if (!api.ok) sai++;
    console.log(JSON.stringify({ ban: "cu", ca: "api", ky_vong: "xanh", dung: api.ok, loi: api.loi }));
  } finally {
    rmSync(tam, { recursive: true, force: true });
  }
} else {
  const ds = process.argv.flatMap((a, i) => (process.argv[i - 1] === "--ca" ? [a] : []));
  if (!ds.length) {
    console.error("thiếu --ca <ca> hay --doi-chung-do <sha>");
    process.exit(2);
  }
  const cdp = (() => {
    const i = process.argv.indexOf("--cdp");
    return i > 0 ? path.resolve(process.argv[i + 1]) : CDP_CAY;
  })();
  for (const ca of ds) {
    const kq = await chay(cdp, ca, true);
    if (!kq.ok) sai++;
    console.log(JSON.stringify(kq));
  }
}
process.exit(sai ? 1 : 0);
