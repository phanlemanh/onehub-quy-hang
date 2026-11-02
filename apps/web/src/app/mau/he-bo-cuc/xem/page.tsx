import { notFound } from "next/navigation";

import { docToHop } from "../to-hop";
import { TrangMau } from "../trang-mau";

// Một tổ hợp của trang mẫu sống, dựng trong vỏ thật với người mẫu — không đọc phiên, không gọi API. Trang tổ hợp nhúng
// trang này ở từng bề rộng; máy chụp ảnh chuẩn mở thẳng địa chỉ này ở đúng khổ.
export default async function Page({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  if (process.env.VERCEL_ENV === "production") notFound();
  return <TrangMau che="xem" {...docToHop(await searchParams)} />;
}
