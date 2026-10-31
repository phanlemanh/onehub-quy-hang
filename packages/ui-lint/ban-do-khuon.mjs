#!/usr/bin/env node
// Đọc bản đồ khuôn design/patterns/*.md và kiểm cây (hồ sơ ban-do-khuon-nhom-da-co, hàng 58). Mỗi nhóm một dòng
// «<nhóm>: N tệp|chỗ theo khuôn · k ngoại lệ · m lệch»; mỗi lỗi đọc, mỗi lệch một dòng «<tệp>: <nhóm> — <điều lệch>».
//
//   node packages/ui-lint/ban-do-khuon.mjs [--root <kho>] [--json]      0 sạch · 1 có lỗi đọc hay lệch
//   … --base <ref>   chỉ chấm tệp đổi so <ref> (cả tệp mới chưa theo dõi) và chỉ dòng thêm/đổi; lệch trên dòng không
//                     đổi in nhãn «nợ cũ», không làm đỏ (hàng 59, finding kit §11.4–11.5)
import { execFileSync } from "node:child_process";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { docBanDo, dongTomTat, kiemCay } from "./lib/ban-do.mjs";

const args = process.argv.slice(2);
const i = args.indexOf("--root");
const root = resolve(i >= 0 ? args[i + 1] : join(dirname(fileURLToPath(import.meta.url)), "../.."));

const banDo = docBanDo(root);
const cay = kiemCay(root, banDo);
const lech = Object.values(cay).flatMap((r) => r.lech);

const b = args.indexOf("--base");
if (b >= 0) {
  const ref = args[b + 1];
  const git = (...a) => execFileSync("git", ["-C", root, ...a], { encoding: "utf8" });
  const doi = new Set([...git("diff", "--name-only", ref).split("\n"), ...git("ls-files", "--others", "--exclude-standard").split("\n")].filter(Boolean));
  const moi = new Set(git("ls-files", "--others", "--exclude-standard").split("\n").filter(Boolean));
  /** Dòng thêm/đổi của một tệp so <ref>; tệp mới chưa theo dõi thì mọi dòng (null). */
  const dongDoi = (tep) => {
    if (moi.has(tep)) return null;
    const out = new Set();
    for (const m of git("diff", "-U0", ref, "--", tep).matchAll(/^@@ -\d+(?:,\d+)? \+(\d+)(?:,(\d+))? @@/gm))
      for (let i = 0; i < Number(m[2] ?? 1); i++) out.add(Number(m[1]) + i);
    return out;
  };
  const tepNhom = new Set(Object.values(cay).flatMap((r) => [...r.nhanDien, ...r.ngoaiLe]).filter((t) => doi.has(t)));
  const doiBanDo = [...doi].some((t) => t.startsWith("design/patterns/"));
  if (!tepNhom.size && !doiBanDo) {
    console.log("khuôn: không tệp nào của nhóm đổi");
    process.exit(0);
  }
  const dong = new Map([...tepNhom].map((t) => [t, dongDoi(t)]));
  const lechMoi = [];
  const noCu = [];
  for (const l of lech) {
    if (!dong.has(l.tep)) continue;
    const d = dong.get(l.tep);
    (d === null || l.dong === null || d.has(l.dong) ? lechMoi : noCu).push(l);
  }
  console.log(`khuôn --base ${ref}: ${tepNhom.size} tệp của nhóm đổi · ${lechMoi.length} lệch mới · ${noCu.length} nợ cũ`);
  for (const l of noCu) console.log(`nợ cũ: ${l.tep}: ${l.nhom} — ${l.dieu}`);
  for (const l of banDo.loi) console.error(l);
  for (const l of lechMoi) console.error(`${l.tep}: ${l.nhom} — ${l.dieu}`);
  process.exit(banDo.loi.length || lechMoi.length ? 1 : 0);
}

if (args.includes("--json")) {
  const nhom = Object.fromEntries(
    Object.entries(cay).map(([n, r]) => [n, { don_vi: r.donVi, theo_khuon: r.theoKhuon.length, ngoai_le: r.ngoaiLe.length, lech: r.lech.length }]),
  );
  console.log(JSON.stringify({ nhom, loi_doc: banDo.loi, lech }, null, 2));
} else {
  for (const [n, r] of Object.entries(cay)) console.log(dongTomTat(n, r));
  for (const l of banDo.loi) console.error(`${l}`);
  for (const l of lech) console.error(`${l.tep}: ${l.nhom} — ${l.dieu}`);
}
process.exit(banDo.loi.length || lech.length ? 1 : 0);
