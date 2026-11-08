// Phép nhìn màn hàng chu-san-du-vai trên chỗ thử dãy Q. Mỗi ca in một dòng JSON và chụp ảnh vào --ra. Chrome không đầu qua CDP
// của hồ sơ bang-hang-kieu-sheet.
//   node _acceptance/chu-san-du-vai/thu/chay-ui.mjs --e3 --e5b --ra <thư mục>
import { spawnSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";

const URL_GOC = "http://localhost:3497";
process.env.QH_B_URL = URL_GOC;
const { moChrome } = await import("../../bang-hang-kieu-sheet/thu/cdp.mjs");
const GOC = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");
const arg = (k) => process.argv.includes(k);
const iRa = process.argv.indexOf("--ra");
const RA = path.resolve(GOC, iRa > 0 ? process.argv[iRa + 1] : ".acceptance-runs/chu-san-du-vai/evidence");
mkdirSync(RA, { recursive: true });
const dung = spawnSync(process.execPath, [path.join(path.dirname(fileURLToPath(import.meta.url)), "dung-q.mjs")], { cwd: GOC, stdio: ["ignore", 2, 2] });
if (dung.status !== 0) throw new Error(`dựng chỗ thử hỏng (dung-q.mjs thoát ${dung.status})`);
const phien = JSON.parse(readFileSync(path.join(GOC, ".acceptance-runs/chu-san-du-vai/phien.json"), "utf8"));
const ngu = (ms) => new Promise((r) => setTimeout(r, ms));
const in1 = (o) => console.log(JSON.stringify(o));
const db = new pg.Client({ connectionString: "postgres://postgres:quyhang@localhost:5577/postgres" });
await db.connect();
const VAI = ["Telesales", "Đầu chủ", "Đầu khách", "Trưởng nhóm", "Quản trị sàn"];
const chrome = await moChrome();

async function mo(ai, duong, cho, w = 1440, hgt = 900) {
  const t = await chrome.trang(w, hgt);
  for (const c of phien.cookie[ai].split(";").map((s) => s.trim()).filter(Boolean)) {
    const [name, ...v] = c.split("=");
    await t.gui("Network.setCookie", { name, value: v.join("="), url: URL_GOC });
  }
  await t.gui("Page.navigate", { url: `${URL_GOC}${duong}` });
  await t.cho(`document.readyState === "complete" && ${cho}`, 180000);
  await t.tinh(`(() => { const s = document.createElement("style"); s.textContent = "nextjs-portal{display:none!important}"; document.head.appendChild(s); return true; })()`);
  await ngu(800);
  return t;
}
const chup = async (t, ten) => writeFileSync(path.join(RA, `${ten}.png`), await t.chup());
const J = JSON.stringify;
const bamNut = (t, chu, goc = "document") => t.tinh(`(() => { const b = [...${goc}.querySelectorAll("button")].find((x) => x.textContent.trim() === ${J(chu)}); if (!b) return false; b.click(); return true; })()`);
const bamOVai = (t, nhan) => t.tinh(`(() => { const b = document.querySelector('[role=checkbox][aria-label=${J(nhan)}]'); if (!b) return false; b.click(); return true; })()`);
const oVai = async (t) => {
  await ngu(250);
  return t.tinh(`(() => Object.fromEntries(${J(VAI)}.map((n) => [n, document.querySelector('[role=checkbox][aria-label=' + JSON.stringify(n) + ']')?.getAttribute("aria-checked") === "true"])))()`);
};
const hop = `document.querySelector("[role=dialog]")`;
const moTa = (t) => t.tinh(`[...document.querySelectorAll("[role=dialog] [data-slot=field-description], [role=dialog] p")].map((x) => x.textContent.trim()).find((x) => x.includes("vai đi kèm")) ?? null`);
const docVai = async (email) => (await db.query(`select m.roles from company_members m join identity."user" u on u.id = m.user_id where u.email = $1 and m.company_id = $2`, [email, phien.san])).rows[0]?.roles?.slice().sort() ?? null;
const dongNguoi = (t, email) => t.tinh(`(() => { const e = [...document.querySelectorAll("[data-slot=item]")].find((x) => x.textContent.includes(${J(email)})); return e ? e.textContent.trim() : null; })()`);
const moSua = (t, email) => t.tinh(`(() => { const e = [...document.querySelectorAll("[data-slot=item]")].find((x) => x.textContent.includes(${J(email)})); if (!e) return false; const b = [...e.querySelectorAll("button")].find((x) => (x.getAttribute("aria-label") ?? x.textContent).includes("Sửa")); if (!b) return false; b.click(); return true; })()`);

async function themNguoi(email, roles) {
  const u = (await db.query(`insert into identity."user" (id, name, email, "emailVerified") values (gen_random_uuid()::text, $1, $1, true) returning id`, [email])).rows[0].id;
  await db.query("insert into company_members (company_id, user_id, roles) values ($1, $2, $3)", [phien.san, u, roles]);
}

try {
  if (arg("--e3")) {
    const NHAN = phien.nhan;
    const moiEmail = `moi-${NHAN}@example.test`;
    const ts = `chi-ts-${NHAN}@example.test`;
    const du = `du-nam-${NHAN}@example.test`;
    await themNguoi(ts, ["telesales"]);
    await themNguoi(du, ["telesales", "listing_agent", "buyer_agent", "team_lead", "company_admin"]);
    const t = await mo("quan-tri", "/settings/users", `!![...document.querySelectorAll("button")].find((x) => x.textContent.trim() === "Mời người")`);
    await bamNut(t, "Mời người");
    await t.cho(`!!${hop}`, 30000);
    await ngu(500);
    in1({ ca: "ST-hopvai-chua-tich", o: await oVai(t), moTa: await moTa(t) });
    await chup(t, "E3-chua-tich-1440");
    await bamOVai(t, "Quản trị sàn");
    in1({ ca: "ST-hopvai-tich-san", o: await oVai(t) });
    await chup(t, "E3-tich-san-1440");
    await bamOVai(t, "Telesales");
    in1({ ca: "ST-hopvai-go-bot", o: await oVai(t) });
    await chup(t, "E3-go-bot-1440");
    await t.tinh(`(() => { const i = document.querySelector("#moi-email"); const set = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value").set; set.call(i, ${J(moiEmail)}); i.dispatchEvent(new Event("input", { bubbles: true })); return true; })()`);
    await ngu(200);
    await bamNut(t, "Mời", hop);
    await t.cho(`!${hop}`, 30000);
    await t.cho(`[...document.querySelectorAll("[data-slot=item]")].some((x) => x.textContent.includes(${J(moiEmail)}))`, 30000);
    await ngu(500);
    in1({ ca: "moi-luu", db: await docVai(moiEmail), dong: await dongNguoi(t, moiEmail) });
    await chup(t, "E3-moi-luu-1440");

    await t.gui("Page.reload");
    await t.cho(`document.readyState === "complete" && [...document.querySelectorAll("[data-slot=item]")].some((x) => x.textContent.includes(${J(ts)}))`, 60000);
    await ngu(800);
    await moSua(t, ts);
    await t.cho(`!!${hop}`, 30000);
    await ngu(400);
    const moHop = await oVai(t);
    await bamOVai(t, "Trưởng nhóm");
    const sauTich = await oVai(t);
    await chup(t, "E3-sua-tich-1440");
    await bamNut(t, "Lưu", hop);
    await t.cho(`!${hop}`, 30000);
    await ngu(800);
    in1({ ca: "sua-them", moHop, sauTich, db: await docVai(ts), dong: await dongNguoi(t, ts) });

    await t.gui("Page.reload");
    await t.cho(`document.readyState === "complete" && [...document.querySelectorAll("[data-slot=item]")].some((x) => x.textContent.includes(${J(du)}))`, 60000);
    await ngu(800);
    await moSua(t, du);
    await t.cho(`!!${hop}`, 30000);
    await ngu(400);
    for (const v of ["Telesales", "Đầu chủ", "Đầu khách", "Trưởng nhóm"]) await bamOVai(t, v);
    const sauGo = await oVai(t);
    await chup(t, "E3-sua-go-bot-1440");
    await bamNut(t, "Lưu", hop);
    await t.cho(`!${hop}`, 30000);
    await ngu(800);
    in1({ ca: "sua-go-bot", sauGo, db: await docVai(du), dong: await dongNguoi(t, du) });
    await chup(t, "E3-danh-sach-1440");
    t.dong();

    const dt = await mo("quan-tri", "/settings/users", `!![...document.querySelectorAll("button")].find((x) => x.textContent.trim() === "Mời người")`, 375, 812);
    await bamNut(dt, "Mời người");
    await dt.cho(`!!${hop}`, 30000);
    await ngu(500);
    await bamOVai(dt, "Quản trị sàn");
    const trongKhung = await dt.tinh(`(() => { const r = ${hop}.getBoundingClientRect(); return r.left >= 0 && r.right <= window.innerWidth; })()`);
    in1({ ca: "kho-375", o: await oVai(dt), trongKhung });
    await chup(dt, "E3-tich-san-375");
    dt.dong();
  }
  if (arg("--e5b")) {
    const nhaCua = (t) => t.tinh(`[...document.querySelectorAll("[data-sidebar=menu-button], a[href]")].map((a) => a.getAttribute("href")).filter((h) => h && /^\\/(today|inventory|shares|contacts|team|settings)/.test(h)).map((h) => h.split(/[/?]/)[1]).filter((v, i, a) => a.indexOf(v) === i)`);
    const nutTao = (t) => t.tinh(`document.body.innerText`);
    const t = await mo("dau-tien", "/today", `!!document.querySelector("[data-slot=sidebar-inset]")`);
    await ngu(1500);
    in1({ ca: "dau-tien-nha", nha: await nhaCua(t), url: await t.tinh("location.pathname") });
    await chup(t, "E5b-dau-tien-1440");
    const nut = await t.tinh(`(() => { const r = document.querySelector('[aria-label="Việc tạo khác"]').getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; })()`);
    await t.gui("Input.dispatchMouseEvent", { type: "mouseMoved", x: nut.x, y: nut.y });
    await t.gui("Input.dispatchMouseEvent", { type: "mousePressed", x: nut.x, y: nut.y, button: "left", buttons: 1, clickCount: 1 });
    await t.gui("Input.dispatchMouseEvent", { type: "mouseReleased", x: nut.x, y: nut.y, button: "left", buttons: 0, clickCount: 1 });
    await ngu(800);
    const chu = await nutTao(t);
    in1({ ca: "dau-tien-nut", lead: chu.includes("Lead"), nhap: chu.includes("Nhập Excel"), xuat: chu.includes("Xuất") });
    await chup(t, "E5b-menu-tao-1440");
    t.dong();
    const bang = await mo("dau-tien", "/inventory", `!!document.querySelector("[data-slot=sidebar-inset]")`);
    await ngu(1500);
    in1({ ca: "dau-tien-bang-hang", url: await bang.tinh("location.pathname"), bao404: (await bang.tinh("document.body.innerText")).includes("404") });
    await chup(bang, "E5b-bang-hang-1440");
    bang.dong();
    const qt = await mo("quan-tri", "/settings/users", `!!document.querySelector("[data-slot=sidebar-inset]")`);
    await ngu(1200);
    in1({ ca: "chi-cau-hinh-nha", nha: await nhaCua(qt) });
    await chup(qt, "E5b-chi-cau-hinh-1440");
    qt.dong();
  }
} finally {
  chrome.dong();
  await db.end();
}
process.exit(0);
