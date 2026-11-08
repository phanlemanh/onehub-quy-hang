// Câu sau khi ghi của màn Nhập đếm theo trạng thái thật của căn (hàng can-nhap-len-bang-chung, AC-9).
import assert from "node:assert/strict";
import { test } from "node:test";
import { cauTrangThaiGhi } from "./goi-api";
import type { KetQuaDong } from "./trang-thai";

const d = (row: number, standardStatus?: string): KetQuaDong => ({ row, action: "create", reason: "căn mới", ...(standardStatus && { standardStatus }) });

test("câu sau ghi đếm căn lên Đang bán và căn ở Chưa đủ để rao", () => {
  assert.equal(cauTrangThaiGhi([d(2, "Active"), d(3, "Active")]), "2 căn lên Đang bán", "bỏ vế bằng 0");
  assert.equal(cauTrangThaiGhi([d(2, "Active"), d(3, "Incomplete"), d(4, "Pending")]), "1 căn lên Đang bán, 1 căn ở Đang giao dịch, 1 căn ở Chưa đủ để rao");
  assert.equal(cauTrangThaiGhi([d(2)]), "", "dòng không mang trạng thái (bỏ, tin bổ sung) không đếm");
});
