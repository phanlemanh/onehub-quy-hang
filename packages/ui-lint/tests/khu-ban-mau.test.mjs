// Khu bản mẫu (hồ sơ ban-mau-khai-dia-chi, E6–E8). Bản sao design/patterns + apps/web/src + navigation.ts thật trong thư mục tạm;
// mỗi ca kiểm bản sao lành trước rồi phá đúng một chỗ.
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { cpSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { docBanDo, docFrontmatter, nhomCuaTep } from "../lib/ban-do.mjs";

const PKG = join(dirname(fileURLToPath(import.meta.url)), "..");
const ROOT = join(PKG, "..", "..");
const CLI = join(PKG, "ban-do-khuon.mjs");
const W = "apps/web/src";
const NHANH = `${W}/app/(app)/proto/nhanh-tuc-thi/page.tsx`;
const MOI = `${W}/app/(app)/proto/mau-moi/page.tsx`;
const TRANG_MOI = (than) => `export default function Page() {\n  return (\n    <>\n      ${than}\n      <p>Bản mẫu</p>\n    </>\n  );\n}\n`;
const NHAP = 'import { KhaiDiaChi } from "@/components/shell/dia-chi-mau";\n';

function voi(fn) {
  const d = mkdtempSync(join(tmpdir(), "khu-ban-mau-"));
  try {
    for (const t of ["design/patterns", W, "packages/core/src/navigation.ts"]) cpSync(join(ROOT, t), join(d, t), { recursive: true });
    return fn(d);
  } finally {
    rmSync(d, { recursive: true, force: true });
  }
}
const ghi = (d, t, s) => (mkdirSync(dirname(join(d, t)), { recursive: true }), writeFileSync(join(d, t), s));
const chay = (d) => spawnSync(process.execPath, [CLI, "--root", d], { encoding: "utf8" });
const lanh = (d) => {
  const r = chay(d);
  assert.equal(r.status, 0, `bản sao lành phải xanh: ${r.stderr}`);
};
function dongDo(r, ...manh) {
  assert.equal(r.status, 1, `phải đỏ: ${r.stdout}`);
  const dong = r.stderr.split("\n").find((l) => manh.every((m) => l.includes(m)));
  assert.ok(dong, `thiếu dòng đỏ chứa ${manh.join(" · ")}:\n${r.stderr}`);
}

describe("khu bản mẫu ra khỏi Trang tạm", () => {
  it("cây thật: không tệp proto nào thuộc trang-tam, Trang tạm không còn ngoại lệ proto", () => {
    const bd = docBanDo(ROOT);
    const tam = bd.nhom.find((g) => g.data.nhom === "trang-tam");
    assert.ok(!tam.khop.some((t) => t.includes("/proto/")));
    const { data } = docFrontmatter(readFileSync(join(ROOT, "design/patterns/trang-tam.md"), "utf8"));
    assert.ok(!data.ngoai_le.some((x) => x.tep.includes("/proto/")), "còn ngoại lệ proto ở Trang tạm");
    assert.ok(!nhomCuaTep(bd, NHANH).some((g) => g.data.nhom === "trang-tam"));
  });
  it("hai chiều: gỡ tru_nhan_dien thì trang proto đỏ lại ở trang-tam; trang mới ngoài khu vẫn đỏ", () =>
    voi((d) => {
      lanh(d);
      const p = join(d, "design/patterns/trang-tam.md");
      const goc = readFileSync(p, "utf8");
      writeFileSync(p, goc.replace(/^tru_nhan_dien:.*\n/m, ""));
      dongDo(chay(d), "nhanh-tuc-thi", "trang-tam");
      writeFileSync(p, goc);
      lanh(d);
      ghi(d, `${W}/app/(app)/bao-cao-moi/page.tsx`, "export default function Page() {\n  return <p>Màn mới</p>;\n}\n");
      dongDo(chay(d), "bao-cao-moi");
    }));
});

describe("trang bản mẫu phải khai địa chỉ", () => {
  const ca = [
    ["thiếu KhaiDiaChi", TRANG_MOI(""), "chưa khai địa chỉ"],
    ["khai bằng biến", NHAP + 'const d = "/inventory";\n' + TRANG_MOI("<KhaiDiaChi duong={d} />"), "phải là chuỗi cố định"],
    ["địa chỉ không thuộc nhà nào", NHAP + TRANG_MOI('<KhaiDiaChi duong="/khong-co" />'), "không thuộc nhà nào"],
  ];
  it("đối chứng dương: khai đúng thì xanh", () =>
    voi((d) => {
      ghi(d, MOI, NHAP + TRANG_MOI('<KhaiDiaChi duong="/settings/labels" />'));
      lanh(d);
    }));
  for (const [ten, ma, thongDiep] of ca)
    it(`đỏ khi ${ten}`, () =>
      voi((d) => {
        lanh(d);
        ghi(d, MOI, ma);
        dongDo(chay(d), MOI, "khu-ban-mau", thongDiep);
      }));
});

describe("sổ design-pass ghi địa chỉ thật", () => {
  const hoSo = (d, status, so) => {
    ghi(d, MOI, NHAP + TRANG_MOI('<KhaiDiaChi duong="/settings/labels" />'));
    ghi(d, "_acceptance/mau-moi/contract.md", `---\nslug: mau-moi\nstatus: ${status}\n---\n`);
    ghi(d, "_acceptance/mau-moi/design-pass.md", so);
  };
  it("sổ có địa chỉ thì xanh", () =>
    voi((d) => {
      hoSo(d, "draft", "Chạy ở /proto/mau-moi · địa chỉ thật /settings/labels\n");
      lanh(d);
    }));
  it("hồ sơ đang mở mà sổ thiếu địa chỉ thì đỏ, nêu sổ", () =>
    voi((d) => {
      hoSo(d, "draft", "Chạy ở /proto/mau-moi\n");
      dongDo(chay(d), MOI, "design-pass chưa ghi địa chỉ thật", "_acceptance/mau-moi/design-pass.md");
    }));
  it("hồ sơ đã ký không xét lại", () =>
    voi((d) => {
      hoSo(d, "signed-off", "Chạy ở /proto/mau-moi\n");
      lanh(d);
    }));
});
