// Lệnh sinh dữ liệu mẫu: ghi bộ dữ liệu và hai file bảng hàng vào packages/db/seed/mau/ (hoặc --ra <thư mục>).
// Cùng hạt giống ra cùng từng byte. --kiem so tệp trong thư mục với đầu ra sinh lại, lệch thì thoát 1.
//   node packages/db/seed/sinh.mjs [--ra <thư mục>] [--hat <số>] [--kiem]
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { parseArgs } from "node:util";
import { HAT_GIONG, sinhDuLieuMau } from "./du-lieu-mau.mjs";
import { MAU_FILE, ghiMau } from "./mau-file.mjs";

export const THU_MUC_MAU = path.join(path.dirname(fileURLToPath(import.meta.url)), "mau");

/** @returns {Record<string, Buffer>} tên tệp → nội dung */
export function sinhTep({ hatGiong = HAT_GIONG } = {}) {
  const d = sinhDuLieuMau({ hatGiong });
  return {
    "du-lieu-mau.json": Buffer.from(`${JSON.stringify(d, null, 2)}\n`, "utf8"),
    ...Object.fromEntries(MAU_FILE.map((m) => [m.tenTep, ghiMau(m, d)])),
  };
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  const { values } = parseArgs({ options: { ra: { type: "string" }, hat: { type: "string" }, kiem: { type: "boolean" } } });
  const ra = path.resolve(values.ra ?? THU_MUC_MAU);
  const hatGiong = values.hat === undefined ? HAT_GIONG : Number(values.hat);
  if (!Number.isInteger(hatGiong)) {
    console.error(`hạt giống phải là số nguyên: ${values.hat}`);
    process.exit(2);
  }
  const tep = sinhTep({ hatGiong });
  if (values.kiem) {
    const lech = Object.entries(tep).filter(([ten, buf]) => {
      try {
        return !readFileSync(path.join(ra, ten)).equals(buf);
      } catch {
        return true;
      }
    });
    for (const [ten] of lech) console.error(`lệch tệp trong kho: ${path.join(ra, ten)}`);
    if (lech.length) process.exit(1);
    console.log(`khớp ${Object.keys(tep).length} tệp ở ${ra}`);
  } else {
    mkdirSync(ra, { recursive: true });
    for (const [ten, buf] of Object.entries(tep)) writeFileSync(path.join(ra, ten), buf);
    console.log(`đã ghi ${Object.keys(tep).join(", ")} vào ${ra}`);
  }
}
