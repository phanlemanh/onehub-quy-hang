/**
 * Cột của Bảng hàng (hàng 14): một dòng là một hàng của sàn đã ghép thuộc tính căn từ danh mục. Tên theo RESO, nhãn theo
 * `CONTEXT.md`. Thuần — không React — để lọc, nhóm, góc nhìn và bài kiểm cùng đọc một bảng.
 */
import { nhanGiaTri, nhanTruong, type TuVung } from "@quy-hang/core/labels";
import type { StandardStatus } from "@quy-hang/core/listing";
import { NHAN_TRANG_THAI_MAC_DINH, nhanCuaCan } from "@quy-hang/core/statuses";
import { MAU_TRANG_THAI, type MauTrangThai } from "@/lib/mau-trang-thai";
import { chuOTruongRieng, cotTruongRieng, laCotRieng, type CotRiengId } from "./truong-rieng";

/** Một dòng của bảng. Không trường nguồn nào: hàng đến từ API không chở lớp `source`. */
export type DongBang = {
  id: string;
  buildingName: string;
  unitNumber: string | null;
  unitType: string;
  livingArea: number | null;
  floor: number | null;
  directionFaces: string | null;
  standardStatus: StandardStatus;
  /** Mã nhãn trạng thái riêng của sàn mà căn mang (hàng 46); vắng hay `null` = nhãn mặc định. Không phải cột — chữ của ô
   * Trạng thái đọc nó qua `chuCuaO`; lọc và đếm vẫn theo `standardStatus`. */
  statusLabel?: string | null;
  listPrice: number | null;
  feeInclusion: string | null;
  furnished: string | null;
  legalStatus: string | null;
  financing: string | null;
  occupantType: string | null;
  /** Số ngày từ lần xác nhận với chủ nhà; chưa từng xác nhận là `null`. */
  confirmedAgeDays: number | null;
  needsCallBack: boolean;
  /** Số mục đã có của mức đủ: năm mục của danh sách hỏi, cộng mục ảnh khi bản xem mang số ảnh (anh-khong-chan-ban). */
  completeness: number | null;
  /** Tổng mục của mức đủ khi khác năm (6: có mục ảnh) — vắng là năm. */
  mucDuTong?: number;
  /** Căn chưa có ảnh thật gửi được — dấu «thiếu ảnh thật» ở ô Mức đủ (anh-khong-chan-ban). */
  thieuAnh?: boolean;
  visibility: "Private" | "Company" | null;
  closePrice: number | null;
  closeDate: string | null;
  withdrawnReason: string | null;
  /** RESO `PropertySubType` từ danh mục (hàng 22) — không phải cột của bảng. */
  propertySubType?: string | null;
  /**
   * Cột «Đầu chủ» (hàng 105, nguồn AC-4 hàng 89): chữ ô đã tính từ `listAgentKey` (RESO `ListAgentKey`) của hàng đối với
   * danh bạ đầu chủ của sàn — `chuDauChu`. Chỉ đọc; dòng dựng ngoài Bảng hàng không có khoá này.
   */
  "dau-chu"?: string;
  /** Trường riêng của sàn (hàng 47): `custom:<mã>` → chữ thô của giá trị ("true" · "false" · mã lựa chọn). */
  [k: CotRiengId]: string | undefined;
};

/** Cột chuẩn của bảng. */
export type CotChuanId = Exclude<keyof DongBang, "id" | "needsCallBack" | "propertySubType" | "statusLabel" | CotRiengId>;
/** Cột chuẩn hay cột trường riêng của sàn (hàng 47). */
export type CotId = CotChuanId | CotRiengId;
/** Kiểu ô lọc của cột: chữ chứa · chọn một giá trị · luật số. */
export type KieuCot = "chu" | "chon" | "so";

export type Cot = {
  id: CotId;
  label: string;
  kind: KieuCot;
  size: number;
  /** Gợi ý trong ô lọc. */
  filterHint: string;
  /** Ô lọc số của cột đọc theo đơn vị này (Giá gõ theo tỷ). */
  scale?: number;
};

/** Nhãn mặc định của sáu trạng thái — đọc từ lõi (`NHAN_TRANG_THAI_MAC_DINH`, hàng 46), chữ không đổi. */
export const STATUS_LABEL: Readonly<Record<StandardStatus, string>> = NHAN_TRANG_THAI_MAC_DINH;
export const FEE_LABEL: Record<string, string> = { included: "Bao phí", excluded: "Không bao phí" };
export const VISIBILITY_LABEL: Record<string, string> = { Private: "Chỉ tôi", Company: "Toàn sàn" };
export const WITHDRAWN_LABEL: Record<string, string> = {
  sold_elsewhere: "Chủ đã bán nơi khác",
  owner_changed_mind: "Chủ đổi ý",
  unreachable: "Không liên lạc được",
};
export const CHUA_RO = "Chưa rõ";

