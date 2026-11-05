import assert from "node:assert/strict";
import { test } from "node:test";
import {
  type Action,
  activeTab,
  canReassignListingAgents,
  HOME_LABEL,
  HOME_ORDER,
  homeOfPath,
  isSecondColumnOpen,
  type Navigation,
  navigationFor,
  resolveJump,
  type Role,
  ROLES,
  secondColumnKey,
  settingsLanding,
  type Tab,
  TAB_PATH,
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

test("Đầu chủ: Hôm nay, Bảng hàng; + Lead, Nhập Excel, Xuất bảng hàng", () => {
  const nav = navigationFor(["listing_agent"]);
  assert.deepEqual(nav.homes, ["today", "inventory", "contacts", "settings"]);
  assert.deepEqual(nav.tabs, ["today", "inventory", "me"]);
  assert.deepEqual(nav.actions, ["new_lead", "import", "export"]);
  assert.equal(nav.unitJump, true);
});

test("Đầu khách: thêm Đã gửi, không nút nào", () => {
  const nav = navigationFor(["buyer_agent"]);
  assert.deepEqual(nav.homes, ["today", "inventory", "shares", "settings"]);
  assert.deepEqual(nav.tabs, ["today", "inventory", "send", "me"]);
  assert.deepEqual(nav.actions, []);
  assert.equal(nav.unitJump, true);
});

test("Trưởng nhóm: thêm Đội; + Lead, Nhập Excel (ADR-0011), Xuất bảng hàng; điện thoại không có Đội", () => {
  const nav = navigationFor(["team_lead"]);
  assert.deepEqual(nav.homes, ["today", "inventory", "shares", "contacts", "team", "settings"]);
  assert.deepEqual(nav.tabs, ["today", "inventory", "send", "me"]);
  assert.deepEqual(nav.actions, ["new_lead", "import", "export"]);
  assert.deepEqual(nav.mobileActions, ["new_lead"]);
});

test("Chỉ Quản trị sàn: mở vào Cài đặt sàn, điện thoại Cài đặt sàn · Tôi, không ô gõ mã căn", () => {
  const nav = navigationFor(["company_admin"]);
  assert.deepEqual(nav.homes, ["settings"]);
  assert.deepEqual(nav.tabs, ["settings", "me"]);
  assert.deepEqual(nav.actions, []);
  assert.equal(nav.landing, "/settings");
  assert.equal(nav.unitJump, false);
});

test("Nhiều vai nhận hợp các nhà; quản trị kèm vai khác mở vào Hôm nay, điện thoại không có Cài đặt sàn", () => {
  const nav = navigationFor(["team_lead", "company_admin"]);
  assert.deepEqual(nav.homes, ["today", "inventory", "shares", "contacts", "team", "settings"]);
  assert.deepEqual(nav.tabs, ["today", "inventory", "send", "me"]);
  assert.deepEqual(nav.actions, ["new_lead", "import", "export"]);
  assert.equal(nav.landing, "/today");
});

test("Telesales kèm Đầu chủ có cột nhà và tab Bảng hàng thay tab Lead", () => {
  const nav = navigationFor(["telesales", "listing_agent"]);
  assert.deepEqual(nav.homes, ["today", "inventory", "contacts", "settings"]);
  assert.deepEqual(nav.tabs, ["today", "inventory", "me"]);
});

test("Mã vai lạ bị bỏ qua", () => {
  assert.deepEqual(navigationFor(["owner", "telesales"]), navigationFor(["telesales"]));
});

// Ma trận viết trước: bảng nhà và nút theo vai chép từ Tham chiếu §9 (+ Hỏi-2, Hỏi-3 chốt ở Cổng Phạm vi 31/10).
// Năm vai × năm trường = 25 so sánh; hàm so trả lời lệch gọi tên vai và trường.
type Row = Pick<Navigation, "homes" | "tabs" | "actions" | "mobileActions" | "landing" | "unitJump">;
const SECTION_9: Record<Role, Row> = {
  telesales: { homes: [], tabs: ["today", "lead", "me"], actions: ["new_lead"], mobileActions: [], landing: "/today", unitJump: false },
  listing_agent: {
    homes: ["today", "inventory", "contacts", "settings"],
    tabs: ["today", "inventory", "me"],
    actions: ["new_lead", "import", "export"],
    mobileActions: ["new_lead"],
    landing: "/today",
    unitJump: true,
  },
  buyer_agent: {
    homes: ["today", "inventory", "shares", "settings"],
    tabs: ["today", "inventory", "send", "me"],
    actions: [],
    mobileActions: [],
    landing: "/today",
    unitJump: true,
  },
  team_lead: {
    homes: ["today", "inventory", "shares", "contacts", "team", "settings"],
    tabs: ["today", "inventory", "send", "me"],
    actions: ["new_lead", "import", "export"],
    mobileActions: ["new_lead"],
    landing: "/today",
    unitJump: true,
  },
  // ADR-0011: quản trị chỉ quản mẫu file, không có việc tạo.
  company_admin: { homes: ["settings"], tabs: ["settings", "me"], actions: [], mobileActions: [], landing: "/settings", unitJump: false },
};

const FIELDS = ["homes", "tabs", "actions", "mobileActions", "landing", "unitJump"] as const;

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

test("Năm vai × sáu trường khớp bảng §9 (30 so sánh)", () => {
  let compared = 0;
  for (const role of ROLES) {
    const got = navigationFor([role]);
    for (const field of FIELDS) {
      assert.deepEqual(got[field], SECTION_9[role][field], `${role}.${field}`);
      compared++;
    }
  }
  assert.equal(compared, 30);
  assert.deepEqual(diffTable(SECTION_9), []);
});

test("Đối chứng đỏ: bảng giả thiếu «Xuất bảng hàng» của Trưởng nhóm → hàm so gọi tên vai và nút", () => {
  const fake = { ...SECTION_9, team_lead: { ...SECTION_9.team_lead, actions: ["new_lead"] as Action[] } };
  const diff = diffTable(fake);
  assert.equal(diff.length, 1);
  assert.match(diff[0] ?? "", /^team_lead\.actions: .*"export"/);
});

test("Đối chứng đỏ: bảng giả cho Đầu chủ Nhập Excel trên điện thoại → hàm so gọi tên vai và trường", () => {
  const fake = { ...SECTION_9, listing_agent: { ...SECTION_9.listing_agent, mobileActions: ["new_lead", "import"] as Action[] } };
  const diff = diffTable(fake);
  assert.equal(diff.length, 1);
  assert.match(diff[0] ?? "", /^listing_agent\.mobileActions: .*"import"/);
});

test("Đầu chủ + Đầu khách nhận hợp nhà và nút", () => {
  const nav = navigationFor(["listing_agent", "buyer_agent"]);
  assert.deepEqual(nav.homes, ["today", "inventory", "shares", "contacts", "settings"]);
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

test("cột thứ hai: mọi nhà, mặc định mở", () => {
  // Lặp theo HOME_ORDER (luật đợt 68): nhà mới tự vào phép kiểm; ma trận viết trước kèm theo để HOME_ORDER không tự rỗng đi.
  const NHA = HOME_ORDER;
  assert.deepEqual([...NHA], ["today", "inventory", "shares", "contacts", "team", "settings"]);
  let dem = 0;
  for (const h of NHA) {
    assert.equal(isSecondColumnOpen(h, undefined), true, `${h}: mặc định phải mở`);
    assert.equal(isSecondColumnOpen(h, false), false, `${h}: người gập thì nhớ`);
    assert.equal(isSecondColumnOpen(h, true), true, `${h}: người mở thì nhớ`);
    dem++;
  }
  assert.equal(dem, NHA.length);
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

// Khu Cài đặt hợp nhất (hàng cai-dat-hop-nhat) — ma trận viết trước, bảy tổ hợp vai.
const TO_HOP: Record<string, string[]> = {
  telesales: ["telesales"],
  "đầu chủ": ["listing_agent"],
  "đầu khách": ["buyer_agent"],
  "trưởng nhóm": ["team_lead"],
  "quản trị": ["company_admin"],
  "quản trị + đầu chủ": ["company_admin", "listing_agent"],
  "telesales + đầu chủ": ["telesales", "listing_agent"],
};

/** Nhà Cài đặt: mọi tổ hợp có cột nhà mang «settings» ở cuối; telesales một mình không cột nhà. */
function lechNhaCaiDat(homesOf: (roles: string[]) => readonly string[]): string[] {
  const out: string[] = [];
  for (const [ten, roles] of Object.entries(TO_HOP)) {
    const homes = homesOf(roles);
    const dung = ten === "telesales" ? homes.length === 0 : homes.at(-1) === "settings";
    if (!dung) out.push(`${ten}: homes ${JSON.stringify(homes)}`);
  }
  return out;
}

test("Nhà Cài đặt ở đáy cột cho mọi tổ hợp có cột nhà (7 ô); nhãn «Cài đặt»", () => {
  assert.deepEqual(lechNhaCaiDat((r) => navigationFor(r).homes), []);
  assert.equal(HOME_LABEL.settings, "Cài đặt");
});

test("Đối chứng đỏ: bảng giả bỏ «settings» khỏi đầu chủ → gọi tên tổ hợp", () => {
  const gia = (r: string[]) => (r.length === 1 && r[0] === "listing_agent" ? ["today", "inventory"] : navigationFor(r).homes);
  assert.deepEqual(lechNhaCaiDat(gia), ['đầu chủ: homes ["today","inventory"]']);
});

const DICH_CAI_DAT: Record<string, string> = {
  "đầu chủ": "/settings/personal",
  "đầu khách": "/settings/personal",
  "trưởng nhóm": "/settings/personal",
  telesales: "/settings/personal",
  "quản trị": "/settings/users",
  "quản trị + đầu chủ": "/settings/users",
};

function lechDich(dich: (roles: string[]) => string): string[] {
  return Object.entries(DICH_CAI_DAT).flatMap(([ten, want]) => (dich(TO_HOP[ten] ?? []) === want ? [] : [`${ten}: ${dich(TO_HOP[ten] ?? [])}`]));
}

test("Nhà Cài đặt mở mục đầu theo quyền (6 ô); tab Tôi mở Cá nhân", () => {
  assert.deepEqual(lechDich(settingsLanding), []);
  assert.equal(TAB_PATH.me, "/settings/personal");
});

test("Đối chứng đỏ: hàm giả mở Người dùng cho trưởng nhóm → gọi tên tổ hợp", () => {
  const gia = (r: string[]) => (r.includes("team_lead") ? "/settings/users" : settingsLanding(r));
  assert.deepEqual(lechDich(gia), ["trưởng nhóm: /settings/users"]);
});

/** Tab điện thoại: chỉ quản trị một mình có «settings»; mọi tổ hợp có «me». */
function lechTab(tabsOf: (roles: string[]) => readonly Tab[]): string[] {
  const out: string[] = [];
  for (const [ten, roles] of Object.entries(TO_HOP)) {
    const tabs = tabsOf(roles);
    const coCaiDat = tabs.includes("settings");
    if (coCaiDat !== (ten === "quản trị") || !tabs.includes("me")) out.push(`${ten}: tabs ${JSON.stringify(tabs)}`);
  }
  return out;
}

test("Tab điện thoại: chỉ người chỉ quản trị có tab Cài đặt sàn, mọi tổ hợp có Tôi (7 ô)", () => {
  assert.deepEqual(lechTab((r) => navigationFor(r).tabs), []);
});

test("Đối chứng đỏ: bảng giả thêm tab Cài đặt sàn cho quản trị + đầu chủ → gọi tên tổ hợp", () => {
  const gia = (r: string[]) => (r.length === 2 && r.includes("company_admin") ? [...navigationFor(r).tabs, "settings" as Tab] : navigationFor(r).tabs);
  assert.deepEqual(lechTab(gia), ['quản trị + đầu chủ: tabs ["today","inventory","me","settings"]']);
});

// Tab đang chọn của người chỉ quản trị (tab Cài đặt sàn + Tôi): 4 đường × 2 tab, đúng một tab sáng.
const TAB_SANG: [string, Tab][] = [
  ["/settings/personal", "me"],
  ["/settings/users", "settings"],
  ["/settings/labels", "settings"],
  ["/me", "me"],
];

function lechTabSang(chon: (path: string, tabs: readonly Tab[]) => Tab | readonly Tab[] | null): string[] {
  const tabs: Tab[] = ["settings", "me"];
  const out: string[] = [];
  for (const [path, want] of TAB_SANG) {
    const got = chon(path, tabs);
    const sang = Array.isArray(got) ? got : got ? [got] : [];
    for (const tab of tabs) if (sang.includes(tab) !== (tab === want)) out.push(`${path}: ${tab} ${sang.includes(tab) ? "sáng" : "tắt"}${sang.length > 1 ? " — cả hai tab sáng" : ""}`);
  }
  return out;
}

test("Tab đang chọn theo đường: Cá nhân → Tôi, mục sàn → Cài đặt sàn (8 ô)", () => {
  assert.deepEqual(lechTabSang(activeTab), []);
});

test("Đối chứng đỏ: so tiền tố /settings → /settings/personal sáng cả hai tab", () => {
  const tienTo = (path: string, tabs: readonly Tab[]) => tabs.filter((t) => path === TAB_PATH[t] || path.startsWith(`${TAB_PATH[t].split("/").slice(0, 2).join("/")}/`));
  const lech = lechTabSang(tienTo);
  assert.ok(lech.includes("/settings/personal: settings sáng — cả hai tab sáng"), JSON.stringify(lech));
});

// Đổi đầu chủ hàng loạt (hàng 89, E1) — ma trận viết trước 6 tổ hợp vai.
const DOI_DAU_CHU: [string, string[], boolean][] = [
  ["trưởng nhóm", ["team_lead"], true],
  ["đầu chủ", ["listing_agent"], false],
  ["đầu khách", ["buyer_agent"], false],
  ["telesales", ["telesales"], false],
  ["quản trị", ["company_admin"], false],
  ["trưởng nhóm + đầu chủ", ["team_lead", "listing_agent"], true],
];
const lechDoiDauChu = (f: (roles: string[]) => boolean) => DOI_DAU_CHU.flatMap(([ten, roles, mong]) => (f(roles) === mong ? [] : [ten]));

test("Đổi đầu chủ hàng loạt: chỉ hai tổ hợp có Trưởng nhóm (6 ô)", () => {
  assert.equal(DOI_DAU_CHU.length, 6);
  assert.deepEqual(lechDoiDauChu(canReassignListingAgents), []);
});

test("Đối chứng đỏ: hàm giả cho đầu chủ đổi → gọi tên tổ hợp", () => {
  assert.deepEqual(lechDoiDauChu((r) => canReassignListingAgents(r) || r.includes("listing_agent")), ["đầu chủ"]);
});
