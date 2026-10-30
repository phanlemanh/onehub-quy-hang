import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { readMe } from "@/lib/api";
import { Khung } from "../khung";
import { FormDangNhap } from "./form";

export const dynamic = "force-dynamic";

export default async function DangNhap() {
  if (await readMe((await headers()).get("cookie") ?? "")) redirect("/");
  return (
    <Khung title="Đăng nhập Quỹ hàng">
      <FormDangNhap />
    </Khung>
  );
}
