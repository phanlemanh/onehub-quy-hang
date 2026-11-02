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
