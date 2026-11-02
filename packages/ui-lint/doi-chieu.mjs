#!/usr/bin/env node
// Đối chiếu màn mới cạnh màn mẫu của nhóm (hồ sơ vong-giao-dien-qua-ban-do, hàng 60, QK3). Lệnh không chụp: phiên
// design-pass chụp bằng trình duyệt theo kế hoạch, lệnh lập kế hoạch và ghép trang — thiếu ảnh thì đỏ.
//
//   node packages/ui-lint/doi-chieu.mjs --base <ref> --slug <slug>   kế hoạch cặp ảnh cho mọi màn vòng đổi (cả tệp mới
//                                                                     chưa theo dõi) thuộc một nhóm đơn vị màn
//   … --mau --slug <slug>                                             kế hoạch ảnh màn mẫu của mọi nhóm
//   … --dung <slug>                                                   ghép doi-chieu/index.html; thiếu ảnh → mã 1
//
// Ba lối (ADR-0019, hồ sơ the-ba-loi) — ô chưa có khuôn duyệt trên trang so Trong kho · ReUI · Vẽ mới:
//   … --ba-loi --slug <slug>        in sáu ảnh phải chụp vào _acceptance/<slug>/ba-loi/, ghi khung ba-loi.json (không đè)
//   … --dung-ba-loi <slug>          kiểm rồi ghép ba-loi/index.html; sai → mã 1, không ghi trang; json vắng → mã 2
//   … --kiem-ba-loi --base <ref> --slug <slug> [--den <ref>]
//                                   vòng chạm ô chưa có khuôn (nhóm mới · đổi khối đích · chỗ hở mới) thì design-pass
//                                   phải «divergence: opened» và trang ba lối hợp lệ — sai → mã 1
//   [--root <kho>]
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { docBanDo, nhomCuaTep } from "./lib/ban-do.mjs";
import { dungTrangBaLoi, KHO_BA_LOI, khungBaLoi, kiemBaLoi, kiemVongBaLoi, LoiDoc, LOI, tenAnhBaLoi } from "./lib/ba-loi.mjs";

/** Khổ máy tính và điện thoại mà skill quy-hang-ui buộc nhìn màn đang chạy. */
export const KHO = [1440, 375];

const args = process.argv.slice(2);
const arg = (k) => (args.includes(k) ? args[args.indexOf(k) + 1] : null);
const root = resolve(arg("--root") ?? join(dirname(fileURLToPath(import.meta.url)), "../.."));
const thuMuc = (slug) => join(root, "_acceptance", slug, "doi-chieu");
const tenAnh = (nhom, tt, kho, phia) => `${nhom}--${tt}--${kho}--${phia}.png`;
const cam = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);

function ghiKeHoach(slug, keHoach) {
  mkdirSync(thuMuc(slug), { recursive: true });
  writeFileSync(join(thuMuc(slug), "ke-hoach.json"), JSON.stringify(keHoach, null, 2) + "\n");
  for (const c of keHoach.cap)
    console.log(`${c.nhom} · ${c.trang_thai} · ${c.kho}: ${c.tep_moi ?? "(màn mẫu)"} ↔ ${c.mau.duong} → ${[c.anh_moi, c.anh_mau].filter(Boolean).join(" · ")}`);
}

function keHoachBase(ref, slug) {
  const banDo = docBanDo(root);
  for (const l of banDo.loi) console.error(l);
  if (banDo.loi.length) process.exit(1);
  const git = (...a) => execFileSync("git", ["-C", root, ...a], { encoding: "utf8" });
  const doi = [...new Set([...git("diff", "--name-only", ref).split("\n"), ...git("ls-files", "--others", "--exclude-standard").split("\n")])]
    .filter(Boolean)
    .sort();
  const cap = [];
  const daDung = new Map();
  for (const tep of doi)
    for (const g of nhomCuaTep(banDo, tep).filter((g) => g.donVi === "man")) {
      if (!existsSync(join(root, tep))) continue;
      const { nhom, mau_dang_chay: mau } = g.data;
      const n = (daDung.get(nhom) ?? 0) + 1;
      daDung.set(nhom, n);
      for (const tt of mau.trang_thai)
        for (const kho of KHO)
          cap.push({
            nhom,
            trang_thai: tt,
            kho,
            tep_moi: tep,
            mau: { tep: mau.tep, duong: mau.duong },
            anh_moi: tenAnh(nhom, tt, kho, n === 1 ? "moi" : `moi-${n}`),
            anh_mau: tenAnh(nhom, tt, kho, "mau"),
          });
    }
  if (!cap.length) {
    console.log("đối chiếu: vòng không chạm màn của nhóm nào");
    return;
  }
  ghiKeHoach(slug, { slug, base: ref, kho: KHO, cap });
}

function keHoachMau(slug) {
  const banDo = docBanDo(root);
  for (const l of banDo.loi) console.error(l);
  if (banDo.loi.length) process.exit(1);
  const cap = [];
  for (const g of banDo.nhom) {
    const { nhom, mau_dang_chay: mau } = g.data;
    for (const tt of mau.trang_thai)
      for (const kho of KHO) cap.push({ nhom, trang_thai: tt, kho, tep_moi: null, mau: { tep: mau.tep, duong: mau.duong }, anh_moi: null, anh_mau: tenAnh(nhom, tt, kho, "mau") });
  }
  ghiKeHoach(slug, { slug, base: null, kho: KHO, cap });
}

