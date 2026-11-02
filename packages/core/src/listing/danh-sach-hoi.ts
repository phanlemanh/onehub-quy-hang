/**
 * Danh sách hỏi của chế độ cuộc gọi (hàng 28, luật 16): đúng năm mục của mức đủ, theo thứ tự của `COMPLETENESS_ITEMS` —
 * năm mục giữ cứng vì là mẫu số của mức đủ (nghĩa chuẩn để so giữa các sàn). Bộ lựa chọn của từng mục là mặc định của
 * sàn (Hỏi-2, Cổng Phạm vi 02/11): sàn ghi đè khi có sổ từ vựng (hàng 90); tới lúc ấy mọi màn đọc một chỗ này. Giá trị ghi
 * vào hồ sơ là nhãn của lựa chọn (bốn phần của lần rao là chữ tự do của sàn); mã RESO neo nghĩa khi RESO có.
 */
import type { CompletenessItem } from "./completeness";
import type { DetailField } from "./events";

export type LuaChon = { nhan: string; reso?: string };

export type MucHoi =
  | { ma: "price"; nhan: string }
  | { ma: DetailField; nhan: string; luaChon: readonly LuaChon[] };

export const DANH_SACH_HOI = [
  { ma: "price", nhan: "Giá và phí" },
  {
    ma: "furnished",
    nhan: "Nội thất",
    luaChon: [
      { nhan: "Đủ đồ", reso: "Furnished" },
      { nhan: "Cơ bản", reso: "Partially" },
      { nhan: "Thô", reso: "Unfurnished" },
    ],
  },
  { ma: "legalStatus", nhan: "Pháp lý", luaChon: [{ nhan: "Có sổ" }, { nhan: "Đang làm sổ" }, { nhan: "Hợp đồng mua bán" }] },
  { ma: "financing", nhan: "Tài chính", luaChon: [{ nhan: "Không vay" }, { nhan: "Đang vay" }] },
  {
    ma: "occupantType",
    nhan: "Tình trạng sử dụng",
    luaChon: [
      { nhan: "Trống", reso: "Vacant" },
      { nhan: "Chủ ở", reso: "Owner" },
      { nhan: "Đang cho thuê", reso: "Tenant" },
    ],
  },
] as const satisfies readonly MucHoi[];

/** Mục hỏi theo mã mức đủ. */
export const mucHoi = (ma: CompletenessItem): MucHoi => DANH_SACH_HOI.find((m) => m.ma === ma)!;

/** Thứ tự mục — kiểm ở bài kiểm, giữ trùng `COMPLETENESS_ITEMS`. */
export const MA_DANH_SACH_HOI: readonly CompletenessItem[] = DANH_SACH_HOI.map((m) => m.ma);
