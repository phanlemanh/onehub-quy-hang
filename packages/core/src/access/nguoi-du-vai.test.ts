// Người mang đủ năm vai thấy mọi nhà và nút tạo; người chỉ cấu hình vẫn chỉ có Cài đặt (hàng chu-san-du-vai, AC-5).
import assert from "node:assert/strict";
import { test } from "node:test";

import { navigationFor } from "../navigation";
import { DU_NAM_VAI } from "./goi-vai";

test("đủ năm vai: sáu nhà, ba nút tạo, mở vào Hôm nay", () => {
  const nav = navigationFor(DU_NAM_VAI);
  assert.deepEqual(nav.homes, ["today", "inventory", "shares", "contacts", "team", "settings"]);
  assert.deepEqual(nav.actions, ["new_lead", "import", "export"]);
  assert.equal(nav.unitJump, true);
  assert.equal(nav.landing, "/today");
});

test("đối chứng: chỉ Quản trị sàn thì một nhà Cài đặt, không nút tạo, không ô gõ mã căn", () => {
  const nav = navigationFor(["company_admin"]);
  assert.deepEqual(nav.homes, ["settings"]);
  assert.deepEqual(nav.actions, []);
  assert.equal(nav.unitJump, false);
});
