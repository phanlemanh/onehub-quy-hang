import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { Frame, FrameDescription, FrameHeader, FramePanel, FrameTitle } from "@/components/reui/frame";
import { getApi, readMe } from "@/lib/api";

import { QuanNguoi, type Khu, type ThanhVien } from "./quan-nguoi";

export const dynamic = "force-dynamic";

// Cài đặt sàn → Người dùng (S6, hàng 7). Ghép từ thành phần đã cài; khối Pro `solution-users-8` để sau (ADR-0006).
export default async function NguoiDung() {
  const cookie = (await headers()).get("cookie") ?? "";
  const me = await readMe(cookie);
  if (!me) redirect("/dang-nhap");
  if (me.companies.length === 0) redirect("/chua-gan-san");
  if (!me.activeCompany) redirect("/chon-san");
  const api = getApi();
  const res = await api.request("http://quy-hang.local/api/v1/san/thanh-vien", { headers: { cookie } });
  return (
    <main className="flex min-h-svh justify-center bg-background p-4">
      <Frame className="w-full max-w-3xl">
        <FrameHeader>
          <FrameTitle>Người dùng</FrameTitle>
          <FrameDescription>Người của sàn {me.activeCompany.name}</FrameDescription>
        </FrameHeader>
        <FramePanel className="flex flex-col gap-6">
          {res.status === 403 ? (
            <p className="text-sm">Chỉ quản trị sàn xem được trang này.</p>
          ) : (
            <QuanNguoi
              thanhVien={(await res.json()) as ThanhVien[]}
              khu={(await (await api.request("http://quy-hang.local/api/v1/san/khu", { headers: { cookie } })).json()) as Khu[]}
              toi={me.user.id}
            />
          )}
        </FramePanel>
      </Frame>
    </main>
  );
}
