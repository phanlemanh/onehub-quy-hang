// Đọc cách gọi riêng của sàn ở máy chủ cho mọi trang của nhà Bảng hàng (hàng 45): `/inventory` và cách xem đã lưu
// `/inventory/views/<id>` cùng gọi hàm này rồi bọc màn bằng `TuVungProvider`. Đọc hỏng thì chữ dựng sẵn, bảng vẫn mở.
import { tuVungTuBang, TU_VUNG_RONG, type TuVung } from "@quy-hang/core/labels";

import { getApi } from "@/lib/api";

export async function docTuVung(cookie: string): Promise<TuVung> {
  const res = await getApi().request("http://quy-hang.local/api/v1/company/labels", { headers: { cookie } });
  return res.ok ? tuVungTuBang(await res.json()) : TU_VUNG_RONG;
}
