// Hàng 93 (dang-nhap-auth-15) AC-7 — E13: dòng «Chỗ hở» Đăng nhập rời vo-va-ia.md §3 (bớt đúng một dòng so với nhánh chính)
// và catalog.md có dòng @reui/auth-15 đủ chín ô, ảnh chuẩn có trong kho. Gốc kho suy từ vị trí tệp.
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const GOC = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");
const git = (...a) => execFileSync("git", ["-C", GOC, ...a], { encoding: "utf8" });
const VVI = "docs/design/vo-va-ia.md";
const CATALOG = ".agents/skills/quy-hang-ui/catalog.md";
const DONG_DANG_NHAP = "| Đăng nhập, chọn sàn, chưa gắn sàn (tạm) |";
const COT = ["Khối gốc", "Archetype", "Nhóm đang dùng", "Tệp đang dùng", "Màn", "Ảnh chuẩn", "Phiên bản ReUI", "Duyệt", "Đã đổi gì khi chuyển thể"];

/** Các dòng dữ liệu của bảng §3 «Chỗ hở». */
const dongChoHo = (vvi) =>
  vvi.split("## 3. Chỗ hở")[1].split(/\n## /)[0].split("\n").filter((l) => l.startsWith("| ")).slice(2);

function nhanhChinh() {
  for (const ref of ["origin/main", "main"]) {
    try {
      git("rev-parse", "--verify", "--quiet", `${ref}^{commit}`);
      return ref;
    } catch {}
  }
  return null;
}

/** Lỗi của dòng catalog auth-15: thiếu dòng, thiếu ô, ảnh không có, tệp sai. */
function loiDongAuth15(catalog, coTep) {
  const dong = catalog.split("\n").filter((l) => l.startsWith("| `@reui/auth-15` |"));
  if (dong.length !== 1) return [`có ${dong.length} dòng @reui/auth-15`];
  const o = dong[0].trim().slice(1, -1).split("|").map((x) => x.trim());
  const loi = [];
  if (o.length !== COT.length) loi.push(`có ${o.length} ô, cần ${COT.length}`);
  COT.forEach((c, i) => {
    if (!o[i] || /^[—–-]$/.test(o[i])) loi.push(`ô rỗng: ${c}`);
  });
  const anh = /`([^`]+\.png)`/.exec(o[COT.indexOf("Ảnh chuẩn")] ?? "")?.[1];
  if (!anh || !coTep(anh)) loi.push(`ảnh chuẩn không có: ${anh ?? "(không nêu)"}`);
  if (!(o[COT.indexOf("Tệp đang dùng")] ?? "").includes("apps/web/src/app/(auth)/khung.tsx")) loi.push("Tệp đang dùng không nêu khung.tsx");
  return loi;
}

test("sổ: Chỗ hở Đăng nhập rời bảng, bớt đúng một dòng", () => {
  const ref = nhanhChinh();
  assert.ok(ref, "không tìm được nhánh chính (origin/main hay main)");
  const goc = git("merge-base", ref, "HEAD").trim();
  const truoc = dongChoHo(git("show", `${goc}:${VVI}`));
  const sau = dongChoHo(readFileSync(path.join(GOC, VVI), "utf8"));
  assert.equal(truoc.filter((l) => l.startsWith(DONG_DANG_NHAP)).length, 1, "nhánh chính có dòng Đăng nhập");
  assert.equal(sau.filter((l) => l.startsWith(DONG_DANG_NHAP)).length, 0, "nhánh này còn dòng Đăng nhập");
  assert.equal(sau.length, truoc.length - 1);
});

test("sổ: catalog có dòng auth-15 đủ chín ô", () => {
  const catalog = readFileSync(path.join(GOC, CATALOG), "utf8");
  const coTep = (p) => existsSync(path.join(GOC, p));
  assert.deepEqual(loiDongAuth15(catalog, coTep), []);
  // Đối chứng: bản sao dòng mất ô Màn thì thước nêu tên ô; ảnh trỏ tệp không có thì nêu đường ảnh.
  const dong = catalog.split("\n").find((l) => l.startsWith("| `@reui/auth-15` |"));
  const o = dong.split("|");
  const matO = [...o.slice(0, 6), "  ", ...o.slice(7)].join("|");
  assert.ok(loiDongAuth15(catalog.replace(dong, matO), coTep).includes("ô rỗng: Màn"));
  assert.ok(loiDongAuth15(catalog, () => false).some((l) => l.startsWith("ảnh chuẩn không có: ")));
});
