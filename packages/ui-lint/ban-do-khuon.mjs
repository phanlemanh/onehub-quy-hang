#!/usr/bin/env node
// Đọc bản đồ khuôn design/patterns/*.md và kiểm cây (hồ sơ ban-do-khuon-nhom-da-co, hàng 58). Mỗi nhóm một dòng
// «<nhóm>: N tệp|chỗ theo khuôn · k ngoại lệ · m lệch»; mỗi lỗi đọc, mỗi lệch một dòng «<tệp>: <nhóm> — <điều lệch>».
//
//   node packages/ui-lint/ban-do-khuon.mjs [--root <kho>] [--json]      0 sạch · 1 có lỗi đọc hay lệch
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { docBanDo, dongTomTat, kiemCay } from "./lib/ban-do.mjs";

const args = process.argv.slice(2);
const i = args.indexOf("--root");
const root = resolve(i >= 0 ? args[i + 1] : join(dirname(fileURLToPath(import.meta.url)), "../.."));

const banDo = docBanDo(root);
const cay = kiemCay(root, banDo);
const lech = Object.values(cay).flatMap((r) => r.lech);

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
