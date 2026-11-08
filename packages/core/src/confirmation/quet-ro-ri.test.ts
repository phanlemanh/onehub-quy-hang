import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { test } from "node:test";
import { fileURLToPath, pathToFileURL } from "node:url";
import { dungBaoSai, dungKhungToa, dungThuocTinhCan } from "./dung";
import { CAY, cay, KHOA_MOI, moiNgoaiDanhMuc, quetRoRi, type BaHam } from "./quet-ro-ri.fixture";

const MA_THAT = { dungKhungToa, dungThuocTinhCan, dungBaoSai } as unknown as BaHam;
const TEP_DUNG = fileURLToPath(new URL("./dung.ts", import.meta.url));

/** Khoá gốc của một mồi: `contacts[0].fullName` → `contacts`. */
const khoaGoc = (truong: string) => truong.split(/[.[]/)[0];

test("rò rỉ: mồi đi qua đường dựng", () => {
  const coGiaTri = [...new Set(moiNgoaiDanhMuc().map((m) => khoaGoc(m.truong)))];
  assert.deepEqual([...coGiaTri].sort(), [...KHOA_MOI].sort(), "khoá mồi ghim trước khớp khoá có giá trị");
  assert.equal(coGiaTri.length, KHOA_MOI.length);
  assert.equal(KHOA_MOI.length, 22);
  for (const k of ["floorPrice", "ownerPhone", "closePrice"] as const) assert.ok(KHOA_MOI.includes(k), k);
  assert.deepEqual(quetRoRi(MA_THAT), []);
});

/** Chép mã hàm dựng sang thư mục tạm, đổi đường nhập tương đối thành URL tuyệt đối, nạp bản chép. */
async function napBanSao(thuMuc: string, ten: string, nguon: string): Promise<BaHam> {
  const goc = dirname(TEP_DUNG);
  const ma = nguon.replace(/from "(\.{1,2}\/[^"]+)"/g, (_, duong: string) => {
    const tep = `${resolve(goc, duong)}.ts`;
    if (!existsSync(tep)) throw new Error(`không có tệp nhập: ${tep}`);
    return `from "${pathToFileURL(tep).href}"`;
  });
  const dich = join(thuMuc, `${ten}.ts`);
  writeFileSync(dich, ma);
  return (await import(pathToFileURL(dich).href)) as BaHam;
}

const trangThaiCay = () => execFileSync("git", ["status", "--porcelain"], { cwd: dirname(TEP_DUNG), encoding: "utf8" });

test("rò rỉ: cấy lỗi vào bản sao hàm dựng thì phép quét đỏ", async () => {
  const truoc = trangThaiCay();
  const nguon = readFileSync(TEP_DUNG, "utf8");
  const thuMuc = mkdtempSync(join(tmpdir(), "quet-ro-ri-"));
  try {
    assert.deepEqual(quetRoRi(await napBanSao(thuMuc, "khong-cay", nguon)), [], "bản sao không cấy phải sạch");
    let dem = 0;
    for (const [i, phep] of CAY.entries()) {
      const maCay = cay(nguon, phep);
      assert.notEqual(maCay, nguon, `${phep.ten}: mã sau cấy phải khác mã gốc`);
      const ro = quetRoRi(await napBanSao(thuMuc, `cay-${i}`, maCay));
      assert.ok(
        ro.some((p) => p.duong === phep.mongDoi.duong && p.loai === phep.mongDoi.loai && p.truong === phep.mongDoi.truong),
        `${phep.ten}: phép quét phải gọi tên ${phep.mongDoi.truong} — ${JSON.stringify(ro)}`,
      );
      dem++;
    }
    assert.equal(dem, CAY.length);
    assert.equal(dem, 7);
    assert.throws(() => cay(nguon, { ten: "neo sai", thay: [["KHONG_CO_TRONG_MA", "x"]] }), /neo mất: neo sai/);
  } finally {
    rmSync(thuMuc, { recursive: true, force: true });
  }
  assert.equal(trangThaiCay(), truoc, "cây kho không đổi sau ca");
});
