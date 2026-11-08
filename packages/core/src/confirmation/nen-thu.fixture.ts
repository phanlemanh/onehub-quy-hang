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

/** Tám mồi của phép quét cả lớp — câu có khoảng trắng và các dáng số điện thoại; số mẫu, không số thật. */
export const MOI_SO_VA_CHU: readonly string[] = [
  "gọi chủ nhà nhé",
  "0900000071",
  "090.000.0071",
  "0900-000-071",
  "090_000_0071",
  "090/000/0071",
  "0900 000 071",
  "+84900000071",
];

/** Danh mục mẫu, căn A-01.01 mang UPI `upi` — để mồi qua được bước tra. */
export function danhMucDoiUpi(upi: string): CatalogData {
  const dm = danhMucMau();
  const can = dm.subdivisions.flatMap((s) => s.buildings).flatMap((b) => b.units).find((u) => u.upi === UPI_MAU);
  if (!can) throw new Error("danh mục mẫu thiếu căn A-01.01");
  (can as { upi: string }).upi = upi;
  return dm;
}

/** Danh mục mẫu, toà A mang khoá `khoa` — để mồi qua được bước tra. */
export function danhMucDoiKhoaToa(khoa: string): CatalogData {
  const dm = danhMucMau();
  const toa = dm.subdivisions.flatMap((s) => s.buildings).find((b) => b.buildingKey === TOA_MAU);
  if (!toa) throw new Error("danh mục mẫu thiếu toà A");
  (toa as { buildingKey: string }).buildingKey = khoa;
  return dm;
}
