// «Sẵn sàng bán» ở hồ sơ căn (hàng 23, luật 17): kiểm bằng luật lõi rồi gửi đúng lệnh của trình sửa ô. Phần thuần — không
// React, không mạng.
import { MAC_DINH_ANH_THAT_TOI_THIEU, missingFor, type Requirement, type StandardStatus } from "@quy-hang/core/listing";
import type { UnitPhoto } from "@quy-hang/core/photos";
import { dungLenhTrangThai, type HangSua, type Lenh } from "../../inventory/cell-edit/lenh";

/** Hai trạng thái có lối lên Đang bán mà không phải khách bỏ cọc (Pending → Active giữ ở trình sửa ô). */
const CO_NUT: readonly StandardStatus[] = ["Incomplete", "Hold"];

/** Có nút khi lần rao ở Chưa đủ để rao hay Tạm ngừng và người xem sửa được hàng. */
export function hienNutSanSang(trangThai: StandardStatus, suaDuoc: boolean): boolean {
  return suaDuoc && CO_NUT.includes(trangThai);
}

/** Ảnh thật như máy chủ đếm: ngăn Gửi được, không «Ảnh mẫu»; API ảnh không trả ảnh đã xoá. */
export function demAnhThat(anh: readonly Pick<UnitPhoto, "compartment" | "isSample">[]): number {
  return anh.filter((p) => p.compartment === "shareable" && !p.isSample).length;
}

/** Chỗ chỉ tới cho một điều thiếu: mục Ảnh, ô giá ở đầu cột, hay ô của mục «Lần rao đang mở». */
export type Dich = "ma" | "anh" | "gia" | "legalStatus" | "occupantType";
export type DieuThieu = { nhan: string; dich: Dich };

/** Nhãn và chỗ của mỗi điều thiếu khi vào Đang bán; giá và điều kiện phí gộp một dòng «Giá về tay» (tới hàng 28). */
const DIEU: Partial<Record<Requirement, DieuThieu>> = {
  unitNumber: { nhan: "Mã căn", dich: "ma" },
  listPrice: { nhan: "Giá về tay", dich: "gia" },
  feeInclusion: { nhan: "Giá về tay", dich: "gia" },
  realPhoto: { nhan: "Ảnh thật", dich: "anh" },
  legalStatus: { nhan: "Pháp lý", dich: "legalStatus" },
  occupantType: { nhan: "Tình trạng sử dụng", dich: "occupantType" },
};

export type KetQuaSanSang = { thieu: DieuThieu[]; lenh: Lenh | null };

/**
 * Kiểm bằng luật lõi với số ảnh thật đã đếm. Thiếu → danh sách theo thứ tự của lõi, không lệnh. Đủ → đúng lệnh mà trình sửa
 * ô dựng (một đường lệnh). Số tối thiểu mặc định của lõi: sàn đặt khác thì máy chủ vẫn là bên quyết.
 */
export function kiemSanSang(hang: HangSua, soAnhThat: number, toiThieu = MAC_DINH_ANH_THAT_TOI_THIEU): KetQuaSanSang {
  const thieu: DieuThieu[] = [];
  for (const k of missingFor("Active", { ...hang, realPhotoCount: soAnhThat, minRealPhotos: toiThieu })) {
    const d = DIEU[k];
    if (!d) throw new Error(`Sẵn sàng bán: chưa có nhãn cho điều «${k}»`);
    if (!thieu.some((t) => t.nhan === d.nhan)) thieu.push(d);
  }
  if (thieu.length) return { thieu, lenh: null };
  const kq = dungLenhTrangThai(hang, "Active");
  if (!kq.ok || !("lenh" in kq)) throw new Error("Sẵn sàng bán: đủ điều mà trình sửa ô không dựng được lệnh");
  return { thieu: [], lenh: kq.lenh };
}

export const CHU_CAN_MANG_KIEM_ANH = "Cần mạng để kiểm ảnh";

export type TrangThaiNut =
  | { kind: "san" }
  | { kind: "can-mang" }
  | { kind: "thieu"; thieu: DieuThieu[] }
  | { kind: "da-gui" };

/**
 * Một lần bấm: ngoại tuyến hay đọc ảnh lỗi → «Cần mạng để kiểm ảnh», không gửi (không coi lỗi đọc là 0 ảnh); thiếu → danh
 * sách, không gửi; đủ → gửi đúng một lệnh qua hàm gửi của trình sửa ô (hàng đợi đồng bộ).
 */
export async function bamSanSang(
  hang: HangSua,
  o: {
    onLine: boolean;
    docAnh: () => Promise<{ anh: readonly Pick<UnitPhoto, "compartment" | "isSample">[] }>;
    gui: (lenh: Lenh) => Promise<unknown>;
  },
): Promise<TrangThaiNut> {
  if (!o.onLine) return { kind: "can-mang" };
  let soAnh: number;
  try {
    soAnh = demAnhThat((await o.docAnh()).anh);
  } catch {
    return { kind: "can-mang" };
  }
  const kq = kiemSanSang(hang, soAnh);
  if (!kq.lenh) return { kind: "thieu", thieu: kq.thieu };
  await o.gui(kq.lenh);
  return { kind: "da-gui" };
}
