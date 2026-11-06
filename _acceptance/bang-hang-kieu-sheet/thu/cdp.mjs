// Trình duyệt không đầu tối giản cho hồ sơ bang-hang-kieu-sheet: Chrome có sẵn trên máy + DevTools Protocol qua
// WebSocket của Node — kho không có playwright ở main (ADR-0004 đo trên nhánh thử). Dùng cho chụp đối chiếu và máy đo
// cuộn (E11). Đăng nhập lấy phiên bằng mã đọc ở nhật ký máy chủ dev của dung-b.mjs.
import { spawn, spawnSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const GOC = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");
// Bản dev của dãy B ở 3481 (luật đợt 7); máy đo cuộn đặt QH_B_URL tới bản build ở 3491 (giám sát cấp, yêu cầu B-6).
export const URL_GOC = process.env.QH_B_URL ?? "http://localhost:3481";
const LOG = path.join(GOC, ".acceptance-runs/bang-hang-kieu-sheet/web-b.log");
const CHROME = process.env.CHROME_PATH ?? "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const ngu = (ms) => new Promise((r) => setTimeout(r, ms));

/**
 * Phiên đăng nhập của một người mẫu: cookie dạng «tên=giá trị» từng cái. Giữ phiên ở .acceptance-runs và dùng lại khi
 * còn sống — mỗi email chỉ xin được 5 mã trong 15 phút (ADR-0005).
 */
export async function cookieCua(email, { chiPhienGiu = false } = {}) {
  const giu = path.join(GOC, `.acceptance-runs/bang-hang-kieu-sheet/phien-${email}.json`);
  if (existsSync(giu)) {
    const c = JSON.parse(readFileSync(giu, "utf8"));
    if ((await fetch(`${URL_GOC}/api/v1/me`, { headers: { cookie: c.join("; ") } })).status === 200) return c;
  }
  // Bản build gửi mã qua bộ gửi thật (khoá giả) — không bao giờ xin mã ở đó.
  if (chiPhienGiu) throw new Error(`không có phiên còn sống của ${email} — chạy dung-b.mjs (bản dev) rồi một lệnh dùng cookieCua trước`);
  const c = await xinPhien(email);
  writeFileSync(giu, JSON.stringify(c));
  return c;
}

async function xinPhien(email) {
  const h = { "content-type": "application/json", origin: URL_GOC };
  const maCua = () => readFileSync(LOG, "utf8").split("\n").filter((l) => l.includes(`[ma-dang-nhap] ${email} `));
  const truoc = maCua().length;
  await fetch(`${URL_GOC}/api/v1/auth/email-otp/send-verification-otp`, { method: "POST", headers: h, body: JSON.stringify({ email, type: "sign-in" }) });
  let ma = null;
  for (let i = 0; !ma && i < 30; i++) {
    await ngu(300);
    // Chỉ nhận mã MỚI của lần xin này — mã cũ trong nhật ký đã hết hiệu lực.
    const ds = maCua();
    ma = ds.length > truoc ? (ds.at(-1)?.split(" ").at(-1) ?? null) : null;
  }
  if (!ma) throw new Error(`không thấy mã của ${email} trong ${LOG}`);
  const r = await fetch(`${URL_GOC}/api/v1/auth/sign-in/email-otp`, { method: "POST", headers: h, body: JSON.stringify({ email, otp: ma }) });
  if (r.status !== 200) throw new Error(`đăng nhập ${email}: ${r.status}`);
  const ck = r.headers.getSetCookie().map((c) => c.split(";")[0]);
  // Người thuộc nhiều sàn: mở vào Sàn thử (cookie qh_san); bài nhìn đổi sàn bằng bộ chọn sàn.
  const me = await (await fetch(`${URL_GOC}/api/v1/me`, { headers: { cookie: ck.join("; ") } })).json();
  if (me.companies.length < 2) return ck;
  return [...ck, `qh_san=${me.companies.find((c) => c.name === "[Mẫu] Sàn thử").id}`];
}

// ── Chrome của lượt luôn tắt (va-cdp-tat-chrome) ──
// Chrome chạy trong nhóm tiến trình riêng (PID nhóm = PID Chrome) — tắt là kill đúng nhóm công cụ đã mở, không dò tên
// (luật đợt 8). Mỗi lần mở ghi một dòng sổ ở .acceptance-runs/cdp-chrome/<pid>.json của cây đang chạy; tắt xong xoá dòng.
// Bốn lối tắt: dong() · lúc tiến trình gọi thoát (kể cả lỗi chưa bắt) · lúc nhận SIGTERM/SIGINT/SIGHUP · người canh khi
// tiến trình gọi bị SIGKILL. Đầu mỗi moChrome() dọn mồ côi của lượt trước theo sổ.
const SO_PID = path.join(GOC, ".acceptance-runs/cdp-chrome");
const TIEN_TO = "qh-b-chrome-";
const conSong = (pid) => {
  if (!Number.isInteger(pid) || pid <= 0) return false;
  try {
    process.kill(pid, 0);
    return true;
  } catch (e) {
    return e.code === "EPERM";
  }
};
const dongLenh = (pid) => spawnSync("ps", ["-ww", "-o", "command=", "-p", String(pid)], { encoding: "utf8" }).stdout ?? "";
const giet = (pid, tin) => {
  try {
    process.kill(pid, tin);
  } catch {
    // đã tắt
  }
};
/** Kill cả nhóm tiến trình của Chrome; nhóm không có (Chrome không phải trưởng nhóm) thì kill riêng PID. */
const gietNhom = (pid, tin) => {
  try {
    process.kill(-pid, tin);
  } catch {
    giet(pid, tin);
  }
};
const xoa = (p) => {
  try {
    rmSync(p, { recursive: true, force: true });
  } catch {
    // đã xoá
  }
};
const nguDongBo = (ms) => Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);
/** Chỉ xoá thư mục hồ sơ do công cụ tạo: ngay dưới thư mục tạm của hệ thống, tên mang tiền tố. */
const xoaDuoc = (dir) => typeof dir === "string" && path.dirname(path.resolve(dir)) === path.resolve(tmpdir()) && path.basename(dir).startsWith(TIEN_TO);

