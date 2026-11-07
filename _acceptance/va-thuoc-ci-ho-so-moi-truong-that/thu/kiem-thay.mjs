// E3/E4 của hàng va-thuoc-ci-ho-so-moi-truong-that. Dùng CHÍNH bộ đọc của kit (lib/evidence-core.cjs: notRunConflicts,
// chungThayBoi) để kiểm hai ô «không chạy, thay bởi»; đối chứng đỏ gọi đúng tên điều kiện gãy. `--luoi`: chạy lưới trước
// gộp của kit cho bốn hồ sơ. Kit tìm qua packages/ui-lint/tim-kit.mjs (hoặc CLAUDE_PLUGIN_ROOT). Chỉ đọc.
import { execFileSync, spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const GOC = fileURLToPath(new URL("../../../", import.meta.url));
const KIT = process.env.CLAUDE_PLUGIN_ROOT || execFileSync(process.execPath, [join(GOC, "packages/ui-lint/tim-kit.mjs")], { encoding: "utf8" }).trim();
const core = createRequire(import.meta.url)(join(KIT, "lib/evidence-core.cjs"));
const doc = (p) => readFileSync(join(GOC, p), "utf8");

const loi = [];
const dat = (ok, ten) => (console.log(`${ok ? "ĐẠT" : "HỎNG"} ${ten}`), ok || loi.push(ten));

if (process.argv.includes("--luoi")) {
  for (const slug of ["moi-truong-that", "bat-rang-buoc-ban-ma", "va-deploy-csdl-tam", "kiem-nhanh-rang-buoc-ban-ma"]) {
    const r = spawnSync("bash", [join(KIT, "scripts/pre-merge-check.sh"), ".", "--slug", slug, "--base", "origin/main"], { cwd: GOC, encoding: "utf8" });
    const ra = `${r.stdout}${r.stderr}`;
    const vp = ra.split("\n").filter((d) => d.startsWith(`VIOLATION [${slug}]`));
    dat(/rules ran=/.test(ra) && vp.length === 0, `lưới trước gộp ${slug}: chạy thật, 0 VIOLATION${vp.length ? ` — ${vp.join(" | ")}` : ""}`);
  }
} else {
  // Đối chứng đỏ trước: mỗi con trỏ hỏng phải gãy đúng điều kiện của nó.
  const DC = [
    ["con trỏ tới AC không có", { slug: "moi-truong-that", id: "E3", conTro: "va-deploy-csdl-tam#AC-9" }, "ac-thay-vang"],
    ["hồ sơ thay không nhận việc thay", { slug: "moi-truong-that", id: "E3", conTro: "thue-phi#AC-1" }, "thay-khong-nhan"],
    ["hồ sơ thay chưa ký", { slug: "moi-truong-that", id: "E3", conTro: "va-thuoc-ci-ho-so-moi-truong-that#AC-1" }, "ho-so-thay-chua-ky"],
  ];
  for (const [ten, arg, mong] of DC) {
    const r = core.chungThayBoi({ root: GOC, ...arg });
    const ok = r.ok === false && r.lyDo === mong;
    console.log(`${ok ? "ĐỐI CHỨNG đỏ đúng điều kiện" : "HỎNG đối chứng"} «${ten}» → ${mong} (được: ${JSON.stringify(r)})`);
    if (!ok) loi.push(`đối chứng ${ten}`);
  }
  for (const [slug, id, thay, ac] of [
    ["moi-truong-that", "E3", "va-deploy-csdl-tam", "AC-2"],
    ["bat-rang-buoc-ban-ma", "E4", "kiem-nhanh-rang-buoc-ban-ma", "AC-1"],
  ]) {
    const r = core.notRunConflicts(doc(`_acceptance/${slug}/evals.yaml`), doc(`_acceptance/${slug}/evidence-report.md`), { root: GOC, slug });
    const ok = r.xungDot.length === 0 && r.thayBoi.some((t) => t.id === id && t.thay === thay && t.ac === ac);
    dat(ok, `${slug}/${id} không chạy → ${thay}#${ac}${ok ? "" : ` (được: ${JSON.stringify(r)})`}`);
  }
}
console.log(loi.length ? `KẾT: HỎNG ${loi.length}` : "KẾT: ĐẠT");
process.exit(loi.length ? 1 : 0);
