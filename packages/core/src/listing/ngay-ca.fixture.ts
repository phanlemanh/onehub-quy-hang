/**
 * Hai ma trận ngày của hàng 57, viết tay — không suy từ hàm đang kiểm. Kiểm thử của lõi và kiểm thử trên Postgres
 * (`packages/api/test-db/ngay-ban/`) cùng nhập tệp này, để lõi và cơ sở dữ liệu được so trên cùng một danh sách.
 */

/** Đúng dạng YYYY-MM-DD mà không có trên lịch. */
export const NGAY_KHONG_CO_THAT_CA = [
  "2025-02-29", // năm không nhuận
  "1900-02-29", // chia hết cho 100 mà không cho 400
  "2026-02-30",
  "2026-02-31",
  "2026-04-31",
  "2026-06-31",
  "2026-09-31",
  "2026-11-31",
  "2026-01-00",
  "2026-01-32",
  "2026-00-10",
  "2026-13-01",
  "0000-01-01", // lịch không có năm 0
] as const;

/** Ngày có thật: ngày nhuận, ngày cuối từng tháng, hai đầu miền bốn chữ số. */
export const NGAY_CO_THAT = [
  "2024-02-29",
  "2000-02-29",
  "2026-01-31",
  "2026-02-28",
  "2026-03-31",
  "2026-04-30",
  "2026-05-31",
  "2026-06-30",
  "2026-07-31",
  "2026-08-31",
  "2026-09-30",
  "2026-10-31",
  "2026-11-30",
  "2026-12-31",
  "0001-01-01",
  "9999-12-31",
] as const;

/** Sai dạng — không phải chuỗi YYYY-MM-DD. */
export const NGAY_SAI_DANG_CA: readonly unknown[] = ["2026-2-3", "30/02/2026", "", 20260230];
