/**
 * Nhu cầu khách (hàng 86, RESO `Prospecting`): một đầu khách phục vụ một khách. Khách là liên hệ của hàng 85 mang `Buyer`
 * hay `Tenant`; nhu cầu khách mang liên hệ, đầu khách giữ, tên khách đầu khách gõ, loại giao dịch và tiêu chí. Đầu khách
 * không đọc liên hệ (liên hệ vừa là chủ thì trọn lớp nguồn) — bản xem ở đây không bao giờ mang số hay mã liên hệ.
 */
import { normalizePhone } from "../access/owner-input";
import type { PayloadError } from "../listing/events";
import type { ContactType } from "./index";

/** Loại giao dịch của khách: Mua · Thuê · Cả hai. */
export const PROSPECT_NEEDS = ["purchase", "lease", "purchase_or_lease"] as const;
export type ProspectNeed = (typeof PROSPECT_NEEDS)[number];

/** Loại giao dịch ra loại liên hệ — gương của `typesForNeed` phía chủ nhà. */
export function typesForProspectNeed(need: ProspectNeed): ContactType[] {
  if (need === "purchase") return ["Buyer"];
  if (need === "lease") return ["Tenant"];
  return ["Buyer", "Tenant"];
}

/** Tiêu chí: tập trường đóng theo tên RESO (Hỏi-3) — Bảng hàng thẻ (hàng 32) lọc theo đúng các trường này. */
export const PROSPECT_CRITERIA_KEYS = [
  "SubdivisionName",
  "BuildingName",
  "BedroomsTotalMin",
  "LivingAreaMin",
  "ListPriceMax",
  "LeaseAmountMax",
  "Note",
] as const;
export type ProspectCriteria = {
  SubdivisionName?: string[];
  BuildingName?: string[];
  BedroomsTotalMin?: number;
  LivingAreaMin?: number;
  ListPriceMax?: number;
  LeaseAmountMax?: number;
  Note?: string;
};

/** Tên loại sự kiện của nhu cầu khách — hàng 52 đọc `inquiry_received` («khách hỏi», luật 35 của đợt). */
export const PROSPECT_EVENT_TYPES = ["inquiry_received", "phone_added", "reassigned", "closed"] as const;
export type ProspectEventType = (typeof PROSPECT_EVENT_TYPES)[number];

export type ProspectInput = { displayName: string; phone: string; need: ProspectNeed; criteria: ProspectCriteria };

const LOI_SO = "cần số điện thoại Việt Nam 10 chữ số";
const laDoiTuong = (v: unknown): v is Record<string, unknown> => !!v && typeof v === "object" && !Array.isArray(v);

function kiemDanhSachChu(v: unknown, path: string, errors: PayloadError[]) {
  if (!Array.isArray(v) || v.length === 0 || v.length > 20 || v.some((x) => typeof x !== "string" || x.trim().length === 0 || x.length > 200)) {
    errors.push({ path, reason: "cần danh sách 1–20 chữ, mỗi chữ 1–200 ký tự" });
  }
}

function kiemSoKhongAm(v: unknown, path: string, errors: PayloadError[], nguyen: boolean) {
  const ok = typeof v === "number" && Number.isFinite(v) && v >= 0 && (!nguyen || Number.isSafeInteger(v));
  if (!ok) errors.push({ path, reason: nguyen ? "cần số nguyên không âm" : "cần số không âm" });
}

function kiemTieuChi(v: unknown, errors: PayloadError[]): ProspectCriteria {
  if (!laDoiTuong(v)) {
    errors.push({ path: "criteria", reason: "cần một đối tượng" });
    return {};
  }
  for (const k of Object.keys(v)) if (!(PROSPECT_CRITERIA_KEYS as readonly string[]).includes(k)) errors.push({ path: `criteria.${k}`, reason: "khoá lạ" });
  if ("SubdivisionName" in v) kiemDanhSachChu(v.SubdivisionName, "criteria.SubdivisionName", errors);
  if ("BuildingName" in v) kiemDanhSachChu(v.BuildingName, "criteria.BuildingName", errors);
  if ("BedroomsTotalMin" in v) kiemSoKhongAm(v.BedroomsTotalMin, "criteria.BedroomsTotalMin", errors, true);
  if ("LivingAreaMin" in v) kiemSoKhongAm(v.LivingAreaMin, "criteria.LivingAreaMin", errors, false);
  if ("ListPriceMax" in v) kiemSoKhongAm(v.ListPriceMax, "criteria.ListPriceMax", errors, true);
  if ("LeaseAmountMax" in v) kiemSoKhongAm(v.LeaseAmountMax, "criteria.LeaseAmountMax", errors, true);
  if ("Note" in v && (typeof v.Note !== "string" || v.Note.length > 500)) errors.push({ path: "criteria.Note", reason: "cần chữ, tối đa 500 ký tự" });
  const out: Record<string, unknown> = {};
  for (const k of PROSPECT_CRITERIA_KEYS) if (k in v) out[k] = v[k];
  return out as ProspectCriteria;
}

