import { doiVaiKhiTich } from "@quy-hang/core/access";

/** Câu dưới nhóm Vai của hộp Mời, Sửa. */
export const MO_TA_VAI = "Tích Quản trị sàn hay Trưởng nhóm là tích sẵn các vai đi kèm; bỏ tích vai nào không cần.";

/**
 * Áp luật «vai kéo theo vai» khi ô Checkbox trả về mảng mới: so hai mảng tìm đúng vai vừa đổi rồi hỏi lõi. Mảng không đổi
 * (mở hộp Sửa mà không bấm gì) trả nguyên mảng; lõi quyết kéo theo, màn không tự rẽ nhánh theo tên vai.
 */
export function apDoiVai(truoc: string[], sau: string[]): string[] {
  const vuaBat = sau.find((v) => !truoc.includes(v));
  if (vuaBat) return doiVaiKhiTich(truoc, vuaBat, true);
  const vuaTat = truoc.find((v) => !sau.includes(v));
  return vuaTat ? doiVaiKhiTich(truoc, vuaTat, false) : truoc;
}
