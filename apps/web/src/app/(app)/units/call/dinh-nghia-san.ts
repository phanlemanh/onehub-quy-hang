// Định nghĩa bao phí hiện hành của sàn cho màn cuộc gọi (hàng 49, AC-8): đọc lối chung cấu hình (mọi thành viên đọc được),
// giải bằng lõi. Đọc hỏng thì mặc định sản phẩm — máy tính vẫn chạy, như trước hàng 49.
import { giaiCauHinh } from "@quy-hang/core/config";
import { DINH_NGHIA_MAC_DINH, dinhNghiaBaoPhi, type DinhNghiaBaoPhi } from "@quy-hang/core/pricing";

type Fetch = (input: string, init?: RequestInit) => Promise<Response>;

/** Định nghĩa từ phản hồi của `GET /api/v1/company/settings`. */
export function dinhNghiaTuBan(ban: { items: { key: string; value: unknown }[] } | null): DinhNghiaBaoPhi {
  if (!ban) return DINH_NGHIA_MAC_DINH;
  const { cauHinh } = giaiCauHinh(ban.items.filter((x) => x.key.startsWith("fee.")).map((x) => ({ key: x.key, value: x.value })));
  return dinhNghiaBaoPhi(cauHinh);
}

export async function docDinhNghiaSan(f: Fetch = fetch): Promise<DinhNghiaBaoPhi> {
  try {
    const r = await f("/api/v1/company/settings", { credentials: "same-origin" });
    return dinhNghiaTuBan(r.ok ? ((await r.json()) as { items: { key: string; value: unknown }[] }) : null);
  } catch {
    return DINH_NGHIA_MAC_DINH;
  }
}
