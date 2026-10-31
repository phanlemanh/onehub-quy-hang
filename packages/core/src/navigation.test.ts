import assert from "node:assert/strict";
import { test } from "node:test";
import {
  type Action,
  homeOfPath,
  isSecondColumnOpen,
  type Navigation,
  navigationFor,
  resolveJump,
  type Role,
  ROLES,
  secondColumnKey,
} from "./navigation";

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

// Ma trận viết trước: bảng nhà và nút theo vai chép từ Tham chiếu §9 (+ Hỏi-2, Hỏi-3 chốt ở Cổng Phạm vi 31/10).
// Năm vai × năm trường = 25 so sánh; hàm so trả lời lệch gọi tên vai và trường.
type Row = Pick<Navigation, "homes" | "tabs" | "actions" | "landing" | "unitJump">;
const SECTION_9: Record<Role, Row> = {
  telesales: { homes: [], tabs: ["today", "lead", "me"], actions: ["new_lead"], landing: "/today", unitJump: false },
  listing_agent: {
    homes: ["today", "inventory"],
    tabs: ["today", "inventory", "me"],
    actions: ["new_lead", "import", "export"],
    landing: "/today",
    unitJump: true,
  },
  buyer_agent: {
    homes: ["today", "inventory", "shares"],
    tabs: ["today", "inventory", "send", "me"],
    actions: [],
    landing: "/today",
    unitJump: true,
  },
  team_lead: {
    homes: ["today", "inventory", "shares", "team"],
    tabs: ["today", "inventory", "send", "me"],
    actions: ["new_lead", "export"],
    landing: "/today",
    unitJump: true,
  },
  company_admin: { homes: ["settings"], tabs: ["settings", "me"], actions: ["import"], landing: "/settings", unitJump: false },
};

const FIELDS = ["homes", "tabs", "actions", "landing", "unitJump"] as const;

function diffTable(table: Record<Role, Row>): string[] {
  const out: string[] = [];
  for (const role of ROLES) {
    const got = navigationFor([role]);
    for (const field of FIELDS) {
      const want = JSON.stringify(table[role][field]);
      const have = JSON.stringify(got[field]);
      if (want !== have) out.push(`${role}.${field}: bảng ${want}, máy ${have}`);
    }
  }
  return out;
}

test("Năm vai × năm trường khớp bảng §9 (25 so sánh)", () => {
  let compared = 0;
  for (const role of ROLES) {
    const got = navigationFor([role]);
    for (const field of FIELDS) {
      assert.deepEqual(got[field], SECTION_9[role][field], `${role}.${field}`);
      compared++;
    }
  }
  assert.equal(compared, 25);
  assert.deepEqual(diffTable(SECTION_9), []);
});

test("Đối chứng đỏ: bảng giả thiếu «Phát hàng» của Trưởng nhóm → hàm so gọi tên vai và nút", () => {
  const fake = { ...SECTION_9, team_lead: { ...SECTION_9.team_lead, actions: ["new_lead"] as Action[] } };
  const diff = diffTable(fake);
  assert.equal(diff.length, 1);
  assert.match(diff[0] ?? "", /^team_lead\.actions: .*"export"/);
});

test("Đầu chủ + Đầu khách nhận hợp nhà và nút", () => {
  const nav = navigationFor(["listing_agent", "buyer_agent"]);
  assert.deepEqual(nav.homes, ["today", "inventory", "shares"]);
  assert.deepEqual(nav.actions, ["new_lead", "import", "export"]);
  assert.deepEqual(nav.tabs, ["today", "inventory", "send", "me"]);
});

test("Không vai nào: không nhà, không nút, không ô gõ mã căn", () => {
  const nav = navigationFor([]);
  assert.deepEqual(nav.homes, []);
  assert.deepEqual(nav.actions, []);
  assert.equal(nav.unitJump, false);
});

// Ô «Gõ mã căn» (AC-6).
test("Gõ tên nhà ra địa chỉ nhà, không phân biệt dấu và hoa thường", () => {
  const homes = navigationFor(["team_lead"]).homes;
  assert.equal(resolveJump("Bảng hàng", homes), "/inventory");
  assert.equal(resolveJump("bang hang", homes), "/inventory");
  assert.equal(resolveJump("hôm nay", homes), "/today");
  assert.equal(resolveJump("  ĐỘI ", homes), "/team");
});

test("Gõ mã căn ra /units/<mã>, mã được mã hoá URL", () => {
  const homes = navigationFor(["listing_agent"]).homes;
  assert.equal(resolveJump("A-12.05", homes), "/units/A-12.05");
  assert.equal(resolveJump("MAU A1205", homes), "/units/MAU%20A1205");
});

test("Chuỗi rỗng hay chỉ khoảng trắng ra null", () => {
  assert.equal(resolveJump("", ["today"]), null);
  assert.equal(resolveJump("   ", ["today"]), null);
});

test("Tên nhà vai không có thì coi là mã căn, không nhảy tới nhà đó", () => {
  const homes = navigationFor(["telesales"]).homes;
  assert.equal(resolveJump("Đội", homes), `/units/${encodeURIComponent("Đội")}`);
});

// Nhà của đường và cột thứ hai (AC-3).
test("Nhà của đường: hồ sơ căn thuộc Bảng hàng, Lịch xem thuộc Đã gửi", () => {
  assert.equal(homeOfPath("/units/MAU-A1205"), "inventory");
  assert.equal(homeOfPath("/viewings"), "shares");
  assert.equal(homeOfPath("/settings/users"), "settings");
  assert.equal(homeOfPath("/me"), null);
});

test("Cột thứ hai: mặc định gập ở Bảng hàng, mở ở Đã gửi và Cài đặt sàn, không có ở Hôm nay", () => {
  assert.equal(isSecondColumnOpen("inventory", undefined), false);
  assert.equal(isSecondColumnOpen("shares", undefined), true);
  assert.equal(isSecondColumnOpen("settings", undefined), true);
  assert.equal(isSecondColumnOpen("today", true), false);
  assert.equal(isSecondColumnOpen("inventory", true), true);
  assert.equal(isSecondColumnOpen("shares", false), false);
});

test("Khoá nhớ tách theo người, sàn và nhà", () => {
  const keys = new Set([
    secondColumnKey("u1", "c1", "inventory"),
    secondColumnKey("u2", "c1", "inventory"),
    secondColumnKey("u1", "c2", "inventory"),
    secondColumnKey("u1", "c1", "shares"),
  ]);
  assert.equal(keys.size, 4);
});
