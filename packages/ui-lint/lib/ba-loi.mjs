// Trang ba lối của ADR-0019 (hồ sơ the-ba-loi, hàng 84): ô chưa có khuôn thì Cổng Phạm vi duyệt trên trang so ba lối —
// Trong kho · ReUI · Vẽ mới — cùng khổ, lời khuyên ghim đầu trang. Lõi chung của doi-chieu.mjs và kiem-chuan.mjs.
import { execFileSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { docBang } from "../kiem-chuan.mjs";

/** Ba lối, thứ tự cố định trên trang. */
export const LOI = [
  { ma: "trong-kho", nhan: "Trong kho" },
  { ma: "reui", nhan: "ReUI" },
  { ma: "ve-moi", nhan: "Vẽ mới" },
];
/** Khổ máy tính và điện thoại — cùng KHO của bộ đối chiếu. */
export const KHO_BA_LOI = [1440, 375];
const MA = LOI.map((l) => l.ma);
const nhanCua = (ma) => LOI.find((l) => l.ma === ma)?.nhan ?? ma;

export const tenAnhBaLoi = (loi, kho) => `${loi}-${kho}.png`;

/** Khung `ba-loi.json` chưa điền: mọi ô là chuỗi rỗng, để người điền đúng khoá có sẵn. */
export function khungBaLoi() {
  return {
    man: "",
    khuyen: { loi: "", ly_do: "" },
    loi: Object.fromEntries(MA.map((m) => [m, { nhan: "", dong_co: "", danh_doi: "" }])),
  };
}

/** Bề rộng PNG đọc từ IHDR; không phải PNG → null. */
export function rongPng(buf) {
  if (buf.length < 24 || buf.readUInt32BE(0) !== 0x89504e47 || buf.toString("latin1", 12, 16) !== "IHDR") return null;
  return buf.readUInt32BE(16);
}

export class LoiDoc extends Error {}

const chu = (v) => (typeof v === "string" ? v.trim() : "");

/**
 * Kiểm `ba-loi.json` và ảnh trong thư mục `ba-loi/`. Trả mảng dòng lỗi gọi tên lối (hay «lời khuyên», «màn»).
 * JSON vắng hay hỏng → ném LoiDoc.
 */
export function kiemBaLoi(thuMuc) {
  const p = join(thuMuc, "ba-loi.json");
  if (!existsSync(p)) throw new LoiDoc(`ba lối: không có ${p} — chạy --ba-loi trước`);
  let du;
  try {
    du = JSON.parse(readFileSync(p, "utf8"));
  } catch (e) {
    throw new LoiDoc(`ba lối: không đọc được ${p} — ${e.message}`);
  }
  if (!du || typeof du !== "object") throw new LoiDoc(`ba lối: ${p} không phải đối tượng JSON`);
  const loi = [];
  if (!chu(du.man)) loi.push("ba lối «màn»: thiếu tên màn");
  const khongCo = new Set();
  for (const m of MA) {
    const o = du.loi?.[m];
    const ten = `ba lối «${m}»`;
    if (!o || typeof o !== "object") {
      loi.push(`${ten}: thiếu lối — ghi ứng viên hay {"khong_co": true, "da_tra": "…"}`);
      continue;
    }
    if (o.khong_co === true) {
      khongCo.add(m);
      if (!chu(o.da_tra)) loi.push(`${ten}: khai không có mà thiếu điều đã tra`);
      continue;
    }
    const thieu = [["nhan", "nhãn"], ["dong_co", "câu động cơ"], ["danh_doi", "câu đánh đổi"]].filter(([k]) => !chu(o[k])).map(([, n]) => n);
    if (thieu.length === 3) {
      loi.push(`${ten}: không có ứng viên mà cũng không khai không có`);
      continue;
    }
    for (const n of thieu) loi.push(`${ten}: thiếu ${n}`);
    for (const kho of KHO_BA_LOI) {
      const anh = tenAnhBaLoi(m, kho);
      const f = join(thuMuc, anh);
      if (!existsSync(f)) {
        loi.push(`${ten}: thiếu ảnh ${anh}`);
        continue;
      }
      const rong = rongPng(readFileSync(f));
      if (rong === null) loi.push(`${ten}: ảnh ${anh} không phải PNG`);
      else if (rong !== kho) loi.push(`${ten}: ảnh ${anh} rộng ${rong}, khác khổ ${kho}`);
    }
  }
  const k = du.khuyen ?? {};
  if (!MA.includes(k.loi)) loi.push(`ba lối «lời khuyên»: lối «${k.loi ?? ""}» không phải một trong ${MA.join(", ")}`);
  else if (khongCo.has(k.loi)) loi.push(`ba lối «lời khuyên»: trỏ lối «${k.loi}» đã khai không có`);
  if (!chu(k.ly_do)) loi.push("ba lối «lời khuyên»: thiếu lý do");
  return { loi, du };
}

const cam = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);

