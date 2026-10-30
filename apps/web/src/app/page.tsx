import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { readMe } from "@/lib/api";
import { DangXuat } from "./(auth)/dang-xuat";

export const dynamic = "force-dynamic";

// Trang đầu tạm: cho thấy đang ở sàn nào tới khi vỏ (hàng 53) và Hôm nay thay. Màn thật dựng theo ReUI (AGENTS.md).
export default async function Home() {
  const me = await readMe((await headers()).get("cookie") ?? "");
  if (!me) redirect("/dang-nhap");
  if (me.companies.length === 0) redirect("/chua-gan-san");
  if (!me.activeCompany) redirect("/chon-san");
  return (
    <main style={{ fontFamily: "system-ui, sans-serif", padding: 24, lineHeight: 1.5 }}>
      <h1>Quỹ hàng</h1>
      <p>Bạn đang làm ở sàn {me.activeCompany.name}</p>
      <DangXuat />
    </main>
  );
}
