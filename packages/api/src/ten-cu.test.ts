// AC-4 (ADR-0007): không còn tên tiếng Việt cũ của đường API, mã lỗi, đường màn trong mã nguồn API và web.
import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { join, relative } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const GOC = fileURLToPath(new URL("../../..", import.meta.url));
const TEP_NAY = fileURLToPath(import.meta.url);

/** Danh sách đóng: 13 mã lỗi cũ + 4 đường API cũ + 3 đường màn cũ + 3 mã nội bộ form đăng nhập. */
const TEN_CU = [
  "chua-dang-nhap", "khong-thuoc-san", "chua-gan-san", "can-quan-tri", "chon-san", "da-la-thanh-vien",
  "can-mot-quan-tri", "khu-trung-ten", "vai-khong-hop-le", "can-it-nhat-mot-vai", "khu-khong-thuoc-san",
  "ten-khu-rong", "khong-thay",
  "/api/v1/san", "/san/thanh-vien", "/san/khu", "/me/san",
  "/dang-nhap", "/chon-san", "/chua-gan-san",
  "ma-sai", "ma-het", "qua-nhieu",
];
const thoat = (s: string) => s.replace(/[.*+?^${}()|[\]\\/]/g, "\\$&");
// Ranh giới: trước và sau chuỗi không phải chữ thường hay gạch nối — «/me/san» không khớp «/me/sang», «ma-sai» không khớp «ma-sai-x».
const MAU = TEN_CU.map((t) => ({ t, re: new RegExp(`(?<![a-z-])${thoat(t)}(?![a-z-])`) }));

function quet(text: string): string[] {
  return MAU.filter(({ re }) => re.test(text)).map(({ t }) => t);
}

function tepNguon(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((d) => {
    const p = join(dir, d.name);
    if (d.isDirectory()) return d.name === "node_modules" || d.name.startsWith(".") ? [] : tepNguon(p);
    return /\.tsx?$/.test(d.name) && p !== TEP_NAY ? [p] : [];
  });
}

test("không còn tên tiếng Việt cũ trong mã nguồn", () => {
  assert.deepEqual(quet("return { error: \"chua-gan-san\" };"), ["chua-gan-san"], "đối chứng dương: hàm quét bắt chuỗi cấy");
  const tep = [...tepNguon(join(GOC, "packages/api/src")), ...tepNguon(join(GOC, "apps/web/src"))];
  assert.ok(tep.length > 20, `chỉ thấy ${tep.length} tệp — đường quét sai`);
  const con = tep.flatMap((p) => quet(readFileSync(p, "utf8")).map((t) => `${relative(GOC, p)}: ${t}`));
  assert.deepEqual(con, []);
});

test("màn đọc mã lỗi từ API_ERRORS", () => {
  const man = readFileSync(join(GOC, "apps/web/src/app/(app)/settings/users/quan-nguoi.tsx"), "utf8");
  assert.match(man, /from "@quy-hang\/api\/errors"/);
  const khoa = [...man.matchAll(/\[API_ERRORS\.(\w+)\.code\]/g)].map((m) => m[1]);
  assert.deepEqual(khoa, ["alreadyMember", "lastAdmin", "roleRequired", "zoneNameTaken"]);
});
