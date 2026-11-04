// Thanh Gửi của Bảng hàng thẻ (hàng 34: AC-1).
import assert from "node:assert/strict";
import { test } from "node:test";
import type { DongBang } from "../cot";
import { doiChon } from "./the";
import { chuThanhGui, duongGui } from "./thanh-gui";

test("thanh gửi: hiện khi có căn chọn", () => {
  const bang: [number, string | null][] = [
    [0, null],
    [1, "1 căn"],
    [4, "4 căn"],
  ];
  assert.equal(bang.length, 3, "số dòng bảng viết trước");
  assert.deepEqual(
    bang.map(([n]) => [n, chuThanhGui(n)]),
    bang,
  );
});

test("thanh gửi: đường sang màn Gửi giữ thứ tự chọn", () => {
  const d = (id: string) => ({ id, standardStatus: "Active" }) as DongBang;
  let chon: ReadonlySet<string> = new Set();
  for (const id of ["c3", "c1", "c2"]) chon = doiChon(chon, d(id));
  assert.equal(duongGui(chon), "/shares/new?can=c3,c1,c2");
  assert.equal(duongGui(chon, true), "/shares/new?can=c3,c1,c2&xem=1");
  assert.notEqual(duongGui(["c1", "c2", "c3"]), duongGui(chon), "đối chứng: thứ tự khác phải ra chuỗi khác");
});
