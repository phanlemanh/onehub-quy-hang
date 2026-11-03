import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { readMe } from "@/lib/api";
import { Khung } from "../khung";
import { FormDangNhap } from "./form";
import { KhoiMayBiBao } from "./may-bi-bao";

export const dynamic = "force-dynamic";

export default async function DangNhap({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  if (await readMe((await headers()).get("cookie") ?? "")) redirect("/");
  const q = await searchParams;
  const biBao = q["bi-bao-mat"] === "1" && typeof q.u === "string" && q.u ? q.u : null;
  return (
    <Khung title="Đăng nhập Quỹ hàng">
      {biBao ? <KhoiMayBiBao userId={biBao} /> : null}
      <FormDangNhap />
    </Khung>
  );
}
