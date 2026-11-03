// E9b (hàng 31) — «cố tình thêm một trường nội bộ thì bộ kiểm rò rỉ đỏ»: chép lõi sang thư mục tạm ngoài cây kho, thêm
// `holderName` (lớp nội bộ) vào danh sách được ra của khách riêng, chạy ĐÚNG lệnh của script test:ro-ri trên bản sao.
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { cpSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const GOC = fileURLToPath(new URL("../../../", import.meta.url));
const lenh = JSON.parse(readFileSync(join(GOC, "package.json"), "utf8")).scripts["test:ro-ri"];

/** Chạy lệnh test:ro-ri với lõi trỏ sang bản sao; `sua` đổi tệp ban-ra.ts của bản sao. */
function chayTrenBanSao(sua) {
  const tam = mkdtempSync(join(tmpdir(), "pha-thu-ro-ri-"));
  try {
    const src = join(tam, "src");
    cpSync(join(GOC, "packages", "core", "src"), src, { recursive: true });
    const banRa = join(src, "redaction", "ban-ra.ts");
    writeFileSync(banRa, sua(readFileSync(banRa, "utf8")));
    const lenhBanSao = lenh.replaceAll("packages/core/src", src.replaceAll("\\", "/"));
    // Bỏ biến của bộ chạy test cha: có nó, `node --test` con báo về cha thay vì tự thoát khác 0 khi đỏ.
    const { NODE_TEST_CONTEXT, ...env } = process.env;
    void NODE_TEST_CONTEXT;
    const r = spawnSync(lenhBanSao, { cwd: GOC, shell: true, encoding: "utf8", env });
    return { ma: r.status, ra: `${r.stdout}${r.stderr}` };
  } finally {
    rmSync(tam, { recursive: true, force: true });
  }
}

test("E9b phá thử — thêm holderName vào danh sách được ra của khách riêng thì lệnh đỏ, nêu holderName", () => {
  assert.match(lenh, /packages\/core\/src\/redaction/);
  const truoc = "khach_rieng: [...CHUNG,";
  const hong = chayTrenBanSao((ma) => {
    assert.ok(ma.includes(truoc), "không tìm thấy danh sách được ra của khách riêng");
    return ma.replace(truoc, `khach_rieng: ["holderName" as never, ...CHUNG,`);
  });
  assert.notEqual(hong.ma, 0);
  assert.match(hong.ra, /holderName/);
});

test("E9b đối chứng dương — bản sao không sửa thì lệnh xanh", () => {
  const lanh = chayTrenBanSao((ma) => ma);
  assert.equal(lanh.ma, 0, lanh.ra.slice(-2000));
});
