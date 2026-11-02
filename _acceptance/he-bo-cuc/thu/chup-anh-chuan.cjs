// Chụp ảnh chuẩn của hệ bố cục và ảnh trang ba lối từ trang mẫu sống (hàng 91). Cần máy dev ở cổng 3484 và playwright:
// PW=<thư mục node_modules/playwright> node _acceptance/he-bo-cuc/thu/chup-anh-chuan.cjs [lọc theo tên tệp]
// Ghi design/anh-chuan/<bố cục>-<khổ>.png (21 sáng), <bố cục>-1440-toi.png (7 tối), ke.json; và ba-loi/<ô>/<lối>-<khổ>.png.
const { chromium } = require(process.env.PW);
const path = require("path");
const fs = require("fs");
const ROOT = process.cwd();
const B = "http://localhost:3484/mau/he-bo-cuc/xem";
const CAO = { 1440: 900, 1024: 768, 375: 812 };
const BO_CUC = ["tran", "danh-sach-chi-tiet", "doc", "ho-so", "bang-dieu-khien", "luong-nhieu-buoc", "dong-tin"];
const viec = [];
const BL = "_acceptance/he-bo-cuc/ba-loi";
for (const loi of ["trong-kho", "reui", "ve-moi"]) for (const kho of [1440, 375]) {
  viec.push({ url: `${B}?bo-cuc=tran&trang-thai=mac-dinh&menu-tao=${loi}`, kho, tep: `${BL}/menu-tao/${loi}-${kho}.png`, mo: kho === 1440 ? (loi === "reui" ? 'button[aria-label="Việc tạo khác"]' : loi === "ve-moi" ? 'header button:has-text("Tạo")' : null) : null });
  viec.push({ url: `${B}?bo-cuc=doc&trang-thai=mac-dinh&dau-man=${loi}`, kho, tep: `${BL}/dau-man/${loi}-${kho}.png` });
}
for (const kho of [1440, 375]) viec.push({ url: `${B}?bo-cuc=bang-dieu-khien&trang-thai=mac-dinh`, kho, tep: `${BL}/bo-cuc-moi/reui-${kho}.png` });
for (const b of BO_CUC) for (const kho of [1440, 1024, 375]) viec.push({ url: `${B}?bo-cuc=${b}&trang-thai=mac-dinh`, kho, tep: `design/anh-chuan/${b}-${kho}.png` });
for (const b of BO_CUC) viec.push({ url: `${B}?bo-cuc=${b}&trang-thai=mac-dinh`, kho: 1440, toi: true, tep: `design/anh-chuan/${b}-1440-toi.png` });
if (process.argv[2]) viec.splice(0, viec.length, ...viec.filter((v) => v.tep.includes(process.argv[2])));
(async () => {
  const br = await chromium.launch({ channel: "chrome" });
  for (const v of viec) {
    const ctx = await br.newContext({ viewport: { width: v.kho, height: CAO[v.kho] }, deviceScaleFactor: 1, colorScheme: v.toi ? "dark" : "light" });
    const p = await ctx.newPage();
    await p.goto(v.url, { waitUntil: "networkidle" });
    await p.addStyleTag({ content: "nextjs-portal{display:none!important}" });
    if (v.mo) { await p.click(v.mo); await p.waitForTimeout(400); }
    await p.waitForTimeout(300);
    fs.mkdirSync(path.dirname(v.tep), { recursive: true });
    await p.screenshot({ path: v.tep });
    const sw = await p.evaluate(() => document.documentElement.scrollWidth);
    console.log(v.tep, sw > v.kho ? `CUỘN NGANG ${sw}` : "");
    await ctx.close();
  }
  await br.close();
  const sha = require('child_process').execSync('git rev-parse HEAD').toString().trim();
  const ke = viec.filter((v) => v.tep.startsWith('design/anh-chuan/')).map((v) => ({ tep: v.tep.replace('design/anh-chuan/', ''), dia_chi: v.url.replace('http://localhost:3484', ''), kho: v.kho, giao_dien: v.toi ? 'toi' : 'sang', commit: sha }));
  if (ke.length === 28) fs.writeFileSync('design/anh-chuan/ke.json', JSON.stringify(ke, null, 2) + '\n');
})().catch((e) => { console.error(e); process.exit(1); });
