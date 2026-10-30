import type { Action, Home, Tab } from "@quy-hang/core";
import {
  BellIcon,
  CalendarCheckIcon,
  FileSpreadsheetIcon,
  LayoutGridIcon,
  type LucideIcon,
  PhoneIncomingIcon,
  SendIcon,
  SettingsIcon,
  UploadIcon,
  UserIcon,
  UsersIcon,
} from "lucide-react";

// Nhãn nhà, tab và nút trên vỏ — lấy theo Tham chiếu §9 và CONTEXT.md.
export const HOME_LABEL: Record<Home, { label: string; icon: LucideIcon }> = {
  today: { label: "Hôm nay", icon: CalendarCheckIcon },
  inventory: { label: "Bảng hàng", icon: LayoutGridIcon },
  shares: { label: "Đã gửi", icon: SendIcon },
  team: { label: "Đội", icon: UsersIcon },
  settings: { label: "Cài đặt sàn", icon: SettingsIcon },
};

export const TAB_LABEL: Record<Tab, { label: string; icon: LucideIcon }> = {
  today: HOME_LABEL.today,
  inventory: HOME_LABEL.inventory,
  send: { label: "Gửi", icon: SendIcon },
  lead: { label: "Lead", icon: PhoneIncomingIcon },
  settings: HOME_LABEL.settings,
  me: { label: "Tôi", icon: UserIcon },
};

export const ACTION_LABEL: Record<Action, { label: string; icon: LucideIcon }> = {
  new_lead: { label: "+ Lead", icon: PhoneIncomingIcon },
  import: { label: "Nhập Excel", icon: FileSpreadsheetIcon },
  export: { label: "Phát hàng", icon: UploadIcon },
};

export const NOTIFICATION_ICON = BellIcon;