/** HTML tự chứa của trang ba lối, tất định theo đầu vào. Gọi sau kiemBaLoi không lỗi. */
export function dungTrangBaLoi(du, thuMuc) {
  const kh = du.khuyen.loi;
  const cot = LOI.map(({ ma, nhan }) => {
    const o = du.loi[ma];
    if (o.khong_co === true)
      return `<section data-loi="${ma}"><h2>${cam(nhan)}</h2>
<p class="khong-co">không có</p><p class="da-tra">Đã tra: ${cam(o.da_tra)}</p></section>`;
    const anh = KHO_BA_LOI.map((kho) => {
      const src = `data:image/png;base64,${readFileSync(join(thuMuc, tenAnhBaLoi(ma, kho))).toString("base64")}`;
      return `<img src="${src}" width="${kho}" alt="${cam(nhan)}, khổ ${kho}">`;
    }).join("");
    return `<section data-loi="${ma}"${ma === kh ? ' class="chon"' : ""}><h2>${cam(nhan)}${ma === kh ? " · khuyên" : ""}</h2>
<span class="nhan">${cam(o.nhan)}</span>
<div class="anh">${anh}</div>
<dl><dt>Động cơ</dt><dd>${cam(o.dong_co)}</dd><dt>Đánh đổi</dt><dd>${cam(o.danh_doi)}</dd></dl></section>`;
  });
  return `<!doctype html>
<html lang="vi"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Ba lối · ${cam(du.man)}</title>
<style>
:root{--nen:#fafafa;--chu:#171717;--mo:#525252;--vien:#e5e5e5;--the:#fff;--ghim:#ecfdf5;--ghim-vien:#059669}
@media (prefers-color-scheme:dark){:root{--nen:#0a0a0a;--chu:#fafafa;--mo:#a3a3a3;--vien:#262626;--the:#171717;--ghim:#052e1c;--ghim-vien:#34d399}}
body{margin:0;padding:24px 16px;background:var(--nen);color:var(--chu);font:15px/1.5 system-ui,sans-serif}
main{max-width:1500px;margin:0 auto;display:flex;flex-direction:column;gap:20px}
h1{font-size:22px;margin:0}p{margin:0}
.khuyen{border:1px solid var(--ghim-vien);background:var(--ghim);border-radius:10px;padding:12px 14px}
.luoi{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:16px}
@media (max-width:900px){.luoi{grid-template-columns:1fr}}
section{background:var(--the);border:1px solid var(--vien);border-radius:10px;padding:14px;display:flex;flex-direction:column;gap:10px;min-width:0}
section.chon{border-color:var(--ghim-vien);box-shadow:0 0 0 2px var(--ghim-vien)}
h2{font-size:17px;margin:0}.nhan,.da-tra{font-size:13px;color:var(--mo)}
.khong-co{font-weight:600}
.anh{display:grid;grid-template-columns:3fr 1fr;gap:8px;align-items:start}
img{width:100%;height:auto;border:1px solid var(--vien);border-radius:6px;display:block}
dl{margin:0;display:grid;grid-template-columns:5.5rem 1fr;gap:4px 8px;font-size:14px}dt{color:var(--mo)}dd{margin:0}
</style></head><body><main>
<h1>${cam(du.man)} — ba lối</h1>
<div class="khuyen" data-khuyen="${kh}"><strong>Máy khuyên: ${cam(nhanCua(kh))}.</strong> ${cam(du.khuyen.ly_do)}</div>
<div class="luoi">
${cot.join("\n")}
</div>
</main></body></html>
`;
}

// ——— Nhận ô chưa có khuôn (ADR-0019 quyết định 2) ———

const VO_VA_IA = "docs/design/vo-va-ia.md";
const MUC_KHOI_DICH = "## 2. Bản đồ màn";
const MUC_CHO_HO = "## 3. Chỗ hở";

function gitDoc(root, ref, tep) {
  try {
    return execFileSync("git", ["-C", root, "show", `${ref}:${tep}`], { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] });
  } catch {
    return null;
  }
}
function nhomCua(root, ref) {
  if (ref === null) {
    const d = join(root, "design/patterns");
    return existsSync(d) ? readdirSync(d).filter((f) => f.endsWith(".md")) : [];
  }
  const out = execFileSync("git", ["-C", root, "ls-tree", "--name-only", `${ref}:design/patterns`], { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] });
  return out.split("\n").filter((f) => f.endsWith(".md"));
}
const docDau = (root, den, tep) => (den === null ? (existsSync(join(root, tep)) ? readFileSync(join(root, tep), "utf8") : null) : gitDoc(root, den, tep));

