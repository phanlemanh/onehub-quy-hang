// Chuỗi thao tác trên các ô vai của hộp Mời, Sửa (hàng chu-san-du-vai, AC-3): mảng vai gửi lên API là kết quả của chuỗi này.
import assert from "node:assert/strict";
import { test } from "node:test";

import { apDoiVai } from "./vai-trong-hop";

/** Một lần bấm ô: ô Checkbox trả về mảng mới theo nếp của ChoiceChecks, rồi hộp áp luật kéo theo. */
const bam = (vai: string[], ma: string) =>
  apDoiVai(vai, vai.includes(ma) ? vai.filter((x) => x !== ma) : [...vai, ma]);
const tap = (a: string[]) => [...a].sort();
const NAM = ["buyer_agent", "company_admin", "listing_agent", "team_lead", "telesales"];

test("tích Quản trị sàn thì đủ năm vai; bỏ Telesales thì còn bốn, ô đã bỏ không tự tích lại", () => {
  const tich = bam([], "company_admin");
  assert.deepEqual(tap(tich), NAM);
  const bo = bam(tich, "telesales");
  assert.deepEqual(tap(bo), ["buyer_agent", "company_admin", "listing_agent", "team_lead"]);
  assert.deepEqual(tap(bam(bo, "buyer_agent")), ["company_admin", "listing_agent", "team_lead"], "gỡ tiếp không kéo Telesales về");
});

test("người chỉ mang Telesales, tích Trưởng nhóm: giữ vai cũ, thêm đúng vai kéo theo", () => {
  assert.deepEqual(tap(bam(["telesales"], "team_lead")), ["buyer_agent", "listing_agent", "team_lead", "telesales"]);
});

test("người đủ năm vai, bỏ bốn vai làm việc: còn đúng Quản trị sàn", () => {
  let vai = NAM;
  for (const ma of ["telesales", "listing_agent", "buyer_agent", "team_lead"]) vai = bam(vai, ma);
  assert.deepEqual(vai, ["company_admin"]);
});

test("mở hộp Sửa, không bấm ô nào: mảng không đổi", () => {
  const dangCo = ["company_admin"];
  assert.deepEqual(apDoiVai(dangCo, dangCo), dangCo);
});

test("ô không có vai kéo theo: chỉ thêm đúng ô ấy", () => {
  assert.deepEqual(bam([], "telesales"), ["telesales"]);
});
