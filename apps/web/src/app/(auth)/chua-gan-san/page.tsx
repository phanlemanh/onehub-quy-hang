import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { readMe } from "@/lib/api";
import { DangXuat } from "../dang-xuat";
import { Khung } from "../khung";

export const dynamic = "force-dynamic";

export default async function ChuaGanSan() {
  const me = await readMe((await headers()).get("cookie") ?? "");
  if (!me) redirect("/dang-nhap");
  if (me.companies.length > 0) redirect("/");
  return (
    <Khung title="Chưa thuộc sàn nào">
      <p>Tài khoản {me.user.email} chưa thuộc sàn nào. Nhờ quản trị sàn mời bạn.</p>
      <DangXuat />
    </Khung>
  );
}
