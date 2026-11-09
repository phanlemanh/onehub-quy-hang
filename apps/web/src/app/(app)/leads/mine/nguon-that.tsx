"use client";

import type { MyLeadView } from "@quy-hang/core/dedupe";

import { docMang } from "../../today/viec/doc-nguon";
import { LeadDaNhap, type NguonLeadDaNhap } from "./lead-da-nhap";

/** Màn dựng từng dòng từ các trường này; thiếu thì cả lần đọc là hỏng, không để lọt tới màn. */
function laLead(x: unknown): x is MyLeadView {
  const l = x as Partial<MyLeadView> | null;
  return typeof l === "object" && l !== null && typeof l.id === "string" && typeof l.buildingName === "string" && typeof l.stage === "string";
}

// Hai lời gọi thật của vùng «Lead đã nhập»: liệt lead mình nhập và «Sửa số và gửi lại» (hàng 27, ADR-0020).
export const nguon: NguonLeadDaNhap = {
  lay: () => docMang<MyLeadView>("/api/v1/leads", (j) => (Array.isArray(j) && j.every(laLead) ? j : null)),
  async guiLai(id, ownerPhone) {
    const res = await fetch(`/api/v1/leads/${id}/resubmit`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ ownerPhone }),
    }).catch(() => null);
    if (!res) return { ok: false, loi: "Mạng không trả lời — thử gửi lại." };
    if (res.status === 201) return { ok: true };
    if (res.status === 400) {
      const j = (await res.json()) as { details?: { path: string; reason: string }[] };
      return { ok: false, loi: j.details?.find((d) => d.path === "ownerPhone")?.reason ?? "Số chưa đúng." };
    }
    if (res.status === 409) return { ok: false, loi: "Lead này đã được gửi lại." };
    return { ok: false, loi: "Chưa gửi được — thử lại." };
  },
};

export function LeadDaNhapThat() {
  return <LeadDaNhap nguon={nguon} />;
}
