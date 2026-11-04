/**
 * Lời gọi thật của Hôm nay đầu chủ (hàng 22): bộ nhóm đang áp của sàn, lead giao cho tôi, và ba nút Nhận · Đã gọi · Trả lại.
 * Căn không đi qua đây — căn đọc từ kho trên máy, «Còn · giữ giá» ghi qua bộ đồng bộ.
 */
import { kiemBoNhom, type BoNhom, type LeadAction } from "@quy-hang/core/today";
import type { BoNhomDaLuu } from "@/lib/sync/types";
import { chuLoiLead } from "./ly-do";

/** Lead giao cho tôi như `GET /api/v1/leads/assigned` trả — không số chủ. */
export type LeadGiao = {
  id: string;
  buildingName: string;
  unitNumber: string | null;
  need: string;
  priceText: string;
  createdAt: string;
  stage: string;
  acceptedAt: string | null;
  acceptDueAt: string;
  callDueAt: string;
};

/** Bộ nhóm đang áp; lỗi mạng, mã khác 200 hay bộ máy chủ trả mà lõi không nhận thì `null` — màn dùng bộ đã lưu. */
export async function layBoNhom(): Promise<BoNhomDaLuu | null> {
  const r = await fetch("/api/v1/company/settings/queue", { cache: "no-store", credentials: "same-origin" }).catch(() => null);
  if (!r?.ok) return null;
  const j = (await r.json().catch(() => null)) as { groups?: unknown; source?: unknown } | null;
  if (!j || kiemBoNhom(j.groups).length) return null;
  return { groups: j.groups as BoNhom, source: j.source === "company" ? "company" : "default", savedAt: new Date().toISOString() };
}

/** Lead giao cho tôi; lỗi thì `null`. */
export async function layLeadGiao(): Promise<LeadGiao[] | null> {
  const r = await fetch("/api/v1/leads/assigned", { cache: "no-store", credentials: "same-origin" }).catch(() => null);
  if (!r?.ok) return null;
  const j = (await r.json().catch(() => null)) as unknown;
  return Array.isArray(j) ? (j as LeadGiao[]) : null;
}

const DUOI: Record<LeadAction, string> = { accept: "accept", first_call: "first-call", return: "return" };

/** Ghi một nút của dòng lead. 409 trả lý do bằng chữ; dòng giữ nguyên. */
export async function ghiLead(id: string, viec: LeadAction): Promise<{ ok: true } | { ok: false; loi: string }> {
  const r = await fetch(`/api/v1/leads/${encodeURIComponent(id)}/${DUOI[viec]}`, { method: "POST", credentials: "same-origin" }).catch(() => null);
  if (!r) return { ok: false, loi: "Mất mạng — chưa ghi được, thử lại khi có mạng." };
  if (r.ok) return { ok: true };
  const j = (await r.json().catch(() => null)) as { error?: string } | null;
  if (r.status === 409) return { ok: false, loi: chuLoiLead(j?.error ?? null) };
  if (r.status === 401) return { ok: false, loi: "Hết phiên đăng nhập — đăng nhập lại rồi thử." };
  if (r.status === 404) return { ok: false, loi: "Không còn thấy lead này." };
  return { ok: false, loi: "Chưa ghi được — thử lại." };
}

// ——— Hôm nay của trưởng nhóm (hàng 42) ———

/** Dòng của hàng đợi trưởng nhóm như `GET /api/v1/team/lead-queue` trả — không số, không tên chủ nhà. */
export type DongLeadTruongNhom = {
  leadId: string;
  kind: "unrouted" | "accept_overdue" | "first_call_overdue";
  buildingName: string;
  unitNumber: string | null;
  agentUserId: string | null;
  dueAt: string;
};

/** Đầu chủ của sàn như `GET /api/v1/team/listing-agents` trả. */
export type DauChuCuaSan = { userId: string; displayName: string; onLeave: boolean; openLeads: number };

/** Kết quả đọc: lời gọi ném lỗi (mất mạng) tách khỏi máy chủ trả lỗi — màn chọn «mất mạng» hay «không tải được». */
export type KetQuaDoc<T> = { ok: true; items: T[] } | { ok: false; mang: boolean };

async function docItems<T>(url: string, f: typeof fetch): Promise<KetQuaDoc<T>> {
  const r = await f(url, { cache: "no-store", credentials: "same-origin" }).catch(() => null);
  if (!r) return { ok: false, mang: true };
  if (!r.ok) return { ok: false, mang: false };
  const j = (await r.json().catch(() => null)) as { items?: unknown } | null;
  return Array.isArray(j?.items) ? { ok: true, items: j.items as T[] } : { ok: false, mang: false };
}

/** Hàng đợi lead quá hạn và chưa chia được của sàn. */
export const layHangDoiTruongNhom = (f: typeof fetch = fetch) => docItems<DongLeadTruongNhom>("/api/v1/team/lead-queue", f);

/** Đầu chủ của sàn để giao lại. */
export const layDauChuCuaSan = (f: typeof fetch = fetch) => docItems<DauChuCuaSan>("/api/v1/team/listing-agents", f);

const LOI_GIAO: Record<string, string> = {
  "lead-not-assignable": "Không giao được lead căn trùng.",
  "not-a-listing-agent": "Người nhận không phải đầu chủ của sàn.",
  "team-lead-required": "Chỉ trưởng nhóm giao lại được lead.",
  "not-found": "Không còn thấy lead này.",
};

/** Giao lại một lead cho một đầu chủ. Lỗi trả câu để hiện dưới dòng; dòng giữ nguyên. */
export async function giaoLaiLead(leadId: string, agentUserId: string, f: typeof fetch = fetch): Promise<{ ok: true } | { ok: false; loi: string }> {
  const r = await f(`/api/v1/leads/${encodeURIComponent(leadId)}/assign`, {
    method: "POST",
    credentials: "same-origin",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ agentUserId }),
  }).catch(() => null);
  if (!r) return { ok: false, loi: "Mất mạng — chưa giao được, thử lại khi có mạng." };
  if (r.ok) return { ok: true };
  if (r.status === 401) return { ok: false, loi: "Hết phiên đăng nhập — đăng nhập lại rồi thử." };
  const j = (await r.json().catch(() => null)) as { error?: string } | null;
  return { ok: false, loi: (j?.error && LOI_GIAO[j.error]) || "Chưa giao được — thử lại." };
}