/** Bảng khối đích §2: Màn → ô Khối đích. */
function khoiDich(md) {
  const b = md && docBang(md, MUC_KHOI_DICH);
  if (!b) return new Map();
  const iMan = b.dau.indexOf("Màn");
  const iKhoi = b.dau.indexOf("Khối đích");
  return iMan < 0 || iKhoi < 0 ? new Map() : new Map(b.dong.map((d) => [d[iMan], d[iKhoi]]));
}
/** Tên «Chỗ» của bảng §3. */
function choHo(md) {
  const b = md && docBang(md, MUC_CHO_HO);
  if (!b) return new Set();
  const i = b.dau.indexOf("Chỗ");
  return new Set(i < 0 ? [] : b.dong.map((d) => d[i]));
}

/** Kiểm ref tồn tại; không → ném LoiDoc gọi tên. */
function kiemRef(root, ref) {
  try {
    execFileSync("git", ["-C", root, "rev-parse", "--verify", "-q", `${ref}^{commit}`], { stdio: "ignore" });
  } catch {
    throw new LoiDoc(`ba lối: không có commit «${ref}»`);
  }
}

/**
 * Điều làm vòng chạm ô chưa có khuôn, so `base` với `den` (null = cây làm việc):
 * nhóm mới ở design/patterns · đổi ô Khối đích của một màn §2 · dòng «Chỗ hở» mới §3.
 */
export function oChuaCoKhuon(root, base, den = null) {
  kiemRef(root, base);
  if (den !== null) kiemRef(root, den);
  const dieu = [];
  const cu = new Set(nhomCua(root, base));
  for (const f of nhomCua(root, den).sort()) if (!cu.has(f)) dieu.push({ loai: "nhóm mới", ten: f.replace(/\.md$/, "") });
  const mdCu = gitDoc(root, base, VO_VA_IA);
  const mdMoi = docDau(root, den, VO_VA_IA);
  const kdCu = khoiDich(mdCu);
  for (const [man, khoi] of khoiDich(mdMoi)) if (kdCu.has(man) && kdCu.get(man) !== khoi) dieu.push({ loai: "đổi khối đích", ten: man });
  const chCu = choHo(mdCu);
  for (const cho of choHo(mdMoi)) if (!chCu.has(cho)) dieu.push({ loai: "chỗ hở mới", ten: cho });
  return dieu;
}

/** Khoá `divergence:` trong frontmatter design-pass.md; vắng tệp → null. */
export function divergenceCua(root, slug) {
  const p = join(root, "_acceptance", slug, "design-pass.md");
  if (!existsSync(p)) return null;
  const m = /^divergence:\s*(.*)$/m.exec(readFileSync(p, "utf8"));
  return m ? m[1].trim() : "";
}

/** Trang ba lối của hồ sơ: lỗi kiểm + so bản dựng lại (khi `soLai`). */
export function kiemTrangHoSo(root, slug, { soLai = true } = {}) {
  const thuMuc = join(root, "_acceptance", slug, "ba-loi");
  const loi = [];
  let kq;
  try {
    kq = kiemBaLoi(thuMuc);
  } catch (e) {
    if (e instanceof LoiDoc) return [e.message];
    throw e;
  }
  loi.push(...kq.loi);
  if (loi.length) return loi;
  const trang = join(thuMuc, "index.html");
  if (!existsSync(trang)) return [`ba lối: thiếu ${slug}/ba-loi/index.html — chạy --dung-ba-loi`];
  if (soLai && readFileSync(trang, "utf8") !== dungTrangBaLoi(kq.du, thuMuc))
    loi.push(`ba lối: ${slug}/ba-loi/index.html khác bản dựng lại từ ba-loi.json — chạy lại --dung-ba-loi, không sửa tay`);
  return loi;
}

/** Bài chấm của vòng: có ô chưa có khuôn thì bước phân kỳ phải mở và trang ba lối phải hợp lệ. */
export function kiemVongBaLoi(root, slug, base, den = null) {
  const dieu = oChuaCoKhuon(root, base, den);
  if (!dieu.length) return { dieu, loi: [] };
  const loi = [];
  const dv = divergenceCua(root, slug);
  if (dv === null) loi.push(`ba lối: thiếu _acceptance/${slug}/design-pass.md — ô chưa có khuôn phải mở bước phân kỳ`);
  else if (!/^opened\b/.test(dv)) loi.push(`ba lối: design-pass.md ghi divergence: ${dv || "(trống)"} — ô chưa có khuôn phải là opened, không skipped`);
  loi.push(...kiemTrangHoSo(root, slug));
  return { dieu, loi };
}
