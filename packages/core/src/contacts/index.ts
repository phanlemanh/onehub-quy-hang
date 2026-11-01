/**
 * Liên hệ (hàng 85, ADR-0021): mỗi người làm việc với sàn là một liên hệ theo RESO `Contacts` — một người, nhiều số, một
 * hay nhiều loại (`ContactType`, Multi), một người giữ (`OwnerMemberKey`). Liên hệ chủ nhà là lớp `source` (bất biến 2):
 * bản xem dựng ở đây, không bao giờ mang số. Nhập qua `@quy-hang/core/contacts`.
 */
import type { Need } from "../dedupe";
import type { PayloadError } from "../listing/events";

/** Giá trị RESO `ContactType` Quỹ hàng dùng. */
export const CONTACT_TYPES = ["Seller", "Landlord", "Buyer", "Tenant"] as const;
export type ContactType = (typeof CONTACT_TYPES)[number];
export const CONTACT_TYPE_LABELS: Readonly<Record<ContactType, string>> = {
  Seller: "Chủ bán",
  Landlord: "Chủ cho thuê",
  Buyer: "Người mua",
  Tenant: "Người thuê",
};

/** Nhãn số (KW Command: Home · Mobile · Work · Other; RESO `PreferredPhone`). */
export const PHONE_LABELS = ["Home", "Mobile", "Work", "Other"] as const;
export type PhoneLabel = (typeof PHONE_LABELS)[number];

const OWNER_TYPES: readonly ContactType[] = ["Seller", "Landlord"];

/** Nhu cầu của lead ra loại của chủ nhà. */
export function typesForNeed(need: Need): ContactType[] {
  if (need === "sale") return ["Seller"];
  if (need === "lease") return ["Landlord"];
  return ["Seller", "Landlord"];
}

/** Liên hệ mang loại chủ nhà là lớp nguồn — trọn liên hệ, kể cả khi người ấy còn là Người mua. */
export function isOwnerContact(types: readonly ContactType[]): boolean {
  return types.some((t) => OWNER_TYPES.includes(t));
}

/** KW Command: «Lead» = chưa nói chuyện hai chiều; «contact» = đã nói chuyện (cuộc gọi đầu đã ghi) hay đã có hàng. */
export function contactStatus(f: { hasListing: boolean; anyFirstCall: boolean }): "lead" | "contact" {
  return f.hasListing || f.anyFirstCall ? "contact" : "lead";
}

/** Khuôn sửa loại: đúng một khoá `contactTypes`, mảng không rỗng trong thực đơn; khử trùng, xếp theo thực đơn. */
export function validateContactPatch(payload: unknown): { ok: true; value: { contactTypes: ContactType[] } } | { ok: false; errors: PayloadError[] } {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) return { ok: false, errors: [{ path: "payload", reason: "cần một đối tượng" }] };
  const p = payload as Record<string, unknown>;
  const errors: PayloadError[] = [];
  for (const k of Object.keys(p)) if (k !== "contactTypes") errors.push({ path: k, reason: "khoá lạ" });
  const ds = p.contactTypes;
  if (!Array.isArray(ds) || ds.length === 0) errors.push({ path: "contactTypes", reason: "cần ít nhất một loại" });
  else if (ds.some((t) => !(CONTACT_TYPES as readonly unknown[]).includes(t))) {
    errors.push({ path: "contactTypes", reason: `cần trong: ${CONTACT_TYPES.join(", ")}` });
  }
  if (errors.length) return { ok: false, errors };
  return { ok: true, value: { contactTypes: CONTACT_TYPES.filter((t) => (ds as unknown[]).includes(t)) } };
}

/** Liên hệ như cơ sở dữ liệu giữ — có thể mang cột số; bản xem không bao giờ chép chúng. */
export type ContactRecord = {
  id: string;
  fullName: string | null;
  contactTypes: ContactType[];
  ownerMemberUserId: string | null;
  phoneCount: number;
  hasListing: boolean;
  anyFirstCall: boolean;
  createdAt: string;
  phoneEnc?: unknown;
  phoneHash?: unknown;
};

export const CONTACT_VIEW_KEYS = ["id", "fullName", "contactTypes", "ownerMemberUserId", "phoneCount", "status", "createdAt"] as const;
export type ContactView = {
  id: string;
  fullName: string | null;
  contactTypes: ContactType[];
  ownerMemberUserId: string | null;
  phoneCount: number;
  status: "lead" | "contact";
  createdAt: string;
};

export function contactView(r: ContactRecord, canSee: boolean): ContactView | { visible: false } {
  if (!canSee) return { visible: false };
  return {
    id: r.id,
    fullName: r.fullName,
    contactTypes: [...r.contactTypes],
    ownerMemberUserId: r.ownerMemberUserId,
    phoneCount: r.phoneCount,
    status: contactStatus(r),
    createdAt: r.createdAt,
  };
}
