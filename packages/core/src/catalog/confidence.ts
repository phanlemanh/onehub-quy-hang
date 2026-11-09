/**
 * Độ chắc của một giá trị danh mục (hàng 94, thiết kế §2): ba nhãn của Invest, giữ cứng vì là nghĩa chuẩn để so giữa
 * các sàn (điều khoá K35). `inferred` «Suy ra» · `single_source` «Một nguồn xác nhận» · `verified` «Đã xác minh».
 */
export const CATALOG_CONFIDENCE_LEVELS = ["inferred", "single_source", "verified"] as const;
export type CatalogConfidence = (typeof CATALOG_CONFIDENCE_LEVELS)[number];

/** Chín trường có thể vắng của căn: giá trị có thì bắt buộc có nhãn, giá trị vắng thì không được có nhãn. */
export const CATALOG_CONFIDENCE_FIELDS = [
  "stack",
  "floor",
  "livingArea",
  "bedroomsTotal",
  "directionFaces",
  "lotSizeArea",
  "storiesTotal",
  "frontageLength",
  "accessRoadWidth",
] as const;
export type CatalogConfidenceField = (typeof CATALOG_CONFIDENCE_FIELDS)[number];
