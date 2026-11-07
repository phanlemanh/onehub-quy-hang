// Phần thuần của màn Liên hệ (hàng 103): kiểu dữ liệu trả từ `/api/v1/contacts/**`, chữ trên màn, chọn lối tìm, đọc API.
// Số rõ chỉ đi qua `moSo` và chỉ sống trong state của hồ sơ — không lưu kho trên máy, không vào URL (thiết kế §Đặc tả UX 4).
import { PHA_NHAN, type Pha } from "@quy-hang/core/contacts";

export type DongLienHe = {
  id: string;
  name: string | null;
  contactTypes: string[];
  status: "lead" | "contact";
  holderName: string | null;
  phoneCount: number;
  openOpportunities: number;
  listingCount: number;
};
export type SoChe = { phoneId: string; label: string | null; isPrimary: boolean; tail: string };
export type CoHoi =
  | { side: "seller"; leadId: string; need: string; unit: { buildingName: string; unitNumber: string | null }; phase: Pha; listingId: string | null }
  | { side: "buyer"; prospectId: string; need: string; agentName: string | null; phase: Pha; shareCount: number };
export type HoSo = {
  contact: { id: string; name: string | null; contactTypes: string[]; status: "lead" | "contact"; holderName: string | null; custom?: Record<string, unknown> };
  phones: SoChe[];
  opportunities: CoHoi[];
  listings: { id: string; buildingName: string; unitNumber: string | null; status: string; listPrice: number | null }[];
  timeline: { kind: string; at: string; ref?: string }[];
};

export const CHU = {
  tieuDe: "Liên hệ",
  moTa: "Tìm một người bằng tên hay số, xem cơ hội và căn của họ",
  timGoi: "Tên hay số điện thoại",
  trong: "Chưa có liên hệ nào",
  trongMoTa: "Liên hệ sinh ra khi nhập lead hay ghi chủ nhà cho hàng.",
  khongKhop: (q: string) => `Không tìm thấy «${q}»`,
  nguoiKhacGiu: (ten: string | null) => `Số này đã có trong sàn — ${ten ?? "chưa có người giữ"}${ten ? " đang giữ" : ""}`,
  loi: "Chưa tải được — thử lại",
  thuLai: "Thử lại",
  hienSo: "Hiện số",
  goi: "Gọi",
  chuaCoSo: "Chưa có số",
  moSoLoi: "Chưa mở được số — thử lại",
  khongVai: "Màn Liên hệ dành cho Đầu chủ và Trưởng nhóm",
  xemThem: "Xem thêm",
  hoSo: "Hồ sơ người",
  lead: "Lead",
  lienHe: "Liên hệ",
} as const;

export const NHAN_LOAI: Record<string, string> = { Seller: "Chủ bán", Landlord: "Chủ cho thuê", Buyer: "Người mua", Tenant: "Người thuê" };
export const NHAN_NHU_CAU: Record<string, string> = {
  sale: "Bán",
  lease: "Cho thuê",
  sale_or_lease: "Bán · Cho thuê",
  purchase: "Mua",
  purchase_or_lease: "Mua · Thuê",
};
export const NHAN_TRANG_THAI_HANG: Record<string, string> = {
  Incomplete: "Chưa đủ để rao",
  Active: "Đang bán",
  Pending: "Đang giao dịch",
  Closed: "Đã bán",
  Hold: "Tạm ngừng",
  Withdrawn: "Ngừng hẳn",
};
export const NHAN_SO: Record<string, string> = { Home: "Nhà", Mobile: "Di động", Work: "Công việc", Other: "Khác" };
export const NHAN_SU_KIEN: Record<string, string> = {
  lead_created: "Lead mới",
  lead_accepted: "Đầu chủ nhận lead",
  lead_called: "Đã gọi lần đầu",
  lead_returned: "Lead trả lại",
  listing_created: "Tạo hàng",
  listing_status_changed: "Hàng đổi trạng thái",
  listing_price_changed: "Hàng đổi giá rao",
  phone_revealed: "Mở số",
  prospect_inquiry_received: "Khách hỏi",
  prospect_phone_added: "Thêm số khách",
  prospect_reassigned: "Chuyển đầu khách",
  prospect_closed: "Đóng nhu cầu",
};
export const nhanPha = (p: Pha) => PHA_NHAN[p];

/** Chuỗi toàn chữ số (cho phép khoảng trắng, chấm, gạch, «+»), từ chín chữ số trở lên → tìm theo số. */
export function luaTim(s: string): "so" | "ten" {
  const t = s.trim();
  return /^[+\d\s.\-()]+$/.test(t) && t.replace(/\D/g, "").length >= 9 ? "so" : "ten";
}

export const giaTy = (v: number | null) => (v === null ? "—" : `${(v / 1_000_000_000).toLocaleString("vi-VN", { maximumFractionDigits: 2 })} tỷ`);
export const tenCan = (b: string, u: string | null) => (u ? `${b} · ${u}` : b);

type Goi = (u: string, i?: RequestInit) => Promise<Response>;
const goiMacDinh: Goi = (u, i) => fetch(u, { cache: "no-store", ...i });

export async function docDanhSach(q: { type?: string; status?: string; q?: string; cursor?: string }, goi: Goi = goiMacDinh) {
  const ts = new URLSearchParams(Object.entries(q).filter(([, v]) => v) as [string, string][]);
  const r = await goi(`/api/v1/contacts${ts.size ? `?${ts}` : ""}`).catch(() => null);
  if (!r?.ok) return null;
  return (await r.json().catch(() => null)) as { items: DongLienHe[]; nextCursor: string | null } | null;
}

export type KetQuaTimSo = { contactId: string } | { held: true; holderName: string | null } | { found: false };
export async function timSo(phone: string, goi: Goi = goiMacDinh): Promise<KetQuaTimSo | null> {
  const r = await goi("/api/v1/contacts/lookup-phone", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ phone }) }).catch(() => null);
  if (!r?.ok) return null;
  return (await r.json().catch(() => null)) as KetQuaTimSo | null;
}

export async function docHoSo(id: string, goi: Goi = goiMacDinh): Promise<HoSo | null> {
  const r = await goi(`/api/v1/contacts/${id}/profile`).catch(() => null);
  if (!r?.ok) return null;
  return (await r.json().catch(() => null)) as HoSo | null;
}

export async function moSo(contactId: string, phoneId: string, goi: Goi = goiMacDinh): Promise<string | null> {
  const r = await goi(`/api/v1/contacts/${contactId}/phones/${phoneId}/reveal`, { method: "POST" }).catch(() => null);
  if (!r?.ok) return null;
  return ((await r.json().catch(() => null)) as { phone?: string } | null)?.phone ?? null;
}
