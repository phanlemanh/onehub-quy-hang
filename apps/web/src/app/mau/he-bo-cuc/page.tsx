import { notFound } from "next/navigation";

import { docToHop } from "./to-hop";
import { TrangMau } from "./trang-mau";

// Trang mẫu sống (ADR-0024 quyết định 8, hàng 91) — dựng qua khuôn TrangMau của nhóm trang-mau. Bản chính thức trả «không
// thấy» (Hỏi-1 hàng 91).
export default async function Page({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  if (process.env.VERCEL_ENV === "production") notFound();
  return <TrangMau che="tong" {...docToHop(await searchParams)} />;
}
