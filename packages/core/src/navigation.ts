// Bảng nhà và nút theo vai — chép từ Tham chiếu §9 (ADR-0002). Vỏ chỉ đọc kết quả ở đây, không tự rẽ nhánh theo
// tên vai. Một người nhiều vai nhận hợp các nhà và nút.

export const ROLES = ["telesales", "listing_agent", "buyer_agent", "team_lead", "company_admin"] as const;
export type Role = (typeof ROLES)[number];

/** Nhà của cột biểu tượng trên máy tính, theo thứ tự hiện. */
export type Home = "today" | "inventory" | "shares" | "contacts" | "team" | "settings";
/** Tab dưới trên điện thoại, theo thứ tự hiện. */
export type Tab = "today" | "inventory" | "send" | "lead" | "settings" | "me";
/** Nút của thanh trên máy tính. */
export type Action = "new_lead" | "import" | "export";

export interface Navigation {
  /** Nhà của cột biểu tượng (máy tính). Rỗng khi người không có cột nhà. */
  homes: Home[];
  /** Tab dưới (điện thoại). */
  tabs: Tab[];
  /** Nút của thanh trên (máy tính). */
  actions: Action[];
  /** Việc tạo trên điện thoại (nút «+»): §9 — điện thoại không có Nhập Excel, Xuất bảng hàng; vai có tab Lead không lặp nút. */
  mobileActions: Action[];
  /** Đường mở đầu khi vào `/`. */
  landing: string;
  /** Có ô «Gõ mã căn» hay không (Hỏi-3: chỉ vai có Bảng hàng). */
  unitJump: boolean;
}

export const HOME_PATH: Record<Home, string> = {
  today: "/today",
  inventory: "/inventory",
  shares: "/shares",
  contacts: "/contacts",
  team: "/team",
  settings: "/settings",
};

export const TAB_PATH: Record<Tab, string> = {
  today: "/today",
  inventory: "/inventory",
  send: "/shares",
  lead: "/leads/new",
  settings: "/settings",
  // Tab Tôi là đường vào «Cá nhân» của khu Cài đặt (hàng cai-dat-hop-nhat).
  me: "/settings/personal",
};

export const ACTION_PATH: Record<Action, string> = {
  new_lead: "/leads/new",
  import: "/imports/new",
  export: "/exports/new",
};

// Bảng §9, mỗi vai một dòng. Mọi vai có cột nhà có nhà Cài đặt (hàng cai-dat-hop-nhat): nhóm Cá nhân ai cũng thấy,
// nhóm Sàn chỉ quản trị. Telesales không có cột nhà nên vào Cài đặt qua menu tài khoản.
const HOMES: Record<Role, Home[]> = {
  telesales: ["today"],
  listing_agent: ["today", "inventory", "contacts", "settings"],
  buyer_agent: ["today", "inventory", "shares", "settings"],
  team_lead: ["today", "inventory", "shares", "contacts", "team", "settings"],
  company_admin: ["settings"],
};

const ACTIONS: Record<Role, Action[]> = {
  telesales: ["new_lead"],
  listing_agent: ["new_lead", "import", "export"],
  buyer_agent: [],
  team_lead: ["new_lead", "import", "export"],
  // ADR-0011: quản trị chỉ quản mẫu file ở Cài đặt sàn, không tự nhập.
  company_admin: [],
};

/** Việc tạo có trên điện thoại (§9: không có Nhập Excel, Xuất bảng hàng). */
const MOBILE_ACTIONS: Action[] = ["new_lead"];

// Liên hệ (hàng 103, Hỏi-1): nhà thứ sáu, chỉ vai đọc được liên hệ — Đầu chủ, Trưởng nhóm (ADR-0021 qđ 3).
export const HOME_ORDER: Home[] = ["today", "inventory", "shares", "contacts", "team", "settings"];
const ACTION_ORDER: Action[] = ["new_lead", "import", "export"];
const TAB_ORDER: Tab[] = ["today", "inventory", "send", "lead", "settings", "me"];

