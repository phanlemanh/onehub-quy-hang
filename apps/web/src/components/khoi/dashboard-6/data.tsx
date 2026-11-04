// chuyển thể dashboard-6 (ReUI Pro, hàng 42): kiểu dữ liệu của khối — giữ MetricCard, CrewMember, QueueAction; bỏ
// DemandPoint, DemandRangePreset (vùng biểu đồ và bộ chọn ngày đã bỏ) và mọi mảng demo (dữ liệu là prop của màn).
import type { ReactNode } from "react";

import type { BadgeProps } from "@/components/reui/badge";

export interface MetricCard {
  id: string;
  label: string;
  value: string;
  detail: string;
  /** Chữ của nhãn bên phải ô số (khối gốc: phần trăm đổi). */
  change: string;
  /** Biểu tượng trong nhãn (khối gốc: mũi tên xu hướng). */
  changeIcon?: ReactNode;
  variant: BadgeProps["variant"];
  icon: ReactNode;
}

export type CrewStatus = "tuoi" | "chu-y" | "cu";

export interface CrewMember {
  id: string;
  name: string;
  role: string;
  initials: string;
  /** Cột phụ (khối gốc: District) — ẩn dưới `sm`, lên dòng phụ dưới tên. */
  location: string;
  coverage: number;
  /** Cột số (khối gốc: Relief). */
  reliefHours: number;
  notes: string;
  status: CrewStatus;
}

export interface QueueAction {
  id: string;
  title: string;
  detail: ReactNode;
  variant: BadgeProps["variant"];
  icon: ReactNode;
}

export const STATUS_BADGES: Record<CrewStatus, { label: string; variant: BadgeProps["variant"]; barClassName: string }> = {
  tuoi: { label: "Tươi", variant: "success-light", barClassName: "bg-success" },
  "chu-y": { label: "Cần chú ý", variant: "warning-light", barClassName: "bg-warning" },
  cu: { label: "Cũ", variant: "destructive-light", barClassName: "bg-destructive" },
};
