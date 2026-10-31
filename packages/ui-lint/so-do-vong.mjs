#!/usr/bin/env node
// Số đo một vòng chạm giao diện (hồ sơ vong-giao-dien-qua-ban-do, hàng 60, QK4): tệp theo khuôn, số lần răng khuôn bắt
// trên các commit của vòng, lệch lọt chủ sản phẩm thấy khi dùng, và các số của kit — để kit đếm cho KH-C1…KH-C5.
//
//   node packages/ui-lint/so-do-vong.mjs --slug <slug> --base <ref> [--write] [--bao] [--root <kho>]
//     --write  ghi _acceptance/<slug>/khuon-so-do.json
//     --bao    in một dòng báo cho kênh liên máy kit (lệnh không đăng — đăng là việc của phiên, sau khi gộp)
// Mã: 0 đã đo · 2 không đo được (đối số sai, không dựng được cây của một commit) — không ghi số thiếu.
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { docBanDo, kiemCay, manNgoaiBanDo } from "./lib/ban-do.mjs";

export const SO_LECH_LOT = "docs/design/lech-lot.md";

const args = process.argv.slice(2);
const arg = (k) => (args.includes(k) ? args[args.indexOf(k) + 1] : null);
const root = resolve(arg("--root") ?? join(dirname(fileURLToPath(import.meta.url)), "../.."));
const slug = arg("--slug");
const base = arg("--base");
if (!slug || !base) {
  console.error("dùng: so-do-vong.mjs --slug <slug> --base <ref> [--write] [--bao] [--root <kho>]");
  process.exit(2);
}
const git = (...a) => execFileSync("git", ["-C", root, ...a], { encoding: "utf8" });
const dong = (s) => s.split("\n").filter(Boolean);
try {
  git("rev-parse", "--verify", "-q", `${base}^{commit}`);
} catch {
  console.error(`so-do-vong: không có commit «${base}» — không ghi số`);
  process.exit(2);
}

/** Lệch khuôn (cả màn ngoài bản đồ) của một cây, mỗi lệch khoá theo (tệp, nhóm, điều lệch). */
function lechCuaCay(goc) {
  const bd = docBanDo(goc);
  const cay = kiemCay(goc, bd);
  return { cay, lech: [...Object.values(cay).flatMap((r) => r.lech), ...manNgoaiBanDo(goc, bd)] };
}
const khoaLech = (l) => `${l.tep}\u0000${l.nhom}\u0000${l.dieu}`;

// Tệp vòng đổi (so <ref>, cả tệp mới chưa theo dõi) đang theo khuôn ở cây hiện tại.
const doi = new Set([...dong(git("diff", "--name-only", base)), ...dong(git("ls-files", "--others", "--exclude-standard"))]);
const hienTai = lechCuaCay(root);
const tepTheoKhuon = Object.entries(hienTai.cay)
  .filter(([, r]) => r.donVi === "man")
  .flatMap(([, r]) => r.theoKhuon)
  .filter((t) => doi.has(t))
  .sort();

// Răng bắt: lệch bài quét báo trên tệp mà từng commit của vòng đổi, trừ lệch còn ở cây hiện tại.
const conLai = new Set(hienTai.lech.map(khoaLech));
const bat = new Map();
for (const c of dong(git("rev-list", "--reverse", `${base}..HEAD`))) {
  const tepCommit = new Set(dong(git("diff-tree", "--no-commit-id", "--name-only", "-r", "--root", c)));
  const tam = mkdtempSync(join(tmpdir(), "so-do-vong-"));
  const cayCommit = join(tam, "cay");
  try {
    git("worktree", "add", "--detach", "-q", cayCommit, c);
  } catch (e) {
    rmSync(tam, { recursive: true, force: true });
    console.error(`so-do-vong: không dựng được cây của commit ${c} — không ghi số (${String(e.message).split("\n")[0]})`);
    process.exit(2);
  }
  try {
    for (const l of lechCuaCay(cayCommit).lech) {
      const k = khoaLech(l);
      if (tepCommit.has(l.tep) && !conLai.has(k) && !bat.has(k)) bat.set(k, { tep: l.tep, nhom: l.nhom, dieu: l.dieu, commit: c });
    }
  } finally {
    git("worktree", "remove", "--force", cayCommit);
    rmSync(tam, { recursive: true, force: true });
  }
}

