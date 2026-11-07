// Bản sao cdp.mjs của bang-hang-kieu-sheet cho bàn đo riêng của dãy D (va-bang-hang-e11-hieu-nang, giám sát duyệt 07/11):
// dev 3585, phiên và nhật ký ở .acceptance-runs/va-bang-hang-e11-hieu-nang — không dùng tài nguyên dãy B.
// Trình duyệt không đầu tối giản cho hồ sơ bang-hang-kieu-sheet: Chrome có sẵn trên máy + DevTools Protocol qua
// WebSocket của Node — kho không có playwright ở main (ADR-0004 đo trên nhánh thử). Dùng cho chụp đối chiếu và máy đo
// cuộn (E11). Đăng nhập lấy phiên bằng mã đọc ở nhật ký máy chủ dev của dung-b.mjs.
import { spawn } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const GOC = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");
// Bản dev của dãy B ở 3481 (luật đợt 7); máy đo cuộn đặt QH_B_URL tới bản build ở 3491 (giám sát cấp, yêu cầu B-6).
export const URL_GOC = process.env.QH_D_URL ?? "http://localhost:3585";
const LOG = path.join(GOC, ".acceptance-runs/va-bang-hang-e11-hieu-nang/web-d.log");
const CHROME = process.env.CHROME_PATH ?? "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const ngu = (ms) => new Promise((r) => setTimeout(r, ms));

/**
 * Phiên đăng nhập của một người mẫu: cookie dạng «tên=giá trị» từng cái. Giữ phiên ở .acceptance-runs và dùng lại khi
 * còn sống — mỗi email chỉ xin được 5 mã trong 15 phút (ADR-0005).
 */
export async function cookieCua(email, { chiPhienGiu = false } = {}) {
  const giu = path.join(GOC, `.acceptance-runs/va-bang-hang-e11-hieu-nang/phien-${email}.json`);
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

export async function moChrome() {
  const dir = mkdtempSync(path.join(tmpdir(), "qh-b-chrome-"));
  const p = spawn(CHROME, ["--headless=new", "--remote-debugging-port=0", `--user-data-dir=${dir}`, "--no-first-run", "--hide-scrollbars", "about:blank"], {
    stdio: ["ignore", "ignore", "pipe"],
  });
  const ws = await new Promise((res, rej) => {
    let buf = "";
    p.stderr.on("data", (d) => {
      buf += d;
      const m = /DevTools listening on (ws:\/\/\S+)/.exec(buf);
      if (m) res(m[1]);
    });
    p.on("exit", () => rej(new Error("Chrome thoát trước khi mở cổng gỡ lỗi")));
  });
  const base = ws.replace(/^ws:\/\/([^/]+).*/, "http://$1");
  return {
    async trang(rong, cao) {
      const t = await (await fetch(`${base}/json/new?about:blank`, { method: "PUT" })).json();
      return moTrang(t.webSocketDebuggerUrl, rong, cao);
    },
    dong() {
      p.kill();
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
