// Chụp ảnh theo kế hoạch đối chiếu (packages/ui-lint/doi-chieu.mjs --base … --slug bang-hang-kieu-sheet) và vài ảnh
// thêm cho sổ design-pass (tối, nhóm, góc nhìn). Cần dung-b.mjs đã chạy.
//   node _acceptance/bang-hang-kieu-sheet/thu/chup-doi-chieu.mjs
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { GOC, cookieCua, moChrome } from "./cdp.mjs";

const HS = path.join(GOC, "_acceptance/bang-hang-kieu-sheet");
const KH = JSON.parse(readFileSync(path.join(HS, "doi-chieu/ke-hoach.json"), "utf8"));
const DP = path.join(HS, "evidence/design-pass");
mkdirSync(DP, { recursive: true });

const cookie = await cookieCua("dau-chu-1@mau.quy-hang.test");
const chrome = await moChrome();
const ID_GN = "chup-2pn-duoi-5-ty";

const COT_MAC_DINH = [
  "buildingName", "unitNumber", "unitType", "livingArea", "floor", "directionFaces", "standardStatus", "listPrice",
  "feeInclusion", "furnished", "legalStatus", "financing", "occupantType", "confirmedAgeDays", "completeness", "visibility",
];

async function trang(rong, cao, toi = false) {
  const t = await chrome.trang(rong, cao);
  await t.datCookie(cookie);
  if (toi) await t.gui("Emulation.setEmulatedMedia", { features: [{ name: "prefers-color-scheme", value: "dark" }] });
  // Một góc nhìn mẫu trên máy cho trang /inventory/views/<id>.
  await t.di("/inventory");
  await t.cho("document.readyState === 'complete'");
  await t.tinh(`(async () => {
    const me = await (await fetch('/api/v1/me')).json();
    localStorage.setItem('qh:goc-nhin:v1:' + me.user.id + ':' + me.activeCompany.id, JSON.stringify({ v: 1, ds: [{
      id: '${ID_GN}', ten: '2PN dưới 5 tỷ', luc: '2026-10-31T00:00:00Z',
      loc: { unitType: '2PN', listPrice: '<=5' }, cot: ${JSON.stringify(COT_MAC_DINH)}, sap: [{ id: 'listPrice', desc: false }], nhom: 'toa' }] }));
    return true;
  })()`);
  return t;
}

const SAN_SANG = "document.querySelector('[data-slot=data-grid-table], table') !== null || document.body.innerText.includes('dựng ở mục 32') || document.body.innerText.includes('không có trên máy')";

async function datTrangThai(t, tt, rong) {
  if (tt !== "loc-rong" || rong < 768) return;
  // Góc nhìn có ô lọc thì hàng lọc đã mở sẵn — chỉ bấm «Lọc» khi chưa có ô.
  await t.tinh(`!!(document.querySelector('input[aria-label="Lọc Mã căn theo chữ"]') || [...document.querySelectorAll('button')].find((b) => b.textContent.trim().startsWith('Lọc'))?.click() || true)`);
  await t.cho(`!!document.querySelector('input[aria-label="Lọc Mã căn theo chữ"]')`);
  await t.tinh(`document.querySelector('input[aria-label="Lọc Mã căn theo chữ"]').focus() ?? true`);
  await t.gui("Input.insertText", { text: "zzz" });
  await t.cho(`document.body.innerText.includes('Không căn nào khớp')`);
}

async function chup(duong, tt, rong, tep, toi = false) {
  const t = await trang(rong, 900, toi);
  await t.di(duong);
  await t.cho(SAN_SANG);
  await new Promise((r) => setTimeout(r, 800));
  await datTrangThai(t, tt, rong);
  await new Promise((r) => setTimeout(r, 300));
  writeFileSync(tep, await t.chup());
  console.log(`chụp ${path.relative(GOC, tep)}`);
  t.dong();
}

try {
  for (const c of KH.cap) {
    const duongMoi = c.tep_moi?.includes("views") ? `/inventory/views/${ID_GN}` : "/inventory";
    if (c.anh_moi) await chup(duongMoi, c.trang_thai, c.kho, path.join(HS, "doi-chieu", c.anh_moi));
    if (c.anh_mau) await chup(c.mau.duong, c.trang_thai, c.kho, path.join(HS, "doi-chieu", c.anh_mau));
  }
  await chup("/inventory", "mac-dinh", 1440, path.join(DP, "bang--1440--toi.png"), true);
  await chup(`/inventory/views/${ID_GN}`, "mac-dinh", 1440, path.join(DP, "goc-nhin--1440--sang.png"));
  await chup("/inventory/views/khong-co", "mac-dinh", 1440, path.join(DP, "goc-nhin-khong-co--1440--sang.png"));
} finally {
  chrome.dong();
}
