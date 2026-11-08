// E5b: mã web không còn prop nhaMau; đối chứng dương: quét được và thấy diaChiMau ở chính cây ấy.
// --tu <thư mục>: quét thư mục khác. --chieu-do: tự dựng thư mục còn nhaMau rồi đòi chính lệnh này đỏ đúng thông điệp.
import { execFileSync, spawnSync } from "node:child_process";
import { existsSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

if (process.argv.includes("--chieu-do")) {
  const d = mkdtempSync(path.join(tmpdir(), "nhamau-"));
  writeFileSync(path.join(d, "a.ts"), "export const diaChiMau = 1;\nexport const nhaMau = 2;\n");
  const r = spawnSync(process.execPath, [fileURLToPath(import.meta.url), "--tu", d], { encoding: "utf8" });
  rmSync(d, { recursive: true, force: true });
  if (r.status !== 1 || !r.stderr.includes("còn nhaMau")) {
    console.error(`chiều đỏ HỎNG: mã ${r.status}, ${r.stderr}`);
    process.exit(1);
  }
  console.log("chiều đỏ ĐẠT: còn nhaMau thì mã 1, nêu tệp");
  process.exit(0);
}
const GOC = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");
const i = process.argv.indexOf("--tu");
const THU_MUC = i > 0 ? path.resolve(process.argv[i + 1]) : path.join(GOC, "apps/web/src");
if (!existsSync(THU_MUC)) {
  console.error(`không quét được: ${THU_MUC} không có`);
  process.exit(2);
}
function tim(chu) {
  try {
    return execFileSync("grep", ["-rln", chu, THU_MUC, "--include=*.ts", "--include=*.tsx"], { encoding: "utf8" }).trim();
  } catch (e) {
    if (e.status === 1) return "";
    console.error(`không quét được: grep mã ${e.status}`);
    process.exit(2);
  }
}
if (!tim("diaChiMau")) {
  console.error("không quét được: không thấy diaChiMau, đối chứng dương hỏng");
  process.exit(2);
}
const con = tim("nhaMau");
if (con) {
  console.error(`còn nhaMau:\n${con}`);
  process.exit(1);
}
console.log("không còn nhaMau (đối chứng dương: có diaChiMau)");
