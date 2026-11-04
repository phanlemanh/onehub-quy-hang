import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { Placeholder } from "@/components/shell/placeholder";
import { readMe } from "@/lib/api";

import { chanMucSan, PHAM_VI, THAM_SO_CHI_QUAN_TRI } from "../cai-dat";
import CaNhan from "../personal/ca-nhan";

export const dynamic = "force-dynamic";

// Mục của khu Cài đặt (hàng cai-dat-hop-nhat): «personal» là Cá nhân, ai cũng mở được; mục sàn chưa dựng (mục 45–50)
// là trang tạm, chỉ quản trị sàn mở được.
export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ section: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { section } = await params;
  const me = await readMe((await headers()).get("cookie") ?? "");
  if (!me?.activeCompany) redirect("/login");
  if (section === "personal") {
    const biChan = (await searchParams)[THAM_SO_CHI_QUAN_TRI] === "1";
    return <CaNhan biChan={biChan} email={me.user.email} tenSan={me.activeCompany.name} soSan={me.companies.length} />;
  }
  const chan = chanMucSan(me.activeCompany.roles ?? []);
  if (chan) redirect(chan);
  return <Placeholder path={`/settings/${section}`} phamVi={PHAM_VI.san(me.activeCompany.name)} />;
}