const TY = 1_000_000_000;
// Dựng một lần: `toLocaleString` dựng bộ định dạng mỗi lần gọi — đắt khi cuộn 5.000 dòng (máy đo E11).
const SO_2 = new Intl.NumberFormat("vi-VN", { maximumFractionDigits: 2 });
const SO_NGUYEN = new Intl.NumberFormat("vi-VN");

export const COT: readonly Cot[] = [
  { id: "buildingName", label: "Toà", kind: "chon", size: 110, filterHint: "Mọi toà" },
  { id: "unitNumber", label: "Mã căn", kind: "chu", size: 130, filterHint: "Chứa…" },
  { id: "unitType", label: "Loại căn", kind: "chon", size: 120, filterHint: "Mọi loại" },
  { id: "livingArea", label: "Diện tích", kind: "so", size: 110, filterHint: ">60" },
  { id: "floor", label: "Tầng", kind: "so", size: 90, filterHint: "5-15" },
  { id: "directionFaces", label: "Hướng", kind: "chu", size: 120, filterHint: "Chứa…" },
  { id: "standardStatus", label: "Trạng thái", kind: "chon", size: 160, filterHint: "Mọi trạng thái" },
  { id: "listPrice", label: "Giá", kind: "so", size: 120, filterHint: "<=5 (tỷ)", scale: TY },
  { id: "feeInclusion", label: "Phí", kind: "chon", size: 140, filterHint: "Mọi điều kiện" },
  { id: "furnished", label: "Nội thất", kind: "chu", size: 130, filterHint: "Chứa…" },
  { id: "legalStatus", label: "Pháp lý", kind: "chu", size: 130, filterHint: "Chứa…" },
  { id: "financing", label: "Tài chính", kind: "chu", size: 130, filterHint: "Chứa…" },
  { id: "occupantType", label: "Tình trạng sử dụng", kind: "chu", size: 170, filterHint: "Chứa…" },
  { id: "confirmedAgeDays", label: "Xác nhận", kind: "so", size: 130, filterHint: "<14 (ngày)" },
  { id: "dau-chu", label: "Đầu chủ", kind: "chon", size: 150, filterHint: "Mọi đầu chủ" },
  { id: "completeness", label: "Mức đủ", kind: "so", size: 100, filterHint: ">=3" },
  { id: "visibility", label: "Ai thấy", kind: "chon", size: 120, filterHint: "Mọi nấc" },
  { id: "closePrice", label: "Giá chốt", kind: "so", size: 120, filterHint: "<=5 (tỷ)", scale: TY },
  { id: "closeDate", label: "Ngày bán", kind: "chu", size: 120, filterHint: "2026-10" },
  { id: "withdrawnReason", label: "Lý do ngừng", kind: "chon", size: 180, filterHint: "Mọi lý do" },
];

export const COT_THEO_ID = new Map(COT.map((c) => [c.id, c]));
/** Ba cột ẩn mặc định, bật trong menu cột. */
export const COT_AN_MAC_DINH: readonly CotId[] = ["closePrice", "closeDate", "withdrawnReason"];
export const COT_MAC_DINH: readonly CotId[] = COT.map((c) => c.id).filter((id) => !COT_AN_MAC_DINH.includes(id));

/** Căn có đầu chủ không còn trong sàn (Hỏi-3 hàng 105) — khác «—» của căn chưa gán. */
export const DA_ROI_SAN = "Đã rời sàn";

/**
 * Danh bạ thành viên của sàn: mã người → tên hiển thị (`GET /api/v1/company/member-names`, mọi vai, hàng 105). `null` khi
 * máy chưa có danh bạ nào (lần mở đầu chưa đọc xong, chưa từng đọc được) — lúc ấy không kết luận «Đã rời sàn».
 * `moi`: danh bạ đã đọc từ máy chủ trong phiên này; chỉ có bản giữ trên máy (có thể cũ) thì `false` — người lạ khi ấy chưa
 * chắc đã rời sàn, có khi mới vào (Ngoài-9 hàng 105, hàng 48).
 */
