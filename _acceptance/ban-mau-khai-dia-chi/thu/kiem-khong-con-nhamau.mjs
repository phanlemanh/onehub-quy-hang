// E5b: mã web không còn prop nhaMau; đối chứng dương: quét được và thấy diaChiMau ở chính cây ấy.
// Chế độ --tu <thư mục> để đo chiều đỏ trên bản sao.
import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

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
