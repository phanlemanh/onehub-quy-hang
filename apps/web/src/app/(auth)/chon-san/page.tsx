import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { readMe } from "@/lib/api";
import { DangXuat } from "../dang-xuat";
import { Khung } from "../khung";
import { DanhSachSan } from "./danh-sach";

export const dynamic = "force-dynamic";

export default async function ChonSan() {
  const me = await readMe((await headers()).get("cookie") ?? "");
  if (!me) redirect("/dang-nhap");
  if (me.companies.length === 0) redirect("/chua-gan-san");
  return (
    <Khung title="Chọn sàn làm việc">
      <DanhSachSan companies={me.companies} />
      <DangXuat />
    </Khung>
  );
}
