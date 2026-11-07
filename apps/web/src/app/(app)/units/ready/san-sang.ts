// «Sẵn sàng bán» ở hồ sơ căn (hàng 23, luật 17): kiểm bằng luật lõi rồi gửi đúng lệnh của trình sửa ô. Phần thuần — không
// React, không mạng.
import { docCauHinhSanSang, MAC_DINH_ANH_THAT_TOI_THIEU, missingFor, type Requirement, type StandardStatus } from "@quy-hang/core/listing";
import type { UnitPhoto } from "@quy-hang/core/photos";
import type { LoiTrenMay } from "@/lib/sync/ap-tren-may";
import { dungLenhTrangThai, moTaLoi, type HangSua, type Lenh } from "../../inventory/cell-edit/lenh";
import { ID_O_MA_CAN } from "../ho-so/ho-so";

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

/** Neo trong hồ sơ của điều thiếu «Mã căn»: ô mã căn của hàng chưa có mã (ADR-0026) — bấm thì con trỏ tới ô. */
export const NEO_MA_CAN = `#${ID_O_MA_CAN}`;

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
  // Nút chỉ hiện theo cờ «Sẵn sàng bán» của lõi (lopPhuHoSo.sanSang, bảng quyền của hàng) — nên cờ ở đây là true.
  const kq = dungLenhTrangThai(hang, "Active", {}, true);
  if (!kq.ok || !("lenh" in kq)) throw new Error("Sẵn sàng bán: đủ điều mà trình sửa ô không dựng được lệnh");
  return { thieu: [], lenh: kq.lenh };
}

type Fetch = (input: string, init?: RequestInit) => Promise<Response>;

/**
 * Số ảnh thật tối thiểu của sàn từ lối chung cấu hình (mọi thành viên đọc được), giải bằng lõi. Đọc hỏng (mất mạng, máy chủ
 * lỗi, khuôn lạ) → `null` = chưa biết, KHÔNG gộp vào 0: sàn có thể đang đòi ảnh, nên nút xử như sàn đòi ảnh (Ngoài-1 của
 * anh-khong-chan-ban, chủ kho chọn sửa ngay 07/11).
 */
export async function docToiThieuSan(f: Fetch = fetch): Promise<number | null> {
  try {
    const r = await f("/api/v1/company/settings", { credentials: "same-origin" });
    if (!r.ok) return null;
    const ban = (await r.json()) as { items?: unknown };
    if (!Array.isArray(ban.items)) return null;
    return docCauHinhSanSang(ban.items as { key: string; value: unknown }[]).minRealPhotos;
  } catch {
    return null;
  }
}

export const CHU_CAN_MANG_KIEM_ANH = "Cần mạng để kiểm ảnh";
/** Dòng dưới danh sách khi còn «Ảnh thật»: số ảnh là của lần bấm, không đếm lại ngầm (Hỏi-2 của va-san-sang-ban). */
export const CHU_ANH_CAP_NHAT = "Ảnh thật cập nhật khi bấm lại";

export type TrangThaiNut =
  | { kind: "san" }
  | { kind: "can-mang" }
  | { kind: "thieu"; thieu: DieuThieu[]; soAnh: number; toiThieu: number }
  | { kind: "loi"; chu: string }
  | { kind: "da-gui" };

/** Kết quả hàm gửi của trình sửa ô: lệnh vào hàng đợi, hay luật trên máy / kho trên máy từ chối. */
export type KetQuaGui = { ok: true } | { ok: false; loi: LoiTrenMay };

/**
 * Một lần bấm. Sàn đòi ảnh (tối thiểu ≥ 1) hay chưa biết số tối thiểu (`null`, đọc cấu hình hỏng): ngoại tuyến hay đọc lỗi →
 * «Cần mạng để kiểm ảnh», không gửi (không coi lỗi đọc là 0 ảnh, cũng không coi số tối thiểu chưa biết là 0). Sàn không đòi ảnh (tối thiểu 0 — mặc định từ hàng anh-khong-chan-ban): không đếm ảnh, lúc mất mạng vẫn gửi
 * (máy chủ vẫn là bên quyết). Thiếu → danh sách kèm số ảnh đã đếm, không gửi; đủ → gửi đúng một lệnh qua hàm gửi của trình
 * sửa ô. Chỉ báo «đã gửi» khi lệnh vào hàng đợi; không vào thì báo bằng câu của trình sửa ô (một đường lệnh, một lời báo).
 */
export async function bamSanSang(
  hang: HangSua,
  o: {
    onLine: boolean;
    docAnh: () => Promise<{ anh: readonly Pick<UnitPhoto, "compartment" | "isSample">[] }>;
    gui: (lenh: Lenh) => Promise<KetQuaGui>;
    /** Số ảnh thật tối thiểu của sàn (`docToiThieuSan`); `null` = chưa đọc được (xử như sàn đòi ảnh); vắng là mặc định của lõi. */
    toiThieu?: number | null;
  },
): Promise<TrangThaiNut> {
  if (o.toiThieu === null) return { kind: "can-mang" };
  const toiThieu = o.toiThieu ?? MAC_DINH_ANH_THAT_TOI_THIEU;
  let soAnh = 0;
  if (toiThieu > 0) {
    if (!o.onLine) return { kind: "can-mang" };
    try {
      soAnh = demAnhThat((await o.docAnh()).anh);
    } catch {
      return { kind: "can-mang" };
    }
  }
  const kq = kiemSanSang(hang, soAnh, toiThieu);
  if (!kq.lenh) return { kind: "thieu", thieu: kq.thieu, soAnh, toiThieu };
  let gui: KetQuaGui;
  try {
    gui = await o.gui(kq.lenh);
  } catch {
    return { kind: "loi", chu: moTaLoi({ kind: "kho" }) };
  }
  return gui.ok ? { kind: "da-gui" } : { kind: "loi", chu: moTaLoi(gui.loi) };
}

/** Danh sách «Còn thiếu» tính lại từ hàng đang xem với số ảnh của lần bấm: điền xong điều nào thì điều đó rời ngay. */
export function thieuHienTai(tt: TrangThaiNut, hang: HangSua): DieuThieu[] {
  return tt.kind === "thieu" ? kiemSanSang(hang, tt.soAnh, tt.toiThieu).thieu : [];
}

/** Dấu «Chưa có» chỉ thuộc lần rao đã bấm — xem lần rao khác thì không dấu nào. */
export function dauCuaCan(ketQua: { id: string; dich: readonly Dich[] } | null, canId: string): readonly Dich[] {
  return ketQua && ketQua.id === canId ? ketQua.dich : [];
}
