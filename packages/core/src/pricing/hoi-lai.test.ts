import assert from "node:assert/strict";
import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { canHoiLai, MUC_HOI_LAI_DOI_GIA_PHAN_TRAM, vietPhanTram, type GiaKemPhi } from "./hoi-lai";

const CU: GiaKemPhi = { listPrice: 5_000_000_000, feeInclusion: "excluded" };

// Ma trận viết trước (AC-5): [tên, cũ, mới, hỏi, phần trăm hiện].
const MA_TRAN: [string, GiaKemPhi, number, "included" | "excluded", boolean, string | null][] = [
  ["tăng đúng 20%", CU, 6_000_000_000, "excluded", false, "+20%"],
  ["tăng 20,01%", CU, 6_000_500_000, "excluded", true, "+20%"],
  ["giảm đúng 20%", CU, 4_000_000_000, "excluded", false, "−20%"],
  ["giảm 20,01%", CU, 3_999_500_000, "excluded", true, "−20%"],
  ["tăng 50%", CU, 7_500_000_000, "excluded", true, "+50%"],
  ["giảm 25%", CU, 3_750_000_000, "excluded", true, "−25%"],
  ["bằng nhau", CU, 5_000_000_000, "excluded", false, "0%"],
  ["đổi phí cùng số", CU, 5_000_000_000, "included", true, "0%"],
  ["đổi phí và tăng 5%", CU, 5_250_000_000, "included", true, "+5%"],
  ["cũ chưa có giá", { listPrice: null, feeInclusion: null }, 3_000_000_000, "included", false, null],
];

test("ngưỡng hỏi lại là 20", () => assert.equal(MUC_HOI_LAI_DOI_GIA_PHAN_TRAM, 20));

for (const [ten, cu, moi, phi, hoi, chu] of MA_TRAN) {
  test(`hỏi lại: ${ten}`, () => {
    const kq = canHoiLai(cu, { listPrice: moi, feeInclusion: phi });
    assert.equal(kq.hoi, hoi, ten);
    assert.equal(kq.phanTram === null ? null : vietPhanTram(kq.phanTram), chu, ten);
  });
}

test("đối chứng đỏ: so bằng ≥ thì ca «tăng đúng 20%» bị bắt", () => {
  const hoiSai = (cu: number, moi: number) => Math.abs(moi - cu) * 100 >= MUC_HOI_LAI_DOI_GIA_PHAN_TRAM * cu;
  const loi = MA_TRAN.filter(([, c, m, p, h]) => c.listPrice !== null && p === c.feeInclusion && hoiSai(c.listPrice, m) !== h).map(([t]) => t);
  assert.deepEqual(loi, ["tăng đúng 20%", "giảm đúng 20%"]);
});

test("ngưỡng khai một chỗ, chú thích «mặc định của sàn»", () => {
  const goc = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
  const tep = readFileSync(path.join(path.dirname(fileURLToPath(import.meta.url)), "hoi-lai.ts"), "utf8");
  const dong = tep.split("\n");
  const i = dong.findIndex((d) => d.includes("export const MUC_HOI_LAI_DOI_GIA_PHAN_TRAM = 20"));
  assert.ok(i > 0, "có dòng khai hằng");
  assert.match(dong.slice(Math.max(0, i - 4), i).join("\n"), /[Mm]ặc định của sàn/, "chú thích ngay trên dòng khai");
  const tat: string[] = [];
  const quet = (d: string) => {
    for (const ten of readdirSync(d)) {
      const p = path.join(d, ten);
      if (statSync(p).isDirectory()) quet(p);
      else if (p.endsWith(".ts") && !p.endsWith(".test.ts") && /change_confirm_pct|HOI_LAI[A-Z_]*\s*=\s*\d/.test(readFileSync(p, "utf8"))) tat.push(path.relative(goc, p));
    }
  };
  quet(goc);
  assert.deepEqual(tat, ["pricing/hoi-lai.ts"]);
});
