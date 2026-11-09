/**
 * Nhóm việc của các vai khác đầu chủ trên Hôm nay (hồ sơ hom-nay-mot-danh-sach-viec). Mã là nghĩa, cố định; nhãn mặc định
 * nằm ở sổ từ vựng (`TAP_DONG.nhomViec`) để sàn đổi tên. Sàn chưa ẩn hay đổi thứ tự được — điều khoá K33.
 */
import { TAP_DONG } from "../labels";

export type MaNhomVai = keyof typeof TAP_DONG.nhomViec;
export type VaiNhom = "team_lead" | "telesales" | "buyer_agent";

/** Lúc tin của khách thôi là việc: tính từ mốc của tin (K33). */
export const MOC_VIEC_DAU_KHACH_GIO = 48;

export const NHOM_VAI: readonly { code: MaNhomVai; label: string; vai: VaiNhom; coHan: boolean }[] = [
  { code: "lead_overdue", label: TAP_DONG.nhomViec.lead_overdue, vai: "team_lead", coHan: true },
  { code: "lead_unrouted", label: TAP_DONG.nhomViec.lead_unrouted, vai: "team_lead", coHan: true },
  { code: "lead_returned", label: TAP_DONG.nhomViec.lead_returned, vai: "telesales", coHan: false },
  { code: "buyer_reaction", label: TAP_DONG.nhomViec.buyer_reaction, vai: "buyer_agent", coHan: false },
  { code: "buyer_changed", label: TAP_DONG.nhomViec.buyer_changed, vai: "buyer_agent", coHan: false },
  { code: "buyer_new_match", label: TAP_DONG.nhomViec.buyer_new_match, vai: "buyer_agent", coHan: false },
];
