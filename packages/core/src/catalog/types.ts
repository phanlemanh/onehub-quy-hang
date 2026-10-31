/**
 * Danh mục khu → toà → căn mà lõi đọc (Tham chiếu §4 dòng «Danh mục»). Cùng hình với khuôn `CatalogFeed` của
 * `packages/connect` nhưng khai theo cấu trúc — lõi không phụ thuộc gói kết nối. Tên trường theo RESO khi có.
 */
export type CatalogUnitData = {
  upi: string;
  unitNumber: string;
  stack: string | null;
  floor: number | null;
  livingArea: number | null;
  bedroomsTotal: number | null;
  directionFaces: string | null;
  /** Loại hình RESO nguyên văn (hàng 72): `Residential`, `Land`… — cặp hợp lệ ở `PROPERTY_SUBTYPE_FIELDS`. */
  propertyType: string;
  propertySubType: string;
  /** Trường của loại hình thấp tầng, đất (ADR-0016 quyết định 2); căn hộ không có. */
  lotSizeArea?: number | null;
  storiesTotal?: number | null;
  frontageLength?: number | null;
  /** Lộ giới — đường trước nhà rộng bao nhiêu mét; đặc trưng Việt Nam, RESO không có. */
  accessRoadWidth?: number | null;
};

export type CatalogBuildingData = {
  buildingKey: string;
  buildingName: string;
  units: readonly CatalogUnitData[];
};

export type CatalogSubdivisionData = {
  subdivisionKey: string;
  subdivisionName: string;
  complexName: string | null;
  buildings: readonly CatalogBuildingData[];
};

export type CatalogData = {
  subdivisions: readonly CatalogSubdivisionData[];
};
