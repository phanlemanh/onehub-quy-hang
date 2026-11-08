// Cửa của màn ghi cuộc gọi (`/units/call`): ai vào được. Đọc đúng luật `vaoManCuocGoi` của lõi — cũng là luật mà nút
// «Ghi cuộc gọi» của hồ sơ căn đọc qua cờ `ghiCuocGoi` (hàng va-nut-ghi-cuoc-goi-truong-nhom), nên nút không bao giờ dẫn tới
// trang không có. Trang không tự đọc tên vai.
import { vaoManCuocGoi } from "@quy-hang/core/access";

export type NguoiVao = { activeCompany: { roles: readonly string[] } | null } | null | undefined;

/** Người đang đăng nhập có vào được màn ghi cuộc gọi của sàn đang làm không. */
export function moDuocManCuocGoi(me: NguoiVao): boolean {
  return !!me?.activeCompany && vaoManCuocGoi({ roles: me.activeCompany.roles });
}
