// Rào cửa ra (hàng 31) cho /exports/new (hàng 43): trang không còn là chỗ giữ — nó chuyển về bảng hàng, nơi hộp thoại Xuất
// bảng hàng dựng mọi đầu ra. Bài kiểm của cửa này chạy lại bộ kiểm rò rỉ của hộp thoại trên căn mồi, và quét nguồn trang.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { CAU_HINH_TAT_CA, canMoi, giaTriMoi, NGUOI_NHAN, timRoRi } from "@quy-hang/core/redaction";
import { kiemDuongTrang } from "../../(app)/inventory/phat-hang/moi-xuat.test-helpers";

const DAY = dirname(fileURLToPath(import.meta.url));

test("/exports/new — đường xuất của hộp thoại không rò mồi nào", () => {
  assert.deepEqual(kiemDuongTrang(canMoi()), []);
});

test("/exports/new — mã nguồn trang không mang mồi, chỉ chuyển hướng", () => {
  const nguon = readFileSync(join(DAY, "page.tsx"), "utf8");
  for (const nguoiNhan of NGUOI_NHAN) for (const cauHinh of CAU_HINH_TAT_CA) assert.deepEqual(timRoRi(nguon, giaTriMoi(canMoi(), nguoiNhan, cauHinh)), []);
  assert.match(nguon, /redirect\("\/inventory\?phat-hang=1"\)/);
});
