import { headers } from "next/headers";
import { notFound } from "next/navigation";

import { readMe } from "@/lib/api";
import { CuocGoi } from "./cuoc-goi";
import { KhungCuocGoi } from "./khung";
import { docMaLead } from "./nguon";

export const dynamic = "force-dynamic";

// Chế độ cuộc gọi khai thác (hàng 28, Hỏi-1): `/units/call?lead=<mã lead>` — lead chỉ biết toà chưa có mã căn nên đường
// theo lead, không theo căn. Chỉ vai Đầu chủ; vai khác không thấy trang (AC-10).
export default async function Page({ searchParams }: { searchParams: Promise<{ lead?: string }> }) {
  const me = await readMe((await headers()).get("cookie") ?? "");
  if (!me?.activeCompany?.roles.includes("listing_agent")) notFound();
  const { lead } = await searchParams;
  return (
    <KhungCuocGoi>
      <CuocGoi leadId={docMaLead(lead)} san={me.activeCompany.id} />
    </KhungCuocGoi>
  );
}
