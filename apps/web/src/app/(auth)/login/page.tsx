import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { LoiDocPhien, readMeHayBiBao } from "@/lib/api";
import { nguoiCanXoa } from "@/lib/sync/may-bi-bao";
import { Khung } from "../khung";
import { FormDangNhap } from "./form";
import { KhoiMayBiBao } from "./may-bi-bao";

export const dynamic = "force-dynamic";

export default async function DangNhap({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  // Cơ sở dữ liệu không đọc được phiên (sự cố 06/11): màn đăng nhập vẫn hiện ô nhập như trước — chỉ màn sau đăng nhập
  // đổi sang trang lỗi kèm «Thử lại».
  const doc = await readMeHayBiBao((await headers()).get("cookie") ?? "").catch((e: unknown) => {
    if (e instanceof LoiDocPhien) return null;
    throw e;
  });
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
