// Bảng nhà và nút theo vai — chép từ Tham chiếu §9 (ADR-0002). Vỏ chỉ đọc kết quả ở đây, không tự rẽ nhánh theo
// tên vai. Một người nhiều vai nhận hợp các nhà và nút.

export const ROLES = ["telesales", "listing_agent", "buyer_agent", "team_lead", "company_admin"] as const;
export type Role = (typeof ROLES)[number];

/** Nhà của cột biểu tượng trên máy tính, theo thứ tự hiện. */
export type Home = "today" | "inventory" | "shares" | "team" | "settings";
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
  /** Đường mở đầu khi vào `/`. */
  landing: string;
  /** Có ô «Gõ mã căn» hay không (Hỏi-3: chỉ vai có Bảng hàng). */
  unitJump: boolean;
}

export const HOME_PATH: Record<Home, string> = {
  today: "/today",
  inventory: "/inventory",
  shares: "/shares",
  team: "/team",
  settings: "/settings",
};

export const TAB_PATH: Record<Tab, string> = {
  today: "/today",
  inventory: "/inventory",
  send: "/shares",
  lead: "/leads/new",
  settings: "/settings",
  me: "/me",
};

export const ACTION_PATH: Record<Action, string> = {
  new_lead: "/leads/new",
  import: "/imports/new",
  export: "/exports/new",
};

// Bảng §9, mỗi vai một dòng.
const HOMES: Record<Role, Home[]> = {
  telesales: ["today"],
  listing_agent: ["today", "inventory"],
  buyer_agent: ["today", "inventory", "shares"],
  team_lead: ["today", "inventory", "shares", "team"],
  company_admin: ["settings"],
};

const ACTIONS: Record<Role, Action[]> = {
  telesales: ["new_lead"],
  listing_agent: ["new_lead", "import", "export"],
  buyer_agent: [],
  team_lead: ["new_lead", "export"],
  company_admin: ["import"],
};

const HOME_ORDER: Home[] = ["today", "inventory", "shares", "team", "settings"];
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

  return {
    homes,
    tabs: TAB_ORDER.filter((t) => tabSet.has(t)),
    actions: ACTION_ORDER.filter((a) => actionSet.has(a)),
    landing: adminOnly ? HOME_PATH.settings : HOME_PATH.today,
    unitJump: hasBoard,
  };
}

/** Tên nhà trên màn — nhãn của CONTEXT.md; ô gõ mã căn khớp chữ gõ với tên này. */
export const HOME_LABEL: Record<Home, string> = {
  today: "Hôm nay",
  inventory: "Bảng hàng",
  shares: "Đã gửi",
  team: "Đội",
  settings: "Cài đặt sàn",
};

/** Nhà mà một đường thuộc về — để vỏ biết đang ở nhà nào. Hồ sơ căn thuộc Bảng hàng, Lịch xem thuộc Đã gửi. */
export function homeOfPath(path: string): Home | null {
  const first = `/${path.split("/")[1] ?? ""}`;
  if (first === "/today") return "today";
  if (first === "/inventory" || first === "/units") return "inventory";
  if (first === "/shares" || first === "/viewings") return "shares";
  if (first === "/team") return "team";
  if (first === "/settings") return "settings";
  return null;
}

/**
 * Cột thứ hai của từng nhà trên máy tính (§9): `false` = có cột, mặc định gập; `true` = có cột, mặc định mở.
 * Nhà vắng trong bảng (Hôm nay, Đội) không có cột thứ hai. Hồ sơ căn mặc định gập như Bảng hàng.
 */
export const SECOND_COLUMN_OPEN_BY_DEFAULT: Partial<Record<Home, boolean>> = {
  inventory: false,
  shares: true,
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
