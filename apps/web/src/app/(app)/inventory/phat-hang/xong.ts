/**
 * Một lần xuất xong (hàng 43, AC-4, AC-8, design §5): làm việc của người TRƯỚC — chép bài vào bộ nhớ tạm hay tải file —
 * rồi mới ghi lần xuất ở máy chủ. Việc hỏng thì không ghi (không có lần xuất oan); ghi hỏng (mất mạng, máy chủ từ chối)
 * thì bài, file vẫn có, kèm một dòng «Chưa ghi được lần xuất», không thử lại (bản đầu không xếp hàng gửi lại).
 *
 * Mạng duy nhất của hộp thoại là `POST /api/v1/exports` — thân chỉ mẫu, người nhận, số căn; không nội dung, không danh
 * sách căn. Hệ thống không gửi, không đăng bài ở đâu (bất biến 3): người tự dán và bấm gửi.
 */
import { dinhNghiaMau, tenTep, type BanXuat } from "@quy-hang/core/export";

export const DUONG_GHI = "/api/v1/exports";
export const CHUA_GHI = "Chưa ghi được lần xuất";
export const DA_CHEP = "Đã chép bài";
export const daTai = (ten: string) => `Đã tải ${ten}`;

export type KetQuaXong =
  | { ok: true; thongBao: string; chuaGhi: typeof CHUA_GHI | null }
  | { ok: false; loi: string };

export async function xongLanXuat({
  hanhDong,
  ghi,
  thongBao,
  loi,
}: {
  /** Chép hay tải — làm trước. */
  hanhDong: () => Promise<void>;
  /** Ghi lần xuất — chỉ khi `hanhDong` xong. */
  ghi: () => Promise<Response>;
  thongBao: string;
  loi: string;
}): Promise<KetQuaXong> {
  try {
    await hanhDong();
  } catch {
    return { ok: false, loi };
  }
  try {
    const r = await ghi();
    return { ok: true, thongBao, chuaGhi: r.ok ? null : CHUA_GHI };
  } catch {
    return { ok: true, thongBao, chuaGhi: CHUA_GHI };
  }
}

/** Những gì của trình duyệt mà một lần xuất cần — bài kiểm trao bản giả. */
export type MoiTruong = {
  clipboard: { writeText: (s: string) => Promise<void> };
  fetch: (url: string, init: RequestInit) => Promise<Response>;
  /** Dựng tệp của mẫu Excel, Ảnh, PDF từ bản xuất. */
  dungTep: (ban: BanXuat) => Promise<Blob>;
  /** Đưa tệp về máy (link tải). */
  taiVe: (tep: Blob, ten: string) => void;
};

function ghiLanXuat(ban: BanXuat, mt: MoiTruong): Promise<Response> {
  return mt.fetch(DUONG_GHI, {
    method: "POST",
    credentials: "same-origin",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ format: ban.mau, recipient: ban.nguoiNhan, listingCount: ban.soCan }),
  });
}

/** Bước 4 của hộp thoại: «Chép bài» với mẫu bài, «Tải file» với mẫu tệp. `today` đặt tên tệp. */
export function lamXuat(ban: BanXuat, today: string, mt: MoiTruong): Promise<KetQuaXong> {
  const ghi = () => ghiLanXuat(ban, mt);
  if (dinhNghiaMau(ban.mau).loai === "bai") {
    const bai = ban.bai ?? "";
    return xongLanXuat({ hanhDong: () => mt.clipboard.writeText(bai), ghi, thongBao: DA_CHEP, loi: "Chưa chép được bài" });
  }
  const ten = tenTep(ban.mau, today);
  return xongLanXuat({
    hanhDong: async () => mt.taiVe(await mt.dungTep(ban), ten),
    ghi,
    thongBao: daTai(ten),
    loi: "Chưa tải được file",
  });
}