/** Vai có Bảng hàng — mang cột nhà, ô gõ mã căn và tab Bảng hàng. */
const BOARD_ROLES: Role[] = ["listing_agent", "buyer_agent", "team_lead"];

export function isRole(value: string): value is Role {
  return (ROLES as readonly string[]).includes(value);
}

export function navigationFor(roles: readonly string[]): Navigation {
  const own = ROLES.filter((r) => roles.includes(r));
  const homeSet = new Set(own.flatMap((r) => HOMES[r]));
  const actionSet = new Set(own.flatMap((r) => ACTIONS[r]));
  const hasBoard = own.some((r) => BOARD_ROLES.includes(r));
  const adminOnly = own.length > 0 && own.every((r) => r === "company_admin");

  // Telesales không có cột nhà: thanh trên chỉ Hôm nay và «+ Lead». Có thêm vai khác thì cột hiện như vai đó.
  const hasRail = own.some((r) => r !== "telesales");
  const homes = hasRail ? HOME_ORDER.filter((h) => homeSet.has(h)) : [];

  const tabSet = new Set<Tab>(["me"]);
  if (homeSet.has("today")) tabSet.add("today");
  if (hasBoard) tabSet.add("inventory");
  if (homeSet.has("shares")) tabSet.add("send");
  // Telesales nhận lead bằng tab; vai có Bảng hàng nhận lead từ nút, không thêm tab.
  if (own.includes("telesales") && !hasBoard) tabSet.add("lead");
  // Điện thoại không có Cài đặt sàn — trừ người chỉ Quản trị sàn (Hỏi-2).
  if (adminOnly) tabSet.add("settings");

  const actions = ACTION_ORDER.filter((a) => actionSet.has(a));
  return {
    homes,
    tabs: TAB_ORDER.filter((t) => tabSet.has(t)),
    actions,
    mobileActions: actions.filter((a) => MOBILE_ACTIONS.includes(a) && !(a === "new_lead" && tabSet.has("lead"))),
    landing: adminOnly ? HOME_PATH.settings : HOME_PATH.today,
    unitJump: hasBoard,
  };
}

/** Mục Cá nhân của khu Cài đặt — đích của tab Tôi, menu tài khoản và nhà Cài đặt với vai không quản trị. */
export const PERSONAL_SETTINGS_PATH = "/settings/personal";
/** Mục đầu của nhóm Sàn — Người dùng. */
export const COMPANY_SETTINGS_PATH = "/settings/users";

/** Người có quản Cài đặt của sàn đang làm không — nhóm «Sàn» của khu Cài đặt chỉ cho người này. */
export function canManageCompany(roles: readonly string[]): boolean {
  return roles.includes("company_admin");
}

/** Nhà Cài đặt mở vào mục đầu theo quyền: quản trị sàn vào Người dùng, vai khác vào Cá nhân. */
export function settingsLanding(roles: readonly string[]): string {
  return canManageCompany(roles) ? COMPANY_SETTINGS_PATH : PERSONAL_SETTINGS_PATH;
}

/**
 * Tab dưới đang chọn của một đường — đúng một tab, hay null. Cá nhân nằm dưới /settings nhưng thuộc tab Tôi; mục sàn
 * thuộc tab Cài đặt sàn. Đường khớp dài nhất thắng, nên hai tab không bao giờ cùng sáng.
 */
export function activeTab(pathname: string, tabs: readonly Tab[]): Tab | null {
  const khop = (duong: string) => pathname === duong || pathname.startsWith(`${duong}/`);
  if (tabs.includes("me") && (khop(PERSONAL_SETTINGS_PATH) || khop("/me"))) return "me";
  let best: Tab | null = null;
  let len = -1;
  for (const tab of tabs) {
    const duong = TAB_PATH[tab];
    if (tab !== "me" && khop(duong) && duong.length > len) {
      best = tab;
      len = duong.length;
    }
  }
  return best;
}

/** Người được đổi đầu chủ hàng loạt trên Bảng hàng: chỉ người mang vai Trưởng nhóm (hàng 89). Máy chủ chặn độc lập. */
export function canReassignListingAgents(roles: readonly string[]): boolean {
  return roles.includes("team_lead");
}

