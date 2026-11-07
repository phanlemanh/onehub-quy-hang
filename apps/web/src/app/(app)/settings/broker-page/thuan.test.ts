// Cài đặt › Sàn › Trang môi giới (hàng 44, E8b): đọc hai điểm của sàn, kiểm ô mức chia, thân PATCH. Trang chặn vai bằng khuôn
// chung (bài quét `../cai-dat.test.ts` nhận trang mới vì nó nằm dưới settings/).
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { docCaiDat, docO, KHOA_AN, KHOA_MUC, thanLuu } from "./thuan";

test("trang môi giới: ô mức chia và thân lưu", () => {
  // [ô, kết quả]
  const BANG: [string, number | null | "sai"][] = [
    ["", null],
    ["45", 45],
    ["12,5", 12.5],
    ["120", "sai"],
    ["-1", "sai"],
    ["abc", "sai"],
  ];
  let dem = 0;
  for (const [o, mong] of BANG) {
    assert.equal(docO(o), mong, `ô «${o}»`);
    dem++;
  }
  assert.equal(dem, BANG.length);
  assert.deepEqual(thanLuu(45, true), { [KHOA_MUC]: 45, [KHOA_AN]: true });
  assert.deepEqual(docCaiDat({ items: [{ key: KHOA_MUC, value: 30 }, { key: KHOA_AN, value: true }] }), { muc: 30, an: true });
  assert.deepEqual(docCaiDat(null), { muc: null, an: false });
});

test("trang môi giới: trang chặn vai trước khi đọc API", () => {
  const nguon = readFileSync(new URL("./page.tsx", import.meta.url), "utf8");
  const chan = nguon.search(/const chan = chanMucSan\(me\.activeCompany\.roles\);\s*if \(chan\) redirect\(chan\);/);
  assert.ok(chan > 0, "trang môi giới không chặn vai");
  assert.ok(chan < nguon.indexOf("/api/v1/company/settings"), "chặn vai phải đứng trước lời đọc API");
});
