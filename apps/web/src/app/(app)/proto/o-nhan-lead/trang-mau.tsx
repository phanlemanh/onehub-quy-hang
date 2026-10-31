"use client";

import { decideOutcome, leadResultView, validateLeadInput } from "@quy-hang/core/dedupe";

import { OLead, type NguonLead } from "../../leads/new/o-lead";

// Máy chủ giả theo bộ mẫu hàng 5: căn A-02.06 có hàng mở của [Mẫu] Đầu chủ 1 (lead L-01), số 0900 000 001 là chủ nhà
// CN-01 của [Mẫu] Đầu chủ 2 (lead L-02), số 0900 000 099 giả lỗi mạng; còn lại không trùng. Luật quyết vẫn là của lõi.
const CAN_MO = "A0206";
const SO_CO_CHU = "0900000001";
const SO_LOI_MANG = "0900000099";
const khoa = (s: string) => s.replace(/[^0-9a-z]/gi, "").toUpperCase();

const nguon: NguonLead = {
  async gui(body) {
    await new Promise((r) => setTimeout(r, 600));
    const kiem = validateLeadInput(body);
    if (!kiem.ok) return { ok: false, loi: Object.fromEntries(kiem.errors.map((e) => [e.path, e.reason])) };
    const v = kiem.value;
    if (v.ownerPhone === SO_LOI_MANG) return { ok: false, mang: true };
    const quyet = decideOutcome({
      openListing: v.unitNumber && khoa(v.unitNumber) === CAN_MO ? { listingId: "mau", agentUserId: "dau-chu-1" } : null,
      ownerAgentUserId: v.ownerPhone === SO_CO_CHU ? "dau-chu-2" : null,
    });
    const ten = quyet.agentUserId === "dau-chu-1" ? "[Mẫu] Đầu chủ 1" : quyet.agentUserId ? "[Mẫu] Đầu chủ 2" : null;
    const nam = { ...v } as Partial<typeof v>;
    delete nam.ownerPhone;
    return {
      ok: true,
      lead: leadResultView(
        { ...(nam as Omit<typeof v, "ownerPhone">), id: crypto.randomUUID(), outcome: quyet.outcome, matchedAgentUserId: quyet.agentUserId, matchedListingId: quyet.listingId, createdAt: new Date().toISOString(), discardedAt: null },
        ten,
      ),
    };
  },
  async bo() {
    await new Promise((r) => setTimeout(r, 300));
    return true;
  },
  async traMa(ma) {
    const m = /^([AB])[\s.-]?(\d{2})[\s.-]?(\d{2})$/i.exec(ma.trim());
    if (!m) return { khong: "Không đọc được mã — mẫu mã: A-12.05" };
    return { buildingName: `Toà ${m[1]!.toUpperCase()}`, unitNumber: `${m[1]!.toUpperCase()}-${m[2]}.${m[3]}` };
  },
};

export function TrangMau() {
  return <OLead toa={["Toà A", "Toà B"]} nguon={nguon} />;
}
