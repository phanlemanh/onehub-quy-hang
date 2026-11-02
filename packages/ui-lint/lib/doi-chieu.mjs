// Kế hoạch cặp ảnh đối chiếu (hồ sơ vong-giao-dien-qua-ban-do; ảnh chuẩn theo bố cục — hàng 91, ADR-0024). Hàm thuần:
// nhận bản đồ, danh sách tệp vòng đổi và phép hỏi «tệp có ở base không», trả mảng cặp; không đọc git, không ghi tệp.
import { existsSync } from "node:fs";
import { join } from "node:path";

import { nhomCuaTep } from "./ban-do.mjs";

/** Khổ máy tính và điện thoại mà skill quy-hang-ui buộc nhìn màn đang chạy. */
export const KHO = [1440, 375];
export const tenAnh = (nhom, tt, kho, phia) => `${nhom}--${tt}--${kho}--${phia}.png`;
/** Ảnh chuẩn của một bố cục ở một khổ, chụp từ trang mẫu sống (`design/anh-chuan/`). */
export const anhChuan = (boCuc, kho) => `design/anh-chuan/${boCuc}-${kho}.png`;

/**
 * Mỗi màn vòng đổi thuộc một nhóm đơn vị màn sinh cặp «màn mới · màn mẫu» cho mỗi trạng thái của màn mẫu × hai khổ.
 * Nhóm khai `bo_cuc` mà màn mẫu chưa có ở base (nhóm mới, màn mẫu chính là màn vòng này dựng) thì màn mới so với ảnh
 * chuẩn của bố cục ở trạng thái mặc định — so một màn với chính nó không nói được gì.
 * @param {string} root
 * @param {{ nhom: object[] }} banDo
 * @param {string[]} doi tệp vòng đổi (cả tệp chưa theo dõi), đường tương đối gốc kho
 * @param {(tep: string) => boolean} coTaiBase
 */
export function keHoachDoiChieu(root, banDo, doi, coTaiBase) {
  const cap = [];
  const daDung = new Map();
  for (const tep of doi)
    for (const g of nhomCuaTep(banDo, tep).filter((g) => g.donVi === "man")) {
      if (!existsSync(join(root, tep))) continue;
      const { nhom, mau_dang_chay: mau, bo_cuc: boCuc } = g.data;
      const n = (daDung.get(nhom) ?? 0) + 1;
      daDung.set(nhom, n);
      const phia = n === 1 ? "moi" : `moi-${n}`;
      if (boCuc && !coTaiBase(mau.tep)) {
        for (const kho of KHO)
          cap.push({
            nhom,
            trang_thai: "mac-dinh",
            kho,
            tep_moi: tep,
            mau: { tep: null, duong: `ảnh chuẩn ${boCuc}` },
            anh_moi: tenAnh(nhom, "mac-dinh", kho, phia),
            anh_mau: null,
            anh_chuan: anhChuan(boCuc, kho),
          });
        continue;
      }
      for (const tt of mau.trang_thai)
        for (const kho of KHO)
          cap.push({
            nhom,
            trang_thai: tt,
            kho,
            tep_moi: tep,
            mau: { tep: mau.tep, duong: mau.duong },
            anh_moi: tenAnh(nhom, tt, kho, phia),
            anh_mau: tenAnh(nhom, tt, kho, "mau"),
          });
    }
  return cap;
}
