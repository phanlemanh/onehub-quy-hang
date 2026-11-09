#!/usr/bin/env node
// AC-6, AC-7: phá trên bản sao ở thư mục tạm của hệ điều hành, không ghi vào cây kho.
// Mỗi kiểu phá phải làm ca đỏ với đúng thông điệp ghim; bản nguyên vẹn phải xanh.
import { spawnSync } from "node:child_process";
import { cpSync, existsSync, mkdtempSync, readdirSync, readFileSync, rmSync, symlinkSync, writeFileSync, mkdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const DATABASE_URL = "postgres://postgres:quyhang@localhost:5588/postgres";
const TEP_VET = "packages/api/test-db/imports/vet-so-trong-so.ts";
const TEP_GHI = "packages/api/src/imports/ai/store.ts";
const CA = ["--import", "tsx", "--test", "--test-concurrency=1", "--test-name-pattern", "cửa máy chủ|phép kiểm sổ", "test-db/imports/o-la.test.ts"];

// Mỗi kiểu: [tên, tệp phá, [cũ, mới], các thông điệp phải thấy trong nhật ký].
const KIEU = [
  ["ro-that", TEP_GHI, ["      d.model,\n", '      `${d.model} 0900 000 011`,\n'], ["sổ chứa chuỗi số"]],
  ["luon-sach", TEP_VET, ["  const chuSo = soMau", "  if (soMau) return null;\n  const chuSo = soMau"], ["không bắt được: có khoảng trắng"]],
  ["khong-loai-ma-may", TEP_VET, ["    if (typeof giaTri === \"string\" && TRUONG_MA[truong]?.test(giaTri)) continue;\n", ""], ["bắt nhầm mã máy hay giờ ghi", "bắt nhầm dòng ngẫu nhiên"]],
  ["user-id-mo", TEP_VET, ['truong === "user_id" && giaTri === nguoiGhi', 'truong === "user_id"'], ["không bắt được: mã người là số"]],
  ["bo-mot-phan", TEP_VET, ['if (ngan.some((m) => chiChu.includes(m))) return { truong, dang: "mot-phan" };', ""], ["không bắt được: chỉ đuôi"]],
  ["khong-de-quy", TEP_VET, ['typeof giaTri === "object" && giaTri !== null ? manhLong(giaTri) :', 'Array.isArray(giaTri) ? giaTri.map(String) :'], ["không bắt được ở dữ liệu lồng: đối tượng, số đầy đủ"]],
  ["bo-khoa-long", TEP_VET, ["[...manhLong(khoa), ...manhLong(con)]", "manhLong(con)"], ["không bắt được ở dữ liệu lồng: số nằm ở khoá"]],
  ["khong-bo-ma-long", TEP_VET, ['  if (typeof giaTri === "string" && (UUID.test(giaTri) || GIO_GHI.test(giaTri))) return [];\n', ""], ["bắt nhầm mã máy trong dữ liệu lồng", "bắt nhầm dòng ngẫu nhiên lồng"]],
  ["chi-quet-ba-cot", TEP_VET, ['    if (typeof giaTri === "string" && TRUONG_MA[truong]?.test(giaTri)) continue;\n', '    if (!["model", "user_id", "duration_ms"].includes(truong)) continue;\n    if (typeof giaTri === "string" && TRUONG_MA[truong]?.test(giaTri)) continue;\n'], ["không bắt được ở ma trận cột: input_tokens"]],
  ["bo-qua-ma-may", TEP_VET, ['if (typeof giaTri === "string" && TRUONG_MA[truong]?.test(giaTri)) continue;', "if (TRUONG_MA[truong]) continue;"], ["không bắt được ở ma trận cột: id"]],
];

function dungBanSao() {
  const dich = mkdtempSync(join(tmpdir(), "o-la-pha-"));
  mkdirSync(join(dich, "packages"));
  cpSync(resolve(ROOT, "packages/api"), join(dich, "packages/api"), { recursive: true, filter: (t) => !/node_modules$/.test(t) });
  symlinkSync(resolve(ROOT, "node_modules"), join(dich, "node_modules"));
  if (existsSync(resolve(ROOT, "packages/api/node_modules"))) symlinkSync(resolve(ROOT, "packages/api/node_modules"), join(dich, "packages/api/node_modules"));
  for (const g of readdirSync(resolve(ROOT, "packages"))) if (g !== "api") symlinkSync(resolve(ROOT, "packages", g), join(dich, "packages", g));
  cpSync(resolve(ROOT, "tsconfig.base.json"), join(dich, "tsconfig.base.json"));
  return dich;
}

const chay = (dich) => {
  const r = spawnSync("node", CA, { cwd: join(dich, "packages/api"), encoding: "utf8", env: { ...process.env, DATABASE_URL } });
  return { status: r.status, log: `${r.stdout}\n${r.stderr}` };
};

let hong = 0;
const banSao = dungBanSao();
try {
  const lanh = chay(banSao);
  if (lanh.status === 0) console.log("ĐẠT lành: bản sao nguyên vẹn xanh");
  else {
    hong++;
    console.log(`HỎNG lành: bản sao nguyên vẹn đỏ\n${lanh.log}`);
  }
  for (const [ten, tep, [cu, moi], thongDiep] of KIEU) {
    const p = join(banSao, tep);
    const goc = readFileSync(p, "utf8");
    if (!goc.includes(cu)) {
      hong++;
      console.log(`HỎNG ${ten}: không áp được kiểu phá — không thấy đoạn cần sửa`);
      continue;
    }
    writeFileSync(p, goc.replace(cu, moi));
    const r = chay(banSao);
    writeFileSync(p, goc);
    const thieu = thongDiep.filter((t) => !r.log.includes(t));
    if (r.status !== 0 && thieu.length === 0) console.log(`ĐẠT ${ten}: đỏ với ${thongDiep.map((t) => `«${t}»`).join(", ")}`);
    else {
      hong++;
      console.log(`HỎNG ${ten}: exit ${r.status}, thiếu ${JSON.stringify(thieu)}`);
    }
  }
} finally {
  rmSync(banSao, { recursive: true, force: true });
}
console.log(hong ? "KẾT: HỎNG" : "KẾT: ĐẠT");
process.exit(hong ? 1 : 0);
