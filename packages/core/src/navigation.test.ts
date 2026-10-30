import assert from "node:assert/strict";
import { test } from "node:test";
import { navigationFor } from "./navigation";

// Bảng §9 của Tham chiếu, đọc theo cột vai.
test("Telesales: không cột nhà, không ô gõ mã căn, điện thoại Hôm nay · Lead · Tôi", () => {
  const nav = navigationFor(["telesales"]);
  assert.deepEqual(nav.homes, []);
  assert.deepEqual(nav.tabs, ["today", "lead", "me"]);
  assert.deepEqual(nav.actions, ["new_lead"]);
  assert.equal(nav.unitJump, false);
  assert.equal(nav.landing, "/today");
});

test("Đầu chủ: Hôm nay, Bảng hàng; + Lead, Nhập Excel, Phát hàng", () => {
  const nav = navigationFor(["listing_agent"]);
  assert.deepEqual(nav.homes, ["today", "inventory"]);
  assert.deepEqual(nav.tabs, ["today", "inventory", "me"]);
  assert.deepEqual(nav.actions, ["new_lead", "import", "export"]);
  assert.equal(nav.unitJump, true);
});

test("Đầu khách: thêm Đã gửi, không nút nào", () => {
  const nav = navigationFor(["buyer_agent"]);
  assert.deepEqual(nav.homes, ["today", "inventory", "shares"]);
  assert.deepEqual(nav.tabs, ["today", "inventory", "send", "me"]);
  assert.deepEqual(nav.actions, []);
  assert.equal(nav.unitJump, true);
});

test("Trưởng nhóm: thêm Đội; + Lead, Phát hàng; điện thoại không có Đội", () => {
  const nav = navigationFor(["team_lead"]);
  assert.deepEqual(nav.homes, ["today", "inventory", "shares", "team"]);
  assert.deepEqual(nav.tabs, ["today", "inventory", "send", "me"]);
  assert.deepEqual(nav.actions, ["new_lead", "export"]);
});

test("Chỉ Quản trị sàn: mở vào Cài đặt sàn, điện thoại Cài đặt sàn · Tôi, không ô gõ mã căn", () => {
  const nav = navigationFor(["company_admin"]);
  assert.deepEqual(nav.homes, ["settings"]);
  assert.deepEqual(nav.tabs, ["settings", "me"]);
  assert.deepEqual(nav.actions, ["import"]);
  assert.equal(nav.landing, "/settings");
  assert.equal(nav.unitJump, false);
});

test("Nhiều vai nhận hợp các nhà; quản trị kèm vai khác mở vào Hôm nay, điện thoại không có Cài đặt sàn", () => {
  const nav = navigationFor(["team_lead", "company_admin"]);
  assert.deepEqual(nav.homes, ["today", "inventory", "shares", "team", "settings"]);
  assert.deepEqual(nav.tabs, ["today", "inventory", "send", "me"]);
  assert.deepEqual(nav.actions, ["new_lead", "import", "export"]);
  assert.equal(nav.landing, "/today");
});

test("Telesales kèm Đầu chủ có cột nhà và tab Bảng hàng thay tab Lead", () => {
  const nav = navigationFor(["telesales", "listing_agent"]);
  assert.deepEqual(nav.homes, ["today", "inventory"]);
  assert.deepEqual(nav.tabs, ["today", "inventory", "me"]);
});

test("Mã vai lạ bị bỏ qua", () => {
  assert.deepEqual(navigationFor(["owner", "telesales"]), navigationFor(["telesales"]));
});