/** Dọn dòng sổ mà tiến trình gọi đã chết: Chrome còn mang đúng hồ sơ thì tắt; PID đã tái dùng thì không kill. */
function donMoCoi() {
  let ten;
  try {
    ten = readdirSync(SO_PID).filter((f) => f.endsWith(".json"));
  } catch {
    return;
  }
  for (const t of ten) {
    const tep = path.join(SO_PID, t);
    let d;
    try {
      d = JSON.parse(readFileSync(tep, "utf8"));
    } catch {
      xoa(tep);
      continue;
    }
    if (conSong(d.cha)) continue;
    const mang = (pid) => typeof d.dir === "string" && conSong(pid) && dongLenh(pid).includes(d.dir);
    if (mang(d.chrome)) {
      gietNhom(d.chrome, "SIGKILL");
      for (let i = 0; i < 20 && conSong(d.chrome); i++) nguDongBo(50);
    }
    if (mang(d.canh)) giet(d.canh, "SIGTERM");
    if (xoaDuoc(d.dir)) xoa(d.dir);
    xoa(tep);
  }
}

// Người canh: tiến trình node tách rời, mỗi Chrome một cái. Tiến trình gọi chết (kể cả SIGKILL) → tắt nhóm Chrome khi dòng
// lệnh của nó còn mang hồ sơ, xoá hồ sơ và dòng sổ, thoát. Chrome đã tắt → thoát luôn (tiến trình gọi còn sống thì việc dọn
// là của nó).
const CANH = `const [cha, chrome, dir, so] = process.argv.slice(1); const { spawnSync } = require("node:child_process");
const fs = require("node:fs"); const song = (p) => { try { process.kill(+p, 0); return true; } catch (e) { return e.code === "EPERM"; } };
const mang = () => (spawnSync("ps", ["-ww", "-o", "command=", "-p", chrome], { encoding: "utf8" }).stdout || "").includes(dir);
const don = () => { try { fs.rmSync(dir, { recursive: true, force: true }); } catch {} try { fs.rmSync(so, { force: true }); } catch {} };
process.on("SIGTERM", () => process.exit(0));
setInterval(() => {
  if (song(cha)) { if (!song(chrome)) process.exit(0); return; }
  if (song(chrome) && mang()) { try { process.kill(-chrome, "SIGKILL"); } catch { try { process.kill(+chrome, "SIGKILL"); } catch {} } }
  setTimeout(() => { don(); process.exit(0); }, 300);
}, 500);`;

/** Chrome đang mở của tiến trình này — bộ tắt lúc thoát và lúc nhận tín hiệu tắt hết. */
const DANG_MO = new Set();
let daCaiBat = false;
function caiBat() {
  if (daCaiBat) return;
  daCaiBat = true;
  process.on("exit", () => {
    for (const c of DANG_MO) c.tatNgay();
  });
  for (const [tin, so] of [
    ["SIGTERM", 15],
    ["SIGINT", 2],
    ["SIGHUP", 1],
  ]) {
    process.on(tin, () => {
      for (const c of DANG_MO) c.tatNgay();
      // Bộ bắt này là bộ bắt duy nhất → giữ hành vi mặc định của Node (thoát 128 + số hiệu). Lời gọi có bộ bắt riêng thì bộ
      // bắt riêng quyết mã thoát.
      if (process.listenerCount(tin) === 1) process.exit(128 + so);
    });
  }
}

