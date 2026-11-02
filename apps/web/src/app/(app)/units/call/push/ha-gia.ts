/**
 * Hạ giá trong cuộc gọi ép giá (hàng 29, AC-5; luật 7, 14): dùng đúng bộ ghi giá của nhóm «Giá và phí» (hàng 28), thêm phần
 * «trước <giá cũ> · <phần trăm>» vào dòng «Hiểu là…». Không khoá gợi ý nào trong lệnh. Thuần.
 */
import { vietGia, vietPhanTram, type FeeInclusion, type GiaKemPhi } from "@quy-hang/core/pricing";
import { dungGhiGia, type KetQuaGia } from "../gia";

const phanTram = (cu: number, moi: number) => vietPhanTram(Math.round(((moi - cu) / cu) * 100));

export function dungHaGia(cu: GiaKemPhi, chu: string, phi: FeeInclusion | null): KetQuaGia {
  const kq = dungGhiGia(cu, chu, phi);
  if ((kq.kind !== "ghi" && kq.kind !== "hoi-lai") || cu.listPrice === null) return kq;
  return { ...kq, hieuLa: `${kq.hieuLa} · trước ${vietGia(cu.listPrice)} · ${phanTram(cu.listPrice, kq.lenh.listPrice)}` };
}
