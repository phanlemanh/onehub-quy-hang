/**
 * Luật «vai kéo theo vai» (hàng chu-san-du-vai; Tham chiếu §12: cách B 06/11, H-33 08/11). Trao vai trên là trao kèm vai
 * dưới, gỡ bớt được, không đổi luật theo dòng. Bảng ở `goi-vai.json` là nguồn duy nhất: màn Người dùng đọc ở đây, công cụ
 * mở sàn đọc thẳng tệp JSON. Kéo theo chỉ xảy ra lúc tích; máy chủ lưu đúng điều được gửi nên người chỉ cấu hình vẫn có.
 */
import { ROLES, isRole, type Role } from "../navigation";
import bang from "./goi-vai.json" with { type: "json" };

/** Vai trên → các vai nó kéo theo. Bảng giữ cứng (Hỏi-4, lý do quyền và an toàn của ADR-0022). */
export const VAI_KEO_THEO = bang as Partial<Record<Role, readonly Role[]>>;

/** Năm vai của người đầu tiên một sàn mới. */
export const DU_NAM_VAI: readonly Role[] = ROLES;

/** Vai sau khi một ô đổi: bật thì thêm vai ấy và các vai nó kéo theo; tắt thì chỉ bớt đúng vai ấy. */
export function doiVaiKhiTich(hienTai: readonly string[], vai: string, bat: boolean): string[] {
  if (!bat) return hienTai.filter((v) => v !== vai);
  const keoTheo = isRole(vai) ? (VAI_KEO_THEO[vai] ?? []) : [];
  return [...new Set([...hienTai, vai, ...keoTheo])];
}

/** Lỗi của một bảng kéo theo — rỗng là hợp lệ. */
export function kiemBangVai(b: Record<string, readonly string[]>): string[] {
  const loi: string[] = [];
  for (const [tren, duoi] of Object.entries(b)) {
    if (!isRole(tren)) loi.push(`mã vai lạ: ${tren}`);
    for (const v of duoi) {
      if (!isRole(v)) loi.push(`mã vai lạ: ${v}`);
      else if (v === tren) loi.push(`vai kéo theo chính nó: ${v}`);
    }
  }
  return loi;
}
