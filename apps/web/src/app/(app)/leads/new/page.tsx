import { navigationFor } from "@quy-hang/core";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { TrangThai } from "@/components/trang-thai";
import { getApi, readMe } from "@/lib/api";

import { KhungLeadCuaToi } from "../mine/khung";
import { LeadDaNhapThat } from "../mine/nguon-that";
import { KhungLead, VungNhapLead } from "./khung";
import { ONhanLead } from "./nguon-that";
import { TabLead } from "./tab-lead";

export const dynamic = "force-dynamic";

// Ô nhận lead (L1–L5, hàng 24, 51), dựng qua khuôn KhungLead (design/patterns/o-nhan-lead.md). Vai có nút «+ Lead» ở bảng
// vai của lõi mới nhập được; API chặn lại cùng luật. Điện thoại: tab Lead có thêm phần «Lead đã nhập» (khuôn lead-cua-toi).
export default async function Page() {
  const cookie = (await headers()).get("cookie") ?? "";
  const me = await readMe(cookie);
  if (!me) redirect("/login");
  if (me.companies.length === 0) redirect("/no-company");
  if (!me.activeCompany) redirect("/select-company");
  if (!navigationFor(me.activeCompany.roles).actions.includes("new_lead")) {
    return (
      <KhungLead>
        <VungNhapLead>
          <TrangThai kind="notice" title="Telesales, đầu chủ và trưởng nhóm nhập được lead." />
        </VungNhapLead>
      </KhungLead>
    );
  }
  const res = await getApi().request("http://quy-hang.local/api/v1/leads/buildings", { headers: { cookie } });
  const toa = res.ok ? ((await res.json()) as string[]) : [];
  return (
    <KhungLead>
      <TabLead
        nhap={
          <VungNhapLead>
            <ONhanLead toa={toa} />
          </VungNhapLead>
        }
        daNhap={
          <KhungLeadCuaToi>
            <LeadDaNhapThat />
          </KhungLeadCuaToi>
        }
      />
    </KhungLead>
  );
}
