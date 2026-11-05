// Lệnh sinh bộ mẫu thấp tầng (hàng 73): ghi bộ dữ liệu, file bảng hàng bẩn và đáp án vào packages/db/seed/mau-thap-tang/
// (hoặc --ra <thư mục>). Cùng hạt giống ra cùng từng byte. --kiem so tệp trong thư mục với đầu ra sinh lại, lệch thì thoát 1.
//   node packages/db/seed/sinh-thap-tang.mjs [--ra <thư mục>] [--hat <số>] [--kiem]
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { parseArgs } from "node:util";
import { DU_LIEU_HANG_5, HAT_GIONG_THAP_TANG, sinhDuLieuThapTang } from "./du-lieu-mau-thap-tang.mjs";
import { TEN_TEP_BAN, dungFileBan, ghiFileBan } from "./file-thap-tang.mjs";

export const THU_MUC_THAP_TANG = path.join(path.dirname(fileURLToPath(import.meta.url)), "mau-thap-tang");
export const TEP_DU_LIEU = "du-lieu-mau-thap-tang.json";
export const TEP_DAP_AN = "dap-an-thap-tang.json";

const json = (x) => Buffer.from(`${JSON.stringify(x, null, 2)}\n`, "utf8");

/** @returns {Record<string, Buffer>} tên tệp → nội dung */
export function sinhTepThapTang({ hatGiong = HAT_GIONG_THAP_TANG } = {}) {
  const hang5 = JSON.parse(readFileSync(DU_LIEU_HANG_5, "utf8"));
  const { diaChiThu, ...d } = sinhDuLieuThapTang({ hatGiong, hang5 });
  const { luoi, dapAn } = dungFileBan({ ...d, diaChiThu }, hang5);
  return {
    [TEP_DU_LIEU]: json(d),
    [TEN_TEP_BAN]: ghiFileBan(luoi),
    [TEP_DAP_AN]: json({ phienBan: 1, hatGiong, nhan: d.nhan, file: dapAn, diaChi: diaChiThu }),
  };
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  const { values } = parseArgs({ options: { ra: { type: "string" }, hat: { type: "string" }, kiem: { type: "boolean" } } });
  const ra = path.resolve(values.ra ?? THU_MUC_THAP_TANG);
  const hatGiong = values.hat === undefined ? HAT_GIONG_THAP_TANG : Number(values.hat);
  if (!Number.isInteger(hatGiong)) {
    console.error(`hạt giống phải là số nguyên: ${values.hat}`);
    process.exit(2);
  }
  const tep = sinhTepThapTang({ hatGiong });
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
