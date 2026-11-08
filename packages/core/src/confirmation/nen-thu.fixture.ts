/**
 * Nền chung cho ca kiểm sự kiện xác nhận — chỉ dùng trong bài kiểm (lõi và `packages/connect`). Danh mục là `danhMuc` của
 * bộ dữ liệu mẫu hàng 5 (`packages/db/seed/mau/du-lieu-mau.json`) — chính tệp khuôn chiều vào v1 đọc được — không danh mục
 * viết tay. Mọi giá trị mang nhãn mẫu, không dữ liệu thật.
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import type { Agreement } from "../agreements";
import type { CatalogData } from "../catalog/types";
import type { NguCanh } from "./dung";

export const DUONG_MAU = fileURLToPath(new URL("../../../db/seed/mau/du-lieu-mau.json", import.meta.url));

export function danhMucMau(): CatalogData {
  const goi = JSON.parse(readFileSync(DUONG_MAU, "utf8")) as { danhMuc: CatalogData };
  return { subdivisions: goi.danhMuc.subdivisions };
}

export const NGAY = "2026-11-08";
export const SAN_MAU = "00000000-0000-4000-8000-0000000c0b01";
export const NGUOI_MAU = "nguoi-mau-xac-nhan-01";
/** Khoá bên nhận thử, cố định để tệp ví dụ ổn định — không phải khoá thật. */
export const khoaThu = (byte = 7, dai = 32): Uint8Array => new Uint8Array(dai).fill(byte);

export function thoaThuanXacNhan(overrides: Partial<Agreement> = {}): Agreement {
  return {
    id: "agr-xac-nhan-mau",
    companyId: SAN_MAU,
    kind: "catalog_confirmation",
    direction: "outbound",
    counterparty: "onehub-invest",
    dataClasses: ["catalog"],
    validFrom: new Date("2026-11-01T00:00:00Z"),
    validUntil: null,
    status: "active",
    approvedBy: "[Tên]",
    specialTerms: false,
    ...overrides,
  };
}

export function nguCanhMau(overrides: Partial<NguCanh> = {}): NguCanh {
  return {
    thoaThuan: thoaThuanXacNhan(),
    danhMuc: danhMucMau(),
    khoaBenNhan: khoaThu(),
    companyId: SAN_MAU,
    userId: NGUOI_MAU,
    today: NGAY,
    ...overrides,
  };
}

/** Căn mẫu A-01.01 của toà A trong danh mục mẫu. */
export const UPI_MAU = "urn:onehub:upi:mau:A-01.01";
export const TOA_MAU = "A";

export const dauKhungToa = () => ({ buildingKey: TOA_MAU, storiesTotal: 15, skippedFloors: [4, 13], stacks: ["01", "02", "03", "04", "05", "06"] });
export const dauThuocTinhCan = () => ({
  buildingKey: TOA_MAU,
  upi: null as string | null,
  unitNumber: "A-07.03",
  livingArea: 68.5,
  bedroomsTotal: 2,
  directionFaces: "Tây Bắc",
  floor: 7,
  stack: "03",
});
export const dauBaoSai = () => ({ buildingKey: TOA_MAU, upi: UPI_MAU, field: "livingArea" as const, correctValue: 55.1 });
