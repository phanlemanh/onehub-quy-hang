// Phần thuần của khu Cài đặt hợp nhất (hàng cai-dat-hop-nhat): nhóm của cột mục lục, mục menu tài khoản, câu phạm vi
// và luật chặn mục sàn. Cột thứ hai, menu tài khoản và các trang chỉ dựng những gì các hàm này trả — bài kiểm gọi thẳng
// chúng. Quyền đọc từ `canManageCompany` của lõi, không rẽ nhánh theo tên vai ở đây.
import { canManageCompany, COMPANY_SETTINGS_PATH, PERSONAL_SETTINGS_PATH } from "@quy-hang/core";

export type MucCot = { label: string; href: string };
export type NhomCot = { tieuDe: string; muc: MucCot[] };

/** Tám mục của nhóm Sàn, theo thứ tự cột (Tham chiếu §9). */
export const MUC_SAN: readonly MucCot[] = [
  { label: "Người dùng", href: COMPANY_SETTINGS_PATH },
  { label: "Cách gọi", href: "/settings/labels" },
  { label: "Trường riêng", href: "/settings/fields" },
  { label: "Trạng thái", href: "/settings/statuses" },
  { label: "Luật chia lead", href: "/settings/lead-routing" },
  { label: "Thuế phí", href: "/settings/fees" },
  { label: "Mẫu", href: "/settings/templates" },
  // Hàng 70: từ điển của sàn — duyệt cách gõ lạ, sức khoẻ dữ liệu.
  { label: "Từ điển", href: "/settings/dictionary" },
  { label: "Xử lý bằng AI", href: "/settings/ai" },
  // Hàng 44: mức chia mặc định và ẩn mức chia của trang nhóm môi giới.
  { label: "Trang môi giới", href: "/settings/broker-page" },
];

export const MUC_CA_NHAN: MucCot = { label: "Cá nhân", href: PERSONAL_SETTINGS_PATH };

/** Tiêu đề nhóm Sàn trên cột và trên đường dẫn — mang tên sàn đang làm. */
export function tenNhomSan(tenSan: string): string {
  return `Sàn ${tenSan}`;
}

/** Cột mục lục của nhà Cài đặt: «Cá nhân» cho mọi người; «Sàn [Tên]» chỉ khi người quản Cài đặt của sàn đang làm. */
export function cotCaiDat(roles: readonly string[], tenSan: string): NhomCot[] {
  const nhom: NhomCot[] = [{ tieuDe: "Cá nhân", muc: [MUC_CA_NHAN] }];
  if (canManageCompany(roles)) nhom.push({ tieuDe: tenNhomSan(tenSan), muc: [...MUC_SAN] });
  return nhom;
}

/** Mục Cài đặt của menu tài khoản: «Cá nhân» cho mọi người; quản trị thêm «Cài đặt sàn» (ngưỡng hai lần bấm). */
export function mucTaiKhoan(roles: readonly string[]): MucCot[] {
  const muc: MucCot[] = [MUC_CA_NHAN];
  if (canManageCompany(roles)) muc.push({ label: "Cài đặt sàn", href: COMPANY_SETTINGS_PATH });
  return muc;
}

/** Câu phạm vi ngay dưới tiêu đề mục — một bảng cho mọi trang Cài đặt. */
export const PHAM_VI = {
  caNhan: "Áp cho tài khoản của bạn ở mọi sàn",
  san: (tenSan: string) => `Chỉ áp cho sàn ${tenSan}`,
} as const;

/** Dòng của nhóm Cá nhân chỉ áp cho máy đang dùng (cài lên màn hình chính, thông báo). */
export const PHAM_VI_MAY = "Trên máy này";

/** Câu báo khi người không quản trị bị chuyển khỏi một mục sàn (Hỏi-1). */
export const BAO_CHI_QUAN_TRI = "Mục này chỉ quản trị sàn mở được";
export const THAM_SO_CHI_QUAN_TRI = "chi-quan-tri";

/** Chặn mục sàn ở máy chủ của màn: người không quản Cài đặt của sàn đang làm → đường Cá nhân kèm câu báo; quản trị → null. */
export function chanMucSan(roles: readonly string[]): string | null {
  return canManageCompany(roles) ? null : `${PERSONAL_SETTINGS_PATH}?${THAM_SO_CHI_QUAN_TRI}=1`;
}
