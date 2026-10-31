/**
 * Danh mục dự án → toà → căn mà lõi đọc (Tham chiếu §4 dòng «Danh mục»). Cùng hình với khuôn `CatalogFeed` của
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
};

export type CatalogBuildingData = {
  buildingKey: string;
  buildingName: string;
  units: readonly CatalogUnitData[];
};

export type CatalogProjectData = {
  projectKey: string;
  projectName: string;
  complexName: string | null;
  buildings: readonly CatalogBuildingData[];
};

export type CatalogData = {
  projects: readonly CatalogProjectData[];
};
