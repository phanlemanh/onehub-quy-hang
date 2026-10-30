#!/usr/bin/env node
// AC-8: PR của bài thử không mang mã thử vào main — không tệp nào dưới apps/web/** hay package-lock.json đổi.
//   node _acceptance/bai-thu-luoi-5000-dong/thu/main-sach.mjs [--base <ref>]   (mặc định origin/main)
import { execFileSync } from "node:child_process";
import { realpathSync } from "node:fs";
import { fileURLToPath } from "node:url";

const CAM = [/^apps\/web\//, /^package-lock\.json$/];

/** Các tệp trong diff mà mã thử không được chạm. */
export function mainSach(tep) {
  return tep.filter((f) => CAM.some((re) => re.test(f)));
}

if (process.argv[1] && fileURLToPath(import.meta.url) === realpathSync(process.argv[1])) {
  const a = process.argv.slice(2);
  const base = a.includes("--base") ? a[a.indexOf("--base") + 1] : "origin/main";
  const diff = execFileSync("git", ["diff", "--name-only", `${base}...HEAD`], { encoding: "utf8" }).split("\n").filter(Boolean);
  const loi = mainSach(diff);
  if (loi.length) {
    for (const f of loi) console.error(`mã thử lọt vào main: ${f}`);
    process.exit(1);
  }
  console.log(`main sạch mã thử: 0 tệp apps/web/** hay package-lock.json trong diff (${diff.length} tệp)`);
}