// Lệch lọt: dòng của sổ có cột «Vòng làm ra» là slug này.
function demLechLot() {
  const p = join(root, SO_LECH_LOT);
  if (!existsSync(p)) return 0;
  return readFileSync(p, "utf8")
    .split("\n")
    .filter((l) => /^\|/.test(l) && !/^\|\s*-/.test(l))
    .map((l) => l.split("|").slice(1, -1).map((o) => o.trim().replace(/^`|`$/g, "")))
    .filter((o) => o.length >= 4 && o[0] !== "Ngày" && o[3] === slug).length;
}

// Số của kit: dòng gio-may cuối của run-log; lượt gọi người từ sổ quyết định.
function docJsonl(p) {
  if (!existsSync(p)) return [];
  return readFileSync(p, "utf8")
    .split("\n")
    .flatMap((l) => {
      try {
        return l.trim() ? [JSON.parse(l)] : [];
      } catch {
        return [];
      }
    });
}
const hs = join(root, "_acceptance", slug);
const luotGoiNguoi = docJsonl(join(hs, "decisions.jsonl")).filter(
  (d) => d.type === "seal" || ((d.stage === "gate1" || d.stage === "gate2") && d.decided_by),
).length;
const gioMay = docJsonl(join(hs, "run-log.jsonl"))
  .filter((d) => d.kind === "gio-may")
  .at(-1);
const kit = gioMay
  ? {
      gio_may: gioMay.gio_may ?? null,
      gio_cho: gioMay.gio_cho ?? null,
      token_ra: Object.values(gioMay.token ?? {}).reduce((s, m) => s + (m.ra ?? 0), 0),
      phan_tram_tuan: gioMay.phan_tram_tuan ?? null,
      luot_goi_nguoi: luotGoiNguoi,
    }
  : null;

const ket = {
  slug,
  base,
  head: git("rev-parse", "HEAD").trim(),
  tep_theo_khuon: tepTheoKhuon,
  rang_bat: bat.size,
  rang_bat_chi_tiet: [...bat.values()],
  lech_lot: demLechLot(),
  kit,
  ...(kit ? {} : { ly_do_kit: `hồ sơ chưa có dòng gio-may trong _acceptance/${slug}/run-log.jsonl` }),
  gioi_han: "răng bắt trước khi commit (lint trong trình soạn, hook cuối lượt) không đếm",
};

if (args.includes("--write")) {
  mkdirSync(hs, { recursive: true });
  writeFileSync(join(hs, "khuon-so-do.json"), JSON.stringify(ket, null, 2) + "\n");
}
console.log(`khuôn: ${ket.tep_theo_khuon.length} tệp theo khuôn · răng bắt ${ket.rang_bat} · lệch lọt ${ket.lech_lot}`);
// Dòng báo cho kênh liên máy kit — kho kit công khai: CHỈ số (mã hàng lộ trình và số đo), không tên hồ sơ, không chữ
// sản phẩm, không dữ liệu người dùng (chủ kho 31/10, Cổng Phạm vi hàng 60).
if (args.includes("--bao")) {
  const o = join(hs, "opportunity.md");
  const ma = existsSync(o) ? (/^lo_trinh_ma:\s*(\d+)\s*$/m.exec(readFileSync(o, "utf8"))?.[1] ?? null) : null;
  const so = (v) => (v === null || v === undefined ? "chưa đo" : v);
  console.log(
    `quy-hang · hàng ${ma ?? "chưa xếp"} · khuôn ${ket.tep_theo_khuon.length} tệp · răng bắt ${ket.rang_bat} · lệch lọt ${ket.lech_lot} · ` +
      `giờ máy ${so(kit?.gio_may)} · giờ chờ ${so(kit?.gio_cho)} · token ra ${so(kit?.token_ra)} · gọi người ${luotGoiNguoi}`,
  );
}
