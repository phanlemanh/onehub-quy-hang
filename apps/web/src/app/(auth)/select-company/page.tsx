import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { readMe } from "@/lib/api";
import { DangXuat } from "../dang-xuat";
import { Khung } from "../khung";
import { DanhSachSan } from "./danh-sach";

export const dynamic = "force-dynamic";

export default async function ChonSan() {
  const me = await readMe((await headers()).get("cookie") ?? "");
  if (!me) redirect("/login");
  if (me.companies.length === 0) redirect("/no-company");
  return (
    <Khung title="Chọn sàn làm việc">
      <DanhSachSan companies={me.companies} />
      <DangXuat userId={me.user.id} />
    </Khung>
  );
}
