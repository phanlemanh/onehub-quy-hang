// Khoá `khe_boc` của bản đồ khuôn (hàng khung-ho-so-lien-he, E6): khe khai ở đó phải là JSX có gốc là thành phần đã khai —
// cột phụ của Liên hệ bọc trong khung hồ sơ chung `KhungHoSo`. Bản sao cây thật: lành 0 lệch, phá đúng một chỗ ra đúng một
// lệch ghim thông điệp.
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { cpSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { docBanDo, kiemCay } from "../lib/ban-do.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const W = "apps/web/src";
const VUNG = `${W}/app/(app)/contacts/vung.tsx`;
const MAU = "design/patterns/lien-he.md";

function voi(fn) {
  const d = mkdtempSync(join(tmpdir(), "khe-boc-"));
  try {
    for (const t of ["design/patterns", W]) cpSync(join(ROOT, t), join(d, t), { recursive: true });
    fn(d);
  } finally {
    rmSync(d, { recursive: true, force: true });
  }
}
function sua(d, t, cu, moi) {
  const s = readFileSync(join(d, t), "utf8");
  assert.ok(s.includes(cu), `bản sao ${t} không có đoạn cần phá: ${cu}`);
  writeFileSync(join(d, t), s.replace(cu, moi));
}
const lechLienHe = (d) => (kiemCay(d, docBanDo(d))["lien-he"]?.lech ?? []).map((l) => `${l.tep}: ${l.dieu}`);

describe("E6 — khe_boc: cột phụ của Liên hệ phải bọc trong KhungHoSo", () => {
  it("cây lành: lien-he khai khe_boc và 0 lệch", () =>
    voi((d) => {
      const bd = docBanDo(d);
      assert.deepEqual(bd.loi, []);
      assert.deepEqual(bd.nhom.find((g) => g.data.nhom === "lien-he").data.khe_boc, { cotPhu: "KhungHoSo" });
      assert.deepEqual(lechLienHe(d), []);
    }));
  it("gỡ KhungHoSo khỏi cột phụ → đúng một lệch nêu tệp, khe và thành phần", () =>
    voi((d) => {
      sua(d, VUNG, "<KhungHoSo cotPhu nhan={CHU.hoSo}>", "<div>");
      sua(d, VUNG, "        </KhungHoSo>\n      }", "        </div>\n      }");
      const l = lechLienHe(d);
      assert.equal(l.length, 1, JSON.stringify(l));
      assert.match(l[0], /vung\.tsx: .*khe «cotPhu» phải bọc trong <KhungHoSo>/);
    }));
  it("khe_boc nêu khe không phải tham số của khuôn → lỗi lược đồ", () =>
    voi((d) => {
      sua(d, MAU, "khe_boc: { cotPhu: KhungHoSo }", "khe_boc: { khongCo: KhungHoSo }");
      assert.ok(docBanDo(d).loi.some((x) => /khe_boc: «khongCo» không phải tham số của khuôn KhungLienHe/.test(x)), JSON.stringify(docBanDo(d).loi));
    }));
  it("khe_boc sai kiểu → lỗi lược đồ", () =>
    voi((d) => {
      sua(d, MAU, "khe_boc: { cotPhu: KhungHoSo }", "khe_boc: [cotPhu]");
      assert.ok(docBanDo(d).loi.some((x) => /khe_boc phải là/.test(x)), JSON.stringify(docBanDo(d).loi));
    }));
});
