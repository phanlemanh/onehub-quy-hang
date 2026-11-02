/**
 * Nhóm «Giá và phí» của danh sách hỏi (hàng 28, AC-7; luật 7): ô chữ đọc theo cách nói của nghề, máy nói lại «Hiểu là…»
 * trước khi ghi, đổi quá ngưỡng hay đổi điều kiện phí thì hỏi lại kèm giá cũ → mới. Thuần — màn và bài kiểm cùng đọc.
 */
import { canHoiLai, docGia, vietGia, vietPhanTram, type FeeInclusion, type GiaKemPhi } from "@quy-hang/core/pricing";

export const NHAN_PHI: Record<FeeInclusion, string> = { included: "bao phí", excluded: "không bao phí" };

export type LenhGia = { listPrice: number; feeInclusion: FeeInclusion };
export type KetQuaGia =
  | { kind: "chua-hieu"; loi: string }
  | { kind: "chon-phi" }
  | { kind: "ghi"; lenh: LenhGia; hieuLa: string }
  | { kind: "hoi-lai"; lenh: LenhGia; hieuLa: string; cuMoi: string; phanTram: string | null };

const viet = (g: LenhGia) => `${vietGia(g.listPrice)} · ${NHAN_PHI[g.feeInclusion]}`;

/** Chữ gợi sẵn trong ô: giá của hồ sơ khi có, chưa có thì giá chủ báo lúc nhập lead. */
export function goiYGia(hoSo: GiaKemPhi | null, lead: LenhGia): { chu: string; phi: FeeInclusion } {
  if (hoSo?.listPrice != null && hoSo.feeInclusion) return { chu: vietGia(hoSo.listPrice), phi: hoSo.feeInclusion };
  return { chu: vietGia(lead.listPrice), phi: lead.feeInclusion };
}

/** Dòng sống dưới ô: «Hiểu là 2,8 tỷ · bao phí»; `null` khi chưa hiểu hay chưa chọn phí. */
export function hieuLa(chu: string, phi: FeeInclusion | null): string | null {
  const kq = docGia(chu);
  return kq.ok && phi ? `Hiểu là ${viet({ listPrice: kq.dong, feeInclusion: phi })}` : null;
}

/** Enter ở ô giá: chữ + điều kiện phí trên giá hiện tại của hồ sơ → ghi, hỏi lại, hay báo. */
export function dungGhiGia(cu: GiaKemPhi, chu: string, phi: FeeInclusion | null): KetQuaGia {
  const kq = docGia(chu);
  if (!kq.ok) return { kind: "chua-hieu", loi: `Chưa hiểu «${chu.trim()}» — gõ như 2,75 tỷ hoặc 950 triệu` };
  if (!phi) return { kind: "chon-phi" };
  const lenh = { listPrice: kq.dong, feeInclusion: phi };
  const hoi = canHoiLai(cu, lenh);
  const hieu = `Hiểu là ${viet(lenh)}`;
  if (!hoi.hoi || cu.listPrice === null || !cu.feeInclusion) return { kind: "ghi", lenh, hieuLa: hieu };
  return {
    kind: "hoi-lai",
    lenh,
    hieuLa: hieu,
    cuMoi: `${viet({ listPrice: cu.listPrice, feeInclusion: cu.feeInclusion })} → ${viet(lenh)}`,
    phanTram: hoi.phanTram === null ? null : vietPhanTram(hoi.phanTram),
  };
}
