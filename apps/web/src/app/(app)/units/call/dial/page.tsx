import { headers } from "next/headers";
import { notFound } from "next/navigation";

import { readMe } from "@/lib/api";
import { KhungCuocGoi } from "../khung";
import { docMaLead } from "../nguon";
import { TrangQuaySo } from "./trang-quay-so";

export const dynamic = "force-dynamic";

// Trang quay số (hàng 30): `/units/call/dial?lead=<mã lead>` — đích của thông báo «Gọi chủ nhà». Chỉ vai Đầu chủ, như chế
// độ cuộc gọi; lead đọc qua cửa chỉ trả lead đang giao cho chính người gọi.
export default async function Page({ searchParams }: { searchParams: Promise<{ lead?: string }> }) {
  const me = await readMe((await headers()).get("cookie") ?? "");
  if (!me?.activeCompany?.roles.includes("listing_agent")) notFound();
  const { lead } = await searchParams;
  return (
    <KhungCuocGoi>
      <TrangQuaySo leadId={docMaLead(lead)} />
    </KhungCuocGoi>
  );
}
