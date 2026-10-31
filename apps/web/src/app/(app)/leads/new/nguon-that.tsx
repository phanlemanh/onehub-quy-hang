"use client";

import type { LeadResultView } from "@quy-hang/core/dedupe";

import { OLead, type NguonLead } from "./o-lead";

// Ba lời gọi thật của ô nhận lead: lối API /api/v1/leads (hàng 24) và tra mã căn của danh mục (hàng 9).
const nguon: NguonLead = {
  async gui(body) {
    let res: Response;
    try {
      res = await fetch("/api/v1/leads", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
    } catch {
      return { ok: false, mang: true };
    }
    if (res.status === 201) return { ok: true, lead: (await res.json()) as LeadResultView };
    if (res.status === 400) {
      const j = (await res.json()) as { details?: { path: string; reason: string }[] };
      return { ok: false, loi: Object.fromEntries((j.details ?? []).map((d) => [d.path, d.reason])) };
    }
    return { ok: false, mang: true };
  },
  async bo(id) {
    const res = await fetch(`/api/v1/leads/${id}/discard`, { method: "POST" }).catch(() => null);
    return res?.ok ?? false;
  },
  async traMa(ma) {
    const res = await fetch(`/api/v1/catalog/units/${encodeURIComponent(ma)}`).catch(() => null);
    if (!res?.ok) return { khong: "Chưa tra được mã căn — chọn toà" };
    const kq = (await res.json()) as { status: string; unit?: { buildingName: string; unitNumber: string }; examples?: { example: string }[] };
    if (kq.status === "found" && kq.unit) return { buildingName: kq.unit.buildingName, unitNumber: kq.unit.unitNumber };
    if (kq.status === "not_in_catalog") return { khong: "Mã căn chưa có trong danh mục — chọn toà" };
    if (kq.status === "ambiguous") return { khong: "Mã căn khớp nhiều dự án — chọn toà" };
    return { khong: `Không đọc được mã — mẫu mã: ${kq.examples?.[0]?.example ?? "A-12.05"}` };
  },
};

export function ONhanLead({ toa }: { toa: readonly string[] }) {
  return <OLead toa={toa} nguon={nguon} />;
}
