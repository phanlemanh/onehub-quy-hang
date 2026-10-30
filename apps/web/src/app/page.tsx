import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { Frame, FrameDescription, FrameFooter, FrameHeader, FrameTitle } from "@/components/reui/frame";
import { readMe } from "@/lib/api";

import { DangXuat } from "./(auth)/dang-xuat";

export const dynamic = "force-dynamic";

// Trang đầu tạm: cho thấy đang ở sàn nào tới khi vỏ (hàng 53) và Hôm nay thay.
export default async function Home() {
  const me = await readMe((await headers()).get("cookie") ?? "");
  if (!me) redirect("/dang-nhap");
  if (me.companies.length === 0) redirect("/chua-gan-san");
  if (!me.activeCompany) redirect("/chon-san");
  return (
    <main className="flex min-h-svh items-center justify-center bg-background p-4">
      <Frame className="w-full max-w-md">
        <FrameHeader>
          <FrameTitle>Quỹ hàng</FrameTitle>
          <FrameDescription>Bạn đang làm ở sàn {me.activeCompany.name}</FrameDescription>
        </FrameHeader>
        <FrameFooter>
          <DangXuat />
        </FrameFooter>
      </Frame>
    </main>
  );
}
