// Đọc cách gọi riêng của sàn ở máy chủ cho mọi trang của nhà Bảng hàng (hàng 45): `/inventory` và cách xem đã lưu
// `/inventory/views/<id>` cùng gọi hàm này rồi bọc màn bằng `TuVungProvider`. Đọc hỏng thì chữ dựng sẵn, bảng vẫn mở.
// Hàng 47: kèm bộ trường riêng của sàn — đọc hỏng là `null` (chưa tải), khác bộ rỗng: Bảng hàng không dựng cột trường
// riêng và không đụng cột, lọc trường riêng của góc nhìn đã lưu.
import { boTuThan } from "@quy-hang/core/custom-fields";
import { tuVungTuBang, TU_VUNG_RONG, type TuVung } from "@quy-hang/core/labels";

import { getApi } from "@/lib/api";

export async function docTuVung(cookie: string): Promise<TuVung> {
  const [res, truong] = await Promise.all([
    getApi().request("http://quy-hang.local/api/v1/company/labels", { headers: { cookie } }),
    getApi().request("http://quy-hang.local/api/v1/company/fields", { headers: { cookie } }),
  ]);
  const tv = res.ok ? tuVungTuBang(await res.json()) : TU_VUNG_RONG;
  return { ...tv, truongRieng: truong.ok ? boTuThan((await truong.json()) as { fields?: unknown[] }) : null };
}