export async function moChrome() {
  donMoCoi();
  caiBat();
  const dir = mkdtempSync(path.join(tmpdir(), TIEN_TO));
  const p = spawn(CHROME, ["--headless=new", "--remote-debugging-port=0", `--user-data-dir=${dir}`, "--no-first-run", "--hide-scrollbars", "about:blank"], {
    stdio: ["ignore", "ignore", "pipe"],
    detached: true,
  });
  const so = path.join(SO_PID, `${p.pid}.json`);
  const conChay = () => p.exitCode === null && p.signalCode === null;
  let canh = null;
  let xong = false;
  const c = {
    /** Tắt đồng bộ — dùng lúc thoát và lúc nhận tín hiệu. Gọi nhiều lần không sao. */
    tatNgay() {
      if (xong) return;
      xong = true;
      DANG_MO.delete(c);
      if (conChay()) gietNhom(p.pid, "SIGKILL");
      if (canh) giet(canh.pid, "SIGTERM");
      xoa(dir);
      xoa(so);
    },
  };
  DANG_MO.add(c);
  const ws = await new Promise((res, rej) => {
    let buf = "";
    p.stderr.on("data", (d) => {
      buf += d;
      const m = /DevTools listening on (ws:\/\/\S+)/.exec(buf);
      if (m) res(m[1]);
    });
    p.on("exit", () => rej(new Error("Chrome thoát trước khi mở cổng gỡ lỗi")));
  }).catch((e) => {
    c.tatNgay();
    throw e;
  });
  // Chrome và ống stderr của nó không giữ vòng sự kiện: lời gọi xong việc thì thoát được, bộ tắt lúc thoát lo phần còn lại.
  p.unref();
  p.stderr.unref?.();
  canh = spawn(process.execPath, ["-e", CANH, String(process.pid), String(p.pid), dir, so], { detached: true, stdio: "ignore" });
  canh.unref();
  mkdirSync(SO_PID, { recursive: true });
  writeFileSync(so, JSON.stringify({ chrome: p.pid, canh: canh.pid, cha: process.pid, dir, luc: new Date().toISOString() }));
  const base = ws.replace(/^ws:\/\/([^/]+).*/, "http://$1");
  return {
    async trang(rong, cao) {
      const t = await (await fetch(`${base}/json/new?about:blank`, { method: "PUT" })).json();
      return moTrang(t.webSocketDebuggerUrl, rong, cao);
    },
    /** Tắt Chrome: SIGTERM cho nhóm, tối đa 2 giây rồi SIGKILL; xoá hồ sơ tạm và dòng sổ. Không cần await. */
    dong() {
      if (xong) return Promise.resolve();
      if (!conChay()) {
        c.tatNgay();
        return Promise.resolve();
      }
      gietNhom(p.pid, "SIGTERM");
      return new Promise((res) => {
        const het = setTimeout(() => {
          c.tatNgay();
          res();
        }, 2000);
        het.unref();
        p.once("exit", () => {
          clearTimeout(het);
          c.tatNgay();
          res();
        });
      });
    },
  };
}

async function moTrang(wsUrl, rong, cao) {
  const ws = new WebSocket(wsUrl);
  await new Promise((r) => ws.addEventListener("open", r, { once: true }));
  let id = 0;
  const cho = new Map();
  ws.addEventListener("message", (e) => {
    const m = JSON.parse(String(e.data));
    if (m.id && cho.has(m.id)) {
      const { res, rej } = cho.get(m.id);
      cho.delete(m.id);
      if (m.error) rej(new Error(`${m.error.message}`));
      else res(m.result);
    }
  });
  const gui = (method, params = {}) =>
    new Promise((res, rej) => {
      const i = ++id;
      cho.set(i, { res, rej });
      ws.send(JSON.stringify({ id: i, method, params }));
    });
  await gui("Page.enable");
  await gui("Runtime.enable");
  await gui("Network.enable");
  await gui("Emulation.setDeviceMetricsOverride", { width: rong, height: cao, deviceScaleFactor: 1, mobile: rong < 768 });
  const tinh = async (expr) => {
    const r = await gui("Runtime.evaluate", { expression: expr, awaitPromise: true, returnByValue: true });
    if (r.exceptionDetails) throw new Error(`lỗi trong trang: ${r.exceptionDetails.exception?.description ?? r.exceptionDetails.text}`);
    return r.result.value;
  };
  return {
    gui,
    tinh,
    async datCookie(cookies) {
      for (const c of cookies) {
        const [name, ...v] = c.split("=");
        await gui("Network.setCookie", { name, value: v.join("="), url: URL_GOC });
      }
    },
    async di(duong) {
      await gui("Page.navigate", { url: `${URL_GOC}${duong}` });
    },
    /** Chờ một biểu thức trong trang trả thật. */
    async cho(expr, hanMs = 30000) {
      const dau = Date.now();
      while (Date.now() - dau < hanMs) {
        try {
          if (await tinh(expr)) return;
        } catch {
          // trang đang chuyển
        }
        await ngu(200);
      }
      throw new Error(`hết giờ chờ: ${expr}`);
    },
    async chup() {
      return Buffer.from((await gui("Page.captureScreenshot", { format: "png" })).data, "base64");
    },
    dong() {
      ws.close();
    },
  };
}
