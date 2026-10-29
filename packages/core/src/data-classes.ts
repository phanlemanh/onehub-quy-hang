/**
 * Lớp dữ liệu và trần (ADR-0017 của onehub-invest, ADR-0001 của kho này).
 *
 * Mỗi trường thuộc đúng một lớp. Thoả thuận chỉ mở được tới trần của lớp — trần chính là bất biến:
 * không thoả thuận, cấu hình hay yêu cầu nào đưa được lớp `source` ra khỏi công ty.
 */
export const DATA_CLASSES = [
  "catalog",
  "shareable_listing",
  "company_internal",
  "custom_field",
  "source",
  "transaction",
  "behavior",
] as const;

export type DataClass = (typeof DATA_CLASSES)[number];

export type Ceiling =
  /** Ra ngoài được (danh mục là dùng chung). */
  | "external"
  /** Ra ngoài khi có thoả thuận, và luôn qua luật ẩn. */
  | "by_agreement"
  /** Ở trong công ty. */
  | "company_only"
  /** Ra ngoài chỉ khi công ty bật riêng từng trường. */
  | "by_company_toggle"
  /** Không bao giờ rời công ty. */
  | "never_leaves_company"
  /** Ra ngoài chỉ theo thoả thuận có điều khoản riêng; mặc định tắt. */
  | "by_agreement_with_terms"
  /** Ra ngoài chỉ ở dạng tổng hợp. */
  | "aggregate_only";

export const CEILING: Readonly<Record<DataClass, Ceiling>> = {
  catalog: "external",
  shareable_listing: "by_agreement",
  company_internal: "company_only",
  custom_field: "by_company_toggle",
  source: "never_leaves_company",
  transaction: "by_agreement_with_terms",
  behavior: "aggregate_only",
};

/** Nhãn trên màn của từng lớp (CONTEXT.md). */
export const DATA_CLASS_LABEL: Readonly<Record<DataClass, string>> = {
  catalog: "Danh mục",
  shareable_listing: "Hàng chia sẻ được",
  company_internal: "Nội bộ công ty",
  custom_field: "Trường riêng",
  source: "Nguồn",
  transaction: "Giao dịch",
  behavior: "Hành vi",
};

export function isDataClass(value: string): value is DataClass {
  return (DATA_CLASSES as readonly string[]).includes(value);
}