export type DanhBaDauChu = { ten: ReadonlyMap<string, string>; moi: boolean } | null;

/** Chưa có danh bạ trên máy: ô chờ, không đoán. */
export const CHO_DANH_BA = "…";
/** Thành viên chưa đặt tên hiển thị. */
export const CHUA_DAT_TEN = "Chưa đặt tên";

/**
 * Chữ ô «Đầu chủ»: chưa gán → «—»; gán thành viên của sàn → tên; gán người không có trong danh bạ máy chủ vừa đọc →
 * «Đã rời sàn»; máy chưa có danh bạ, hay chỉ có bản giữ trên máy mà không có người ấy → «…».
 */
export function chuDauChu(listAgentKey: string | null | undefined, danhBa: DanhBaDauChu): string {
  if (!listAgentKey) return "—";
  if (danhBa === null) return CHO_DANH_BA;
  const ten = danhBa.ten.get(listAgentKey);
  if (ten === undefined) return danhBa.moi ? DA_ROI_SAN : CHO_DANH_BA;
  return ten.trim() || CHUA_DAT_TEN;
}

/** «4,65 tỷ» · «950 triệu» · «—». */
export function dinhDangGia(dong: number | null): string {
  if (dong === null) return "—";
  if (dong >= TY) return `${SO_2.format(dong / TY)} tỷ`;
  return `${SO_NGUYEN.format(Math.round(dong / 1_000_000))} triệu`;
}

/** Cột chuẩn rồi cột trường riêng còn sống của sàn (hàng 47) — bộ trường chưa tải thì chỉ cột chuẩn. */
export function tatCaCot(tv?: TuVung | null): readonly Cot[] {
  return [...COT, ...cotTruongRieng(tv?.truongRieng)];
}

/** Tiêu đề cột: tên riêng của sàn cho trường chuẩn (hàng 45), vắng thì nhãn dựng sẵn của Bảng hàng. */
export const nhanCot = (c: Cot, tv?: TuVung | null) => (laCotRieng(c.id) ? c.label : nhanTruong(tv, c.id, c.label));

/**
 * Chữ hiện ở ô — cũng là chữ ô lọc chữ so và chữ chép ra clipboard. `tv`: cách gọi riêng của sàn (hàng 45) cho giá trị của
 * tập đóng (phí, lý do ngừng) và nhãn trạng thái riêng (hàng 46); giá trị lưu ở dòng vẫn là giá trị chuẩn.
 */
export function chuCuaO(d: DongBang, id: CotId, tv?: TuVung | null): string {
  if (laCotRieng(id)) return chuOTruongRieng(d[id], id, tv?.truongRieng) || "—";
  const v = d[id];
  if (v === null || v === undefined || v === "") return "—";
  switch (id) {
    case "standardStatus":
      return nhanCuaCan(tv?.trangThai, d.standardStatus, d.statusLabel);
    case "feeInclusion":
      return nhanGiaTri(tv, "feeInclusion", String(v), FEE_LABEL[String(v)] ?? String(v));
    case "visibility":
      return VISIBILITY_LABEL[String(v)] ?? String(v);
    case "withdrawnReason":
      return nhanGiaTri(tv, "withdrawnReason", String(v), WITHDRAWN_LABEL[String(v)] ?? String(v));
    case "listPrice":
    case "closePrice":
      return dinhDangGia(v as number);
    case "livingArea":
      return `${SO_2.format(v as number)} m²`;
    case "confirmedAgeDays":
      return v === 0 ? "Hôm nay" : `${v} ngày trước`;
    case "completeness":
      return `${v}/${d.mucDuTong ?? 5}${d.thieuAnh ? " · thiếu ảnh thật" : ""}`;
    default:
      return String(v);
  }
}

/** Màu huy hiệu ô Trạng thái: theo trạng thái chuẩn — căn mang nhãn riêng nhận màu của neo (hàng 46). */
export const mauTrangThai = (d: Pick<DongBang, "standardStatus">): MauTrangThai => MAU_TRANG_THAI[d.standardStatus];

/** Giá trị của ô chọn: lựa chọn của ô lọc là các giá trị này, chữ hiện qua `chuCuaO`. Cột Trạng thái là trạng thái chuẩn —
 * lọc «Đang giao dịch» gồm cả căn mang nhãn riêng neo vào nó (hàng 46, Hỏi-4). */
export function giaTriChon(d: DongBang, id: CotId): string {
  const v = d[id];
  return v === null || v === undefined ? "" : String(v);
}
