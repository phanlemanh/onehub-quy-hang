#!/usr/bin/env node
// AC-9: mọi tệp nhánh đổi phải nằm trong danh sách viết trước. Gốc kho suy từ vị trí tệp.
// Cặp hai chiều ngay trong lượt chạy: danh sách giả có tệp ngoài phạm vi phải bị báo đúng tên.
import { execFileSync } from "node:child_process";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const SLUG = "va-bai-o-la-do-ngau-nhien";
const TEP_DUOC_DOI = new Set([
  "packages/api/test-db/imports/o-la.test.ts",
  "packages/api/test-db/imports/vet-so-trong-so.ts",
  "_acceptance/config.yaml",
  "docs/plan/lo-trinh.json",
  "PRODUCT-MAP.md",
  "LO-TRINH.html",
  `docs/superpowers/specs/2026-11-09-${SLUG}-design.md`,
  `docs/superpowers/plans/2026-11-09-${SLUG}.md`,
]);
const git = (...a) => execFileSync("git", a, { cwd: ROOT, encoding: "utf8" });
const ngoaiPhamVi = (ds) => ds.filter((t) => !TEP_DUOC_DOI.has(t) && !t.startsWith(`_acceptance/${SLUG}/`));

const GIA = ["packages/api/src/app.ts", ".github/workflows/ci.yml", "package.json"];
const baoGia = ngoaiPhamVi([...GIA, "packages/api/test-db/imports/o-la.test.ts", `_acceptance/${SLUG}/contract.md`]);
if (JSON.stringify(baoGia) !== JSON.stringify(GIA)) {
  console.log(`HỎNG chiều đỏ: mong báo ${JSON.stringify(GIA)}, nhận ${JSON.stringify(baoGia)}`);
  process.exit(1);
}
console.log(`ĐẠT chiều đỏ: ${GIA.map((t) => `HỎNG: ngoài phạm vi: ${t}`).join(" · ")}`);

const base = git("merge-base", "origin/main", "HEAD").trim();
const doi = git("diff", "--name-only", `${base}...HEAD`).split("\n").filter(Boolean);
const sai = ngoaiPhamVi(doi);
if (sai.length) {
  for (const t of sai) console.log(`HỎNG: ngoài phạm vi: ${t}`);
  process.exit(1);
}
console.log(`ĐẠT phạm vi: ${doi.length} tệp đổi, đều trong danh sách viết trước`);
