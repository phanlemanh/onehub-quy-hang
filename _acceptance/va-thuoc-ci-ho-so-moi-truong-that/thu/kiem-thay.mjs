// E1–E3 của hàng va-thuoc-ci-ho-so-moi-truong-that. Dùng CHÍNH bộ đọc của kit (lib/evidence-core.cjs: notRunConflicts,
// chungThayBoi) để kiểm hai ô «không chạy, thay bởi»; đối chứng đỏ gọi đúng tên điều kiện gãy. `--luoi`: chạy lưới trước
// gộp của kit cho bốn hồ sơ. Kit tìm qua packages/ui-lint/tim-kit.mjs (hoặc CLAUDE_PLUGIN_ROOT). Chỉ đọc.
import { execFileSync, spawnSync } from "node:child_process";
import { cpSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
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
  for (const slug of ["bat-rang-buoc-ban-ma", "kiem-nhanh-rang-buoc-ban-ma"]) {
    const r = spawnSync("bash", [join(KIT, "scripts/pre-merge-check.sh"), ".", "--slug", slug, "--base", "origin/main"], { cwd: GOC, encoding: "utf8" });
    const ra = `${r.stdout}${r.stderr}`;
    const vp = ra.split("\n").filter((d) => d.startsWith(`VIOLATION [${slug}]`));
    dat(/rules ran=/.test(ra) && vp.length === 0, `lưới trước gộp ${slug}: chạy thật, 0 VIOLATION${vp.length ? ` — ${vp.join(" | ")}` : ""}`);
  }
} else {
  // Đối chứng đỏ trước, trên BẢN SAO tạm của hồ sơ thay (không dựa vào trạng thái thật đang đổi của hồ sơ nào):
  // mỗi bản sao gãy đúng một điều kiện của luật thay bởi, và bộ đọc của kit phải gọi đúng tên điều ấy.
  const banSao = (sua) => {
    const goc = mkdtempSync(join(tmpdir(), "thay-"));
    mkdirSync(join(goc, "_acceptance"), { recursive: true });
    cpSync(join(GOC, "_acceptance/config.yaml"), join(goc, "_acceptance/config.yaml"));
    for (const s of ["bat-rang-buoc-ban-ma", "kiem-nhanh-rang-buoc-ban-ma"]) cpSync(join(GOC, "_acceptance", s), join(goc, "_acceptance", s), { recursive: true });
    const tk = "docs/superpowers/specs/2026-11-06-kiem-nhanh-rang-buoc-ban-ma-design.md";
    mkdirSync(join(goc, "docs/superpowers/specs"), { recursive: true });
    cpSync(join(GOC, tk), join(goc, tk));
    sua(goc, tk);
    return goc;
  };
  const doi = (goc, rel, tu, sang) => writeFileSync(join(goc, rel), readFileSync(join(goc, rel), "utf8").split(tu).join(sang));
  const DC = [
    ["con trỏ tới AC không có", () => {}, "kiem-nhanh-rang-buoc-ban-ma#AC-9", "ac-thay-vang"],
    ["thẻ dính chữ bat-rang-buoc-ban-ma/E4a", (g, tk) => { doi(g, tk, "bat-rang-buoc-ban-ma/E4", "bat-rang-buoc-ban-ma/E4a"); doi(g, "_acceptance/kiem-nhanh-rang-buoc-ban-ma/contract.md", "bat-rang-buoc-ban-ma/E4", "bat-rang-buoc-ban-ma/E4a"); }, "kiem-nhanh-rang-buoc-ban-ma#AC-1", "thay-khong-nhan"],
    ["hồ sơ thay status verified", (g) => doi(g, "_acceptance/kiem-nhanh-rang-buoc-ban-ma/contract.md", "status: signed-off", "status: verified"), "kiem-nhanh-rang-buoc-ban-ma#AC-1", "ho-so-thay-chua-ky"],
  ];
  for (const [ten, sua, conTro, mong] of DC) {
    const g = banSao(sua);
    try {
      const r = core.chungThayBoi({ root: g, slug: "bat-rang-buoc-ban-ma", id: "E4", conTro });
      const ok = r.ok === false && r.lyDo === mong;
      console.log(`${ok ? "ĐỐI CHỨNG đỏ đúng điều kiện" : "HỎNG đối chứng"} «${ten}» → ${mong} (được: ${JSON.stringify(r)})`);
      if (!ok) loi.push(`đối chứng ${ten}`);
    } finally {
      rmSync(g, { recursive: true, force: true });
    }
  }
  // Đối chứng dương trên bản sao không sửa: con trỏ thật phải được nhận.
  {
    const g = banSao(() => {});
    try {
      const r = core.chungThayBoi({ root: g, slug: "bat-rang-buoc-ban-ma", id: "E4", conTro: "kiem-nhanh-rang-buoc-ban-ma#AC-1" });
      dat(r.ok === true, `đối chứng dương: bản sao không sửa nhận con trỏ (được: ${JSON.stringify(r)})`);
    } finally {
      rmSync(g, { recursive: true, force: true });
    }
  }
  for (const [slug, id, thay, ac] of [
    ["bat-rang-buoc-ban-ma", "E4", "kiem-nhanh-rang-buoc-ban-ma", "AC-1"],
  ]) {
    const r = core.notRunConflicts(doc(`_acceptance/${slug}/evals.yaml`), doc(`_acceptance/${slug}/evidence-report.md`), { root: GOC, slug });
    const ok = r.xungDot.length === 0 && r.thayBoi.some((t) => t.id === id && t.thay === thay && t.ac === ac);
    dat(ok, `${slug}/${id} không chạy → ${thay}#${ac}${ok ? "" : ` (được: ${JSON.stringify(r)})`}`);
  }
}
console.log(loi.length ? `KẾT: HỎNG ${loi.length}` : "KẾT: ĐẠT");
process.exit(loi.length ? 1 : 0);