/** Tên nhà trên màn — nhãn của CONTEXT.md; ô gõ mã căn khớp chữ gõ với tên này. */
export const HOME_LABEL: Record<Home, string> = {
  today: "Hôm nay",
  inventory: "Bảng hàng",
  shares: "Đã gửi",
  contacts: "Liên hệ",
  team: "Đội",
  settings: "Cài đặt",
};

/** Nhà mà một đường thuộc về — để vỏ biết đang ở nhà nào. Hồ sơ căn thuộc Bảng hàng, Lịch xem thuộc Đã gửi. */
export function homeOfPath(path: string): Home | null {
  const first = `/${path.split("/")[1] ?? ""}`;
  if (first === "/today") return "today";
  if (first === "/inventory" || first === "/units") return "inventory";
  if (first === "/shares" || first === "/viewings") return "shares";
  if (first === "/contacts") return "contacts";
  if (first === "/team") return "team";
  if (first === "/settings") return "settings";
  return null;
}

/** Khu bản mẫu của design-pass: đường ở đây không thuộc nhà nào, trang khai màn thật nó đứng thay. */
export const KHU_BAN_MAU = "/proto/";

export interface DuongVo {
  duong: string;
  thamSo: string;
}

/**
 * Địa chỉ vỏ đọc để tính nhà, tiêu đề, tab và mục sáng. Chỉ nhận địa chỉ khai ở khu bản mẫu và trang mẫu sống (`mau`):
 * màn thật không bao giờ đổi địa chỉ. Địa chỉ không thuộc nhà nào thì giữ đường thật.
 */
export function duongCuaVo({
  pathname,
  thamSo = "",
  khai,
  mau = false,
}: {
  pathname: string;
  thamSo?: string;
  khai?: string | null;
  mau?: boolean;
}): DuongVo {
  const that = { duong: pathname, thamSo };
  if (!khai || (!mau && !pathname.startsWith(KHU_BAN_MAU))) return that;
  const [duong = "", thamSoKhai = ""] = khai.split("?");
  return homeOfPath(duong) === null ? that : { duong, thamSo: thamSoKhai };
}

/**
 * Cột thứ hai của từng nhà trên máy tính (§9): `true` = có cột, mặc định mở. Mọi nhà có cột thứ hai và mặc định mở
 * (chủ kho 02/11, hàng 91: «Mặc định luôn giữ và có sub nav»); người gập thì nhớ theo người, sàn, nhà.
 */
// Record đủ mọi nhà (luật đợt 68): thêm một nhà mà quên khai cột thứ hai là lỗi biên dịch, không lặng lẽ mất cột.
export const SECOND_COLUMN_OPEN_BY_DEFAULT: Record<Home, boolean> = {
  today: true,
  inventory: true,
  shares: true,
  contacts: true,
  team: true,
  settings: true,
};

/** Khoá nhớ cột thứ hai mở hay gập — theo người, sàn đang làm và nhà (Hỏi-1). */
export function secondColumnKey(userId: string, companyId: string, home: Home): string {
  return `${userId}:${companyId}:${home}`;
}

/** Cột thứ hai của nhà có mở không: người đã chọn thì theo người, chưa thì theo mặc định. */
export function isSecondColumnOpen(home: Home, remembered: boolean | undefined): boolean {
  const byDefault = SECOND_COLUMN_OPEN_BY_DEFAULT[home];
  if (byDefault === undefined) return false;
  return remembered ?? byDefault;
}

function fold(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Ô «Gõ mã căn»: chữ khớp tên một nhà của người (không phân biệt dấu, hoa thường) → đường của nhà đó; còn lại là
 * mã căn → /units/<mã>. Chuỗi rỗng → null.
 */
export function resolveJump(text: string, homes: readonly Home[]): string | null {
  const typed = text.trim();
  if (!typed) return null;
  const key = fold(typed);
  const home = homes.find((h) => fold(HOME_LABEL[h]) === key);
  if (home) return HOME_PATH[home];
  return `/units/${encodeURIComponent(typed)}`;
}