function dung(slug) {
  const p = join(thuMuc(slug), "ke-hoach.json");
  if (!existsSync(p)) {
    console.error(`đối chiếu: không có ${p} — chạy --base hay --mau trước`);
    process.exit(2);
  }
  const { cap } = JSON.parse(readFileSync(p, "utf8"));
  const thieu = [];
  const o = (ten, nhan) => {
    const f = join(thuMuc(slug), ten);
    if (!existsSync(f)) {
      thieu.push(ten);
      return `<td class="thieu">thiếu ảnh ${cam(ten)}</td>`;
    }
    const src = `data:image/png;base64,${readFileSync(f).toString("base64")}`;
    return `<td><figure><img src="${src}" width="640" alt="${cam(nhan)}"><figcaption>${cam(nhan)}</figcaption></figure></td>`;
  };
  const hang = cap.map(
    (c, i) =>
      `<tr data-cap="${i}"><th scope="row">${cam(c.nhom)}<br>${cam(c.trang_thai)} · ${c.kho}</th>` +
      (c.anh_moi ? o(c.anh_moi, `màn mới · ${c.tep_moi}`) : "") +
      o(c.anh_mau, `màn mẫu · ${c.mau.duong}`) +
      "</tr>",
  );
  const html = `<!doctype html>
<html lang="vi"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Đối chiếu · ${cam(slug)}</title>
<style>
:root{--nen:#fff;--chu:#171717;--vien:#e5e5e5;--do:#dc2626}
@media (prefers-color-scheme:dark){:root{--nen:#0a0a0a;--chu:#fafafa;--vien:#262626;--do:#f87171}}
body{margin:0;padding:16px;background:var(--nen);color:var(--chu);font:14px/1.5 system-ui,sans-serif}
table{border-collapse:collapse;width:100%}th,td{border:1px solid var(--vien);padding:8px;vertical-align:top;text-align:left}
img{max-width:100%;height:auto;display:block}figure{margin:0}figcaption{font-size:12px;margin-top:4px}
.thieu{color:var(--do);font-weight:600}
</style></head><body>
<h1>Màn mới cạnh màn mẫu — ${cam(slug)}</h1>
<p>${cap.length} cặp · khổ ${KHO.join(" và ")} · ${thieu.length ? `thiếu ${thieu.length} ảnh` : "đủ ảnh"}</p>
<table><tbody>
${hang.join("\n")}
</tbody></table></body></html>
`;
  writeFileSync(join(thuMuc(slug), "index.html"), html);
  for (const t of thieu) console.error(`thiếu ảnh ${t}`);
  if (thieu.length) process.exit(1);
  console.log(`đối chiếu: ${cap.length} cặp đủ`);
}

// `--o <mã ô>` (hàng 91): hồ sơ có nhiều ô chưa có khuôn đặt mỗi ô một thư mục `ba-loi/<mã ô>/`.
const thuMucBaLoi = (slug) => join(root, "_acceptance", slug, "ba-loi", ...(arg("--o") ? [arg("--o")] : []));

function keHoachBaLoi(slug) {
  const d = thuMucBaLoi(slug);
  mkdirSync(d, { recursive: true });
  const p = join(d, "ba-loi.json");
  if (!existsSync(p)) writeFileSync(p, JSON.stringify(khungBaLoi(), null, 2) + "\n");
  for (const { ma } of LOI) for (const kho of KHO_BA_LOI) console.log(`${ma} · ${kho} → ${relative(join(root, "_acceptance", slug), d)}/${tenAnhBaLoi(ma, kho)}`);
}

function dungBaLoi(slug) {
  const d = thuMucBaLoi(slug);
  let kq;
  try {
    kq = kiemBaLoi(d);
  } catch (e) {
    if (!(e instanceof LoiDoc)) throw e;
    console.error(e.message);
    process.exit(2);
  }
  for (const l of kq.loi) console.error(l);
  if (kq.loi.length) process.exit(1);
  writeFileSync(join(d, "index.html"), dungTrangBaLoi(kq.du, d));
  console.log(`ba lối: dựng ${relative(join(root, "_acceptance"), d)}/index.html — khuyên ${kq.du.khuyen.loi}`);
}

function kiemVong(slug, base, den) {
  let kq;
  try {
    kq = kiemVongBaLoi(root, slug, base, den);
  } catch (e) {
    if (!(e instanceof LoiDoc)) throw e;
    console.error(e.message);
    process.exit(2);
  }
  if (!kq.dieu.length) return console.log("ba lối: vòng không chạm ô chưa có khuôn — không cần trang");
  for (const d of kq.dieu) console.log(`ô chưa có khuôn: ${d.loai} ${d.ten}`);
  for (const l of kq.loi) console.error(l);
  if (kq.loi.length) process.exit(1);
  console.log("ba lối: bước phân kỳ đã mở, trang đủ");
}

const slug = arg("--slug");
if (arg("--dung-ba-loi")) dungBaLoi(arg("--dung-ba-loi"));
else if (args.includes("--ba-loi") && slug) keHoachBaLoi(slug);
else if (args.includes("--kiem-ba-loi") && slug && arg("--base")) kiemVong(slug, arg("--base"), arg("--den"));
else if (arg("--dung")) dung(arg("--dung"));
else if (args.includes("--mau") && slug) keHoachMau(slug);
else if (arg("--base") && slug) keHoachBase(arg("--base"), slug);
else {
  console.error("dùng: doi-chieu.mjs --base <ref> --slug <slug> | --mau --slug <slug> | --dung <slug> | --ba-loi --slug <slug> | --dung-ba-loi <slug> | --kiem-ba-loi --base <ref> --slug <slug> [--den <ref>] [--root <kho>]");
  process.exit(2);
}