/** Khuôn tạo nhu cầu khách: `displayName`, `phone`, `need` bắt buộc; `criteria` tuỳ chọn. Khoá lạ bị từ chối. */
export function validateProspectInput(payload: unknown): { ok: true; value: ProspectInput } | { ok: false; errors: PayloadError[] } {
  if (!laDoiTuong(payload)) return { ok: false, errors: [{ path: "payload", reason: "cần một đối tượng" }] };
  const p = payload;
  const errors: PayloadError[] = [];
  for (const k of Object.keys(p)) if (!["displayName", "phone", "need", "criteria"].includes(k)) errors.push({ path: k, reason: "khoá lạ" });
  const ten = p.displayName;
  if (typeof ten !== "string" || ten.trim().length === 0 || ten.length > 200) errors.push({ path: "displayName", reason: "cần chữ, 1–200 ký tự" });
  const so = normalizePhone(p.phone);
  if (!so) errors.push({ path: "phone", reason: LOI_SO });
  if (!(PROSPECT_NEEDS as readonly unknown[]).includes(p.need)) errors.push({ path: "need", reason: `cần trong: ${PROSPECT_NEEDS.join(", ")}` });
  const criteria = "criteria" in p ? kiemTieuChi(p.criteria, errors) : {};
  if (errors.length) return { ok: false, errors };
  return { ok: true, value: { displayName: (ten as string).trim(), phone: so!, need: p.need as ProspectNeed, criteria } };
}

/** Khuôn thêm số: đúng một khoá `phone`. */
export function validateProspectPhone(payload: unknown): { ok: true; value: { phone: string } } | { ok: false; errors: PayloadError[] } {
  if (!laDoiTuong(payload)) return { ok: false, errors: [{ path: "payload", reason: "cần một đối tượng" }] };
  const errors: PayloadError[] = [];
  for (const k of Object.keys(payload)) if (k !== "phone") errors.push({ path: k, reason: "khoá lạ" });
  const so = normalizePhone(payload.phone);
  if (!so) errors.push({ path: "phone", reason: LOI_SO });
  if (errors.length) return { ok: false, errors };
  return { ok: true, value: { phone: so! } };
}

/** Khuôn đổi đầu khách (trưởng nhóm): đúng một khoá `ownerMemberUserId`. */
export function validateProspectPatch(payload: unknown): { ok: true; value: { ownerMemberUserId: string } } | { ok: false; errors: PayloadError[] } {
  if (!laDoiTuong(payload)) return { ok: false, errors: [{ path: "payload", reason: "cần một đối tượng" }] };
  const errors: PayloadError[] = [];
  for (const k of Object.keys(payload)) if (k !== "ownerMemberUserId") errors.push({ path: k, reason: "khoá lạ" });
  const u = payload.ownerMemberUserId;
  if (typeof u !== "string" || u.length === 0 || u.length > 200) errors.push({ path: "ownerMemberUserId", reason: "cần mã thành viên" });
  if (errors.length) return { ok: false, errors };
  return { ok: true, value: { ownerMemberUserId: u as string } };
}

/** Nhu cầu khách như cơ sở dữ liệu giữ — có thể mang mã liên hệ, số; bản xem không bao giờ chép chúng. */
export type ProspectRecord = {
  id: string;
  displayName: string;
  need: ProspectNeed;
  criteria: ProspectCriteria;
  ownerMemberUserId: string;
  closedAt: string | null;
  createdAt: string;
  contactId?: unknown;
  phoneEnc?: unknown;
  phoneHash?: unknown;
};

export const PROSPECT_VIEW_KEYS = ["id", "displayName", "need", "contactTypes", "criteria", "ownerMemberUserId", "closedAt", "createdAt"] as const;
export type ProspectView = {
  id: string;
  displayName: string;
  need: ProspectNeed;
  contactTypes: ContactType[];
  criteria: ProspectCriteria;
  ownerMemberUserId: string;
  closedAt: string | null;
  createdAt: string;
};

/** Bản xem của đầu khách giữ và trưởng nhóm: loại suy từ loại giao dịch (không đọc loại của liên hệ — có thể mang `Seller`). */
export function prospectView(r: ProspectRecord): ProspectView {
  return {
    id: r.id,
    displayName: r.displayName,
    need: r.need,
    contactTypes: typesForProspectNeed(r.need),
    criteria: { ...r.criteria },
    ownerMemberUserId: r.ownerMemberUserId,
    closedAt: r.closedAt,
    createdAt: r.createdAt,
  };
}
