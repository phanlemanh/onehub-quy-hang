/**
 * Bộ đọc giá (hàng 15, luật 7): chữ đầu chủ gõ trên ô → số đồng. Nhận cách nói của nghề — «4,65 tỷ», «4ty65», «4 tỷ 650»,
 * «950 triệu», «950tr», số đủ «4.650.000.000». Không đoán: chữ không khớp một khuôn rõ ràng thì «chưa hiểu», để máy nói lại
 * «Hiểu là…» chỉ khi chắc. Tính bằng số nguyên theo từng chữ số, không qua số thực (4,65 × 10⁹ không lệch một đồng).
 */

export const TY = 1_000_000_000;
export const TRIEU = 1_000_000;
/** Giá lớn nhất nhận: 1.000 tỷ. */
export const GIA_TOI_DA = 1_000 * TY;
/** Số trần không đơn vị phải từ 1 triệu: «12» hay «950» là mơ hồ (tỷ? triệu?). */
const SO_TRAN_TOI_THIEU = TRIEU;
const DO_DAI_TOI_DA = 40;

export type KetQuaDocGia = { ok: true; dong: number } | { ok: false };

const CHUA_HIEU: KetQuaDocGia = { ok: false };

const DON_VI: Record<string, number> = { "tỷ": TY, "tỉ": TY, ty: TY, ti: TY, t: TY, "triệu": TRIEU, trieu: TRIEU, tr: TRIEU };
const DV = "tỷ|tỉ|ty|ti|triệu|trieu|tr|t";

/** «4,65» × đơn vị → số đồng, bằng chữ số (không số thực). Phần lẻ dài hơn số chữ số của đơn vị thì không nhận. */
function nhan(nguyen: string, le: string, donVi: number): number | null {
  const soChuSoDonVi = String(donVi).length - 1;
  if (le.length > soChuSoDonVi) return null;
  return Number(nguyen) * donVi + (le ? Number(le.padEnd(soChuSoDonVi, "0")) : 0);
}

function trongKhoang(dong: number | null): KetQuaDocGia {
  return dong !== null && Number.isSafeInteger(dong) && dong > 0 && dong <= GIA_TOI_DA ? { ok: true, dong } : CHUA_HIEU;
}

export function docGia(chu: string): KetQuaDocGia {
  if (typeof chu !== "string" || chu.length > DO_DAI_TOI_DA) return CHUA_HIEU;
  const s = chu.trim().toLowerCase().replace(/\s+/g, " ").replace(/\s*(đồng|đ|vnd)$/, "");
  if (!s) return CHUA_HIEU;

  // Số đủ: «4650000000», «4.650.000.000», «4,650,000,000», «4 650 000 000».
  const du = /^\d{1,3}(?:([.,\s])\d{3}(?:\1\d{3})*)?$|^\d+$/.exec(s);
  if (du) {
    const dong = Number(s.replace(/[.,\s]/g, ""));
    return dong >= SO_TRAN_TOI_THIEU ? trongKhoang(dong) : CHUA_HIEU;
  }

  // «4 tỷ 650 triệu».
  const haiDonVi = new RegExp(`^(\\d+)(?:[.,](\\d+))? ?(tỷ|tỉ|ty|ti|t) ?(\\d+)(?:[.,](\\d+))? ?(triệu|trieu|tr)$`).exec(s);
  if (haiDonVi) {
    const [, n1, l1 = "", , n2, l2 = ""] = haiDonVi;
    const ty = nhan(n1!, l1, TY);
    const tr = nhan(n2!, l2, TRIEU);
    return ty === null || tr === null || Number(n2) >= 1000 ? CHUA_HIEU : trongKhoang(ty + tr);
  }

  // «4,65 tỷ», «950 triệu», «4,65t», «4 tỷ 650», «4ty65» — phần sau đơn vị tỷ là chữ số lẻ của tỷ.
  const motDonVi = new RegExp(`^(\\d+)(?:[.,](\\d+))? ?(${DV})(?: ?(\\d{1,3}))?$`).exec(s);
  if (motDonVi) {
    const [, nguyen, le = "", dv, sau] = motDonVi;
    const donVi = DON_VI[dv!]!;
    if (sau !== undefined) {
      // Đuôi chỉ hợp với «tỷ» và khi trước đó chưa có phần lẻ: «4 tỷ 650» = 4,650 tỷ.
      if (donVi !== TY || le) return CHUA_HIEU;
      return trongKhoang(nhan(nguyen!, sau, TY));
    }
    return trongKhoang(nhan(nguyen!, le, donVi));
  }

  return CHUA_HIEU;
}

/** Phần nguyên và phần lẻ của `dong` theo đơn vị, bằng số nguyên (không số thực); số 0 cuối của phần lẻ cắt đi. */
function vietTheo(dong: number, donVi: number): string {
  const le = String(dong % donVi).padStart(String(donVi).length - 1, "0").replace(/0+$/, "");
  return le ? `${Math.floor(dong / donVi)},${le}` : String(Math.floor(dong / donVi));
}

/**
 * «4,655 tỷ» · «1,234567 triệu» · «1000 tỷ» — viết đúng từng đồng (va-sua-tren-o): `docGia(vietGia(x)).dong === x` với mọi
 * số nguyên đồng bộ đọc nhận. Không dấu chấm nghìn: bộ đọc coi dấu chấm là dấu lẻ. Cột Giá của Bảng hàng viết gọn riêng.
 */
export function vietGia(dong: number): string {
  return dong >= TY ? `${vietTheo(dong, TY)} tỷ` : `${vietTheo(dong, TRIEU)} triệu`;
}
