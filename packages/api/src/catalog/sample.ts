import type { CatalogData } from "@quy-hang/core";
import goi from "../../../db/seed/mau/du-lieu-mau.json" with { type: "json" };

/**
 * Danh mục mẫu của hàng 5 (dự án «[Mẫu] Dự án căn hộ thử»). Đường tra phục vụ nó ở mọi môi trường tới khi hàng 10 nạp
 * danh mục thật (Hỏi-3 của hồ sơ danh-muc-go-ma-can). Chỉ lấy khoá `danhMuc`; phần chủ nhà mẫu của gói không đi đâu.
 */
export const SAMPLE_CATALOG: CatalogData = goi.danhMuc;

/** Toàn gói mẫu — cho lệnh đo tỉ lệ tự điền, cần mã căn của hàng và lead mẫu. */
export const SAMPLE_PACK = goi;
