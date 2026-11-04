import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { readMeHayBiBao } from "@/lib/api";
import { nguoiCanXoa } from "@/lib/sync/may-bi-bao";
import { Khung } from "../khung";
import { FormDangNhap } from "./form";
import { KhoiMayBiBao } from "./may-bi-bao";

export const dynamic = "force-dynamic";

export default async function DangNhap({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const doc = await readMeHayBiBao((await headers()).get("cookie") ?? "");
  if (doc && "me" in doc) redirect("/");
  // Chỉ xoá khi phiên trên máy này thật sự bị báo mất cho đúng người trong đường dẫn (hàng 38).
  const biBao = nguoiCanXoa(await searchParams, doc && "biBao" in doc ? doc.biBao : null);
  return (
    <Khung title="Đăng nhập Quỹ hàng">
      {biBao ? <KhoiMayBiBao userId={biBao} /> : null}
      <FormDangNhap />
    </Khung>
  );
}
