import { headers } from "next/headers";
import { notFound } from "next/navigation";

import { DauMan } from "@/components/bo-cuc";
import { readMe } from "@/lib/api";
import { CuocGoi } from "./cuoc-goi";
import { moDuocManCuocGoi } from "./cua";
import { KhungCuocGoi } from "./khung";
import { docCheDo } from "./push/dau-man";
import { EpGia } from "./push/ep-gia";

export const dynamic = "force-dynamic";

// Chế độ cuộc gọi: `/units/call?lead=<mã lead>` khai thác (hàng 28, Hỏi-1) — lead chỉ biết toà chưa có mã căn nên đường theo
// lead; `/units/call?hang=<mã hồ sơ>` ép giá (hàng 29). Chỉ vai Đầu chủ; vai khác không thấy trang (AC-10 của hai hàng) —
// cửa đọc luật của lõi qua `cua.ts`, cùng luật với nút «Ghi cuộc gọi» của hồ sơ căn.
export default async function Page({ searchParams }: { searchParams: Promise<{ lead?: string; hang?: string }> }) {
  const me = await readMe((await headers()).get("cookie") ?? "");
  if (!moDuocManCuocGoi(me) || !me?.activeCompany) notFound();
  const cheDo = docCheDo(await searchParams);
  const dauMan = <DauMan duongDan={[{ nhan: "Hôm nay", href: "/today" }, { nhan: cheDo.kind === "ep-gia" ? "Gọi ép giá" : "Gọi khai thác" }]} />;
  return (
    <KhungCuocGoi dauMan={dauMan}>
      {cheDo.kind === "ep-gia" ? (
        <EpGia hangId={cheDo.hangId} san={me.activeCompany.id} />
      ) : (
        <CuocGoi leadId={cheDo.kind === "khai-thac" ? cheDo.leadId : null} san={me.activeCompany.id} />
      )}
    </KhungCuocGoi>
  );
}
