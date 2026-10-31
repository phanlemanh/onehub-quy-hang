/**
 * Cột của Bảng hàng (hàng 14): một dòng là một hàng của sàn đã ghép thuộc tính căn từ danh mục. Tên theo RESO, nhãn theo
 * `CONTEXT.md`. Thuần — không React — để lọc, nhóm, góc nhìn và bài kiểm cùng đọc một bảng.
 */
import type { StandardStatus } from "@quy-hang/core/listing";

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
  listPrice: number | null;
  feeInclusion: string | null;
  furnished: string | null;
  legalStatus: string | null;
  financing: string | null;
  occupantType: string | null;
  /** Số ngày từ lần xác nhận với chủ nhà; chưa từng xác nhận là `null`. */
  confirmedAgeDays: number | null;
  needsCallBack: boolean;
  /** Số mục đã có trên năm mục của danh sách hỏi. */
  completeness: number | null;
  visibility: "Private" | "Company" | null;
  closePrice: number | null;
  closeDate: string | null;
  withdrawnReason: string | null;
};

export type CotId = Exclude<keyof DongBang, "id" | "needsCallBack">;
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

export const STATUS_LABEL: Record<StandardStatus, string> = {
  Incomplete: "Chưa đủ để rao",
  Active: "Đang bán",
  Pending: "Đang giao dịch",
  Closed: "Đã bán",
  Hold: "Tạm ngừng",
  Withdrawn: "Ngừng hẳn",
};
export const FEE_LABEL: Record<string, string> = { included: "Bao phí", excluded: "Không bao phí" };
export const VISIBILITY_LABEL: Record<string, string> = { Private: "Chỉ tôi", Company: "Toàn sàn" };
export const WITHDRAWN_LABEL: Record<string, string> = {
  sold_elsewhere: "Chủ đã bán nơi khác",
  owner_changed_mind: "Chủ đổi ý",
  unreachable: "Không liên lạc được",
};
export const CHUA_RO = "Chưa rõ";

const TY = 1_000_000_000;

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

/** «4,65 tỷ» · «950 triệu» · «—». */
export function dinhDangGia(dong: number | null): string {
  if (dong === null) return "—";
  if (dong >= TY) return `${(dong / TY).toLocaleString("vi-VN", { maximumFractionDigits: 2 })} tỷ`;
  return `${Math.round(dong / 1_000_000).toLocaleString("vi-VN")} triệu`;
}

/** Chữ hiện ở ô — cũng là chữ ô lọc chữ so và chữ chép ra clipboard. */
export function chuCuaO(d: DongBang, id: CotId): string {
  const v = d[id];
  if (v === null || v === undefined || v === "") return "—";
  switch (id) {
    case "standardStatus":
      return STATUS_LABEL[d.standardStatus];
    case "feeInclusion":
      return FEE_LABEL[String(v)] ?? String(v);
    case "visibility":
      return VISIBILITY_LABEL[String(v)] ?? String(v);
    case "withdrawnReason":
      return WITHDRAWN_LABEL[String(v)] ?? String(v);
    case "listPrice":
    case "closePrice":
      return dinhDangGia(v as number);
    case "livingArea":
      return `${(v as number).toLocaleString("vi-VN")} m²`;
    case "confirmedAgeDays":
      return v === 0 ? "Hôm nay" : `${v} ngày trước`;
    case "completeness":
      return `${v}/5`;
    default:
      return String(v);
  }
}

/** Giá trị của ô chọn: lựa chọn của ô lọc là các giá trị này, chữ hiện qua `chuCuaO`. */
export function giaTriChon(d: DongBang, id: CotId): string {
  const v = d[id];
  return v === null || v === undefined ? "" : String(v);
}
