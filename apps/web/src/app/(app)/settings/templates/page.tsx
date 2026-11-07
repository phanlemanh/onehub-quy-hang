import type { MauBai, MauBang } from "@quy-hang/core/export";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getApi, readMe } from "@/lib/api";

import { chanMucSan } from "../cai-dat";
import { MucCaiDat } from "../khung";
import { type CotMauNhap, type TrangThaiMau } from "./mau-nhap";
import { CHU_MAU, type TrangThaiMauSan } from "./mau-san";
import { VungMauBai } from "./vung-mau-bai";
import { VungMauBang } from "./vung-mau-bang";
import { VungMauNhap } from "./vung-mau-nhap";

export const dynamic = "force-dynamic";

const MO_TA = "Mẫu file nhập, cột của bảng hàng khi xuất, lời mở đầu và lời kết của bài — lần dùng kế tiếp theo bản ở đây";

// Cài đặt sàn → Mẫu (hàng 50 mau-nhap-va-bai, hàng mau-bang-hang-va-bai), dựng qua khuôn MucCaiDat
// (design/patterns/cai-dat-san.md): ba tab Mẫu nhập · Mẫu bảng hàng · Mẫu bài. Người không quản trị về Cá nhân kèm câu
// báo trước khi đọc API.
export default async function Mau() {
  const cookie = (await headers()).get("cookie") ?? "";
  const me = await readMe(cookie);
  if (!me) redirect("/login");
  if (me.companies.length === 0) redirect("/no-company");
  if (!me.activeCompany) redirect("/select-company");
  const chan = chanMucSan(me.activeCompany.roles);
  if (chan) redirect(chan);
  const doc = (duong: string) => Promise.resolve(getApi().request(`http://quy-hang.local${duong}`, { headers: { cookie } })).catch(() => null);
  const [nhap, bang, bai] = await Promise.all([doc("/api/v1/company/import-templates"), doc("/api/v1/company/templates/export"), doc("/api/v1/company/templates/posts")]);
  const ttNhap: TrangThaiMau = nhap && nhap.ok ? { kieu: "xong", ds: (await nhap.json()) as CotMauNhap[] } : { kieu: "loi" };
  const ttBang: TrangThaiMauSan<MauBang[]> = bang && bang.ok ? { kieu: "xong", giaTri: ((await bang.json()) as { templates: MauBang[] }).templates } : { kieu: "loi" };
  const ttBai: TrangThaiMauSan<MauBai> = bai && bai.ok ? { kieu: "xong", giaTri: ((await bai.json()) as { templates: MauBai }).templates } : { kieu: "loi" };
  return (
    <MucCaiDat title="Mẫu" description={MO_TA}>
      <Tabs defaultValue="nhap">
        <TabsList>
          <TabsTrigger value="nhap">{CHU_MAU.tabNhap}</TabsTrigger>
          <TabsTrigger value="bang">{CHU_MAU.tabBang}</TabsTrigger>
          <TabsTrigger value="bai">{CHU_MAU.tabBai}</TabsTrigger>
        </TabsList>
        <TabsContent value="nhap">
          <VungMauNhap tt={ttNhap} />
        </TabsContent>
        <TabsContent value="bang">
          <VungMauBang tt={ttBang} />
        </TabsContent>
        <TabsContent value="bai">
          <VungMauBai tt={ttBai} />
        </TabsContent>
      </Tabs>
    </MucCaiDat>
  );
}
