import { type Action, type Home, HOME_LABEL as HOME_NAME, type Tab } from "@quy-hang/core";
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
export const HOME_ITEM: Record<Home, { label: string; icon: LucideIcon }> = {
  today: { label: HOME_NAME.today, icon: CalendarCheckIcon },
  inventory: { label: HOME_NAME.inventory, icon: LayoutGridIcon },
  shares: { label: HOME_NAME.shares, icon: SendIcon },
  team: { label: HOME_NAME.team, icon: UsersIcon },
  settings: { label: HOME_NAME.settings, icon: SettingsIcon },
};

export const TAB_LABEL: Record<Tab, { label: string; icon: LucideIcon }> = {
  today: HOME_ITEM.today,
  inventory: HOME_ITEM.inventory,
  send: { label: "Gửi", icon: SendIcon },
  lead: { label: "Lead", icon: PhoneIncomingIcon },
  settings: HOME_ITEM.settings,
  me: { label: "Tôi", icon: UserIcon },
};

export const ACTION_LABEL: Record<Action, { label: string; icon: LucideIcon }> = {
  new_lead: { label: "+ Lead", icon: PhoneIncomingIcon },
  import: { label: "Nhập Excel", icon: FileSpreadsheetIcon },
  export: { label: "Xuất bảng hàng", icon: UploadIcon },
};

export const NOTIFICATION_ICON = BellIcon;
