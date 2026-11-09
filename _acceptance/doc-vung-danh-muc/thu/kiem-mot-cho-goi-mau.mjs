// E7, E7b (hàng 99): gói mẫu `SAMPLE_CATALOG` chỉ được dùng ở hai tệp. Tệp kiểm bỏ qua.
//   node _acceptance/doc-vung-danh-muc/thu/kiem-mot-cho-goi-mau.mjs              # quét packages/api/src
//   node _acceptance/doc-vung-danh-muc/thu/kiem-mot-cho-goi-mau.mjs --chieu-do   # tự dựng ca sai, đòi mã 1 kèm tên tệp
// Mã: 0 đạt · 1 có tệp khác dùng · 2 không quét được.
import { spawnSync } from "node:child_process";
import { existsSync, mkdtempSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const TEP = fileURLToPath(import.meta.url);
const GOC = path.resolve(path.dirname(TEP), "../../..");
const CHO_PHEP = ["catalog/nguon.ts", "catalog/sample.ts"];

function moiTep(thuMuc) {
  return readdirSync(thuMuc, { withFileTypes: true }).flatMap((m) => {
    const p = path.join(thuMuc, m.name);
    if (m.isDirectory()) return moiTep(p);
    return m.name.endsWith(".ts") && !m.name.endsWith(".test.ts") ? [p] : [];
  });
}

if (process.argv.includes("--chieu-do")) {
  const tam = mkdtempSync(path.join(tmpdir(), "kiem-goi-mau-"));
  try {
    mkdirSync(path.join(tam, "catalog"));
    writeFileSync(path.join(tam, "catalog/nguon.ts"), "export const a = SAMPLE_CATALOG;\n");
    writeFileSync(path.join(tam, "catalog/sample.ts"), "export const SAMPLE_CATALOG = {};\n");
    writeFileSync(path.join(tam, "a.ts"), "export const b = SAMPLE_CATALOG;\n");
    const r = spawnSync(process.execPath, [TEP, "--thu-muc", tam], { encoding: "utf8" });
    if (r.status !== 1 || !r.stderr.includes("a.ts")) {
      console.error(`chiều đỏ HỎNG: mã ${r.status}, «${r.stderr.trim()}»`);
      process.exit(1);
    }
    console.log("chiều đỏ ĐẠT");
    process.exit(0);
  } finally {
    rmSync(tam, { recursive: true, force: true });
  }
}

const iThuMuc = process.argv.indexOf("--thu-muc");
const thuMuc = iThuMuc > -1 ? process.argv[iThuMuc + 1] : path.join(GOC, "packages/api/src");
if (!existsSync(thuMuc)) {
  console.error(`không quét được: không có ${thuMuc}`);
  process.exit(2);
}
const tep = moiTep(thuMuc);
if (tep.length === 0) {
  console.error(`không quét được: ${thuMuc} không có tệp nào`);
  process.exit(2);
}
const dung = tep
  .filter((t) => /\bSAMPLE_CATALOG\b/.test(readFileSync(t, "utf8")))
  .map((t) => path.relative(thuMuc, t))
  .sort();
const la = dung.filter((t) => !CHO_PHEP.includes(t));
if (la.length > 0) {
  console.error(`gói mẫu còn được dùng ở: ${la.join(", ")}`);
  process.exit(1);
}
if (dung.join() !== CHO_PHEP.join()) {
  console.error(`không quét được: mong ${CHO_PHEP.join(", ")}, thấy ${dung.join(", ")}`);
  process.exit(2);
}
console.log(`gói mẫu chỉ ở: ${dung.join(", ")}`);
