"use client";

import { LEAD_SIDE_STATES, LEAD_STAGES, NEED_LABELS, type MyLeadView } from "@quy-hang/core/dedupe";

import { docMang } from "../../today/viec/doc-nguon";
import { LeadDaNhap, type NguonLeadDaNhap } from "./lead-da-nhap";

const NAC: readonly unknown[] = [...LEAD_STAGES, ...LEAD_SIDE_STATES];
const MOC = ["routedAt", "acceptedAt", "firstCalledAt", "boardAt", "returnedAt", "resubmittedAt"] as const;
const laNgay = (x: unknown) => typeof x === "string" && !Number.isNaN(Date.parse(x));

/** Đủ các trường màn dựng dòng từ đó (`DongLead`); một phần tử sai thì cả lần đọc là hỏng, không để màn hiện chữ rác hay vỡ lúc dựng. */
function laLead(x: unknown): x is MyLeadView {
  if (typeof x !== "object" || x === null) return false;
  const l = x as Record<string, unknown>;
  return (
    typeof l.id === "string" &&
    typeof l.buildingName === "string" &&
    (l.unitNumber === null || typeof l.unitNumber === "string") &&
    typeof l.need === "string" &&
    Object.hasOwn(NEED_LABELS, l.need) &&
    typeof l.listPrice === "number" &&
    typeof l.feeInclusion === "string" &&
    NAC.includes(l.stage) &&
    laNgay(l.createdAt) &&
    MOC.every((k) => l[k] === null || laNgay(l[k]))
  );
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
