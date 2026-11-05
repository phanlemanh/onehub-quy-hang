// Phát hàng nối từ vựng của sàn (hàng 45: E6c). Đầu vào là thân `GET /api/v1/company/labels` dựng bằng đúng hàm bên ghi
// của API (`bangNhan`), không viết tay từ vựng; đi qua `tuVungTuBang` rồi hàm dựng mà hộp thoại phát hàng gọi.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { bangNhan, tuVungTuBang } from "@quy-hang/core/labels";
import { canMoi } from "@quy-hang/core/redaction";
import { banXuatTuDong } from "./chuyen-dong";
import { dongMoi, TODAY } from "./moi-xuat.test-helpers";

const DAY = dirname(fileURLToPath(import.meta.url));

test("phát hàng: nối từ vựng của sàn", () => {
  const than = JSON.parse(JSON.stringify(bangNhan({ truong: { feeInclusion: "Phí CN" }, giaTri: { feeInclusion: { included: "BP" } } })));
  const tuVung = tuVungTuBang(than);
  const dong = [{ ...dongMoi(canMoi()), id: "d1", feeInclusion: "included" }];
  const tuy = { mau: "xlsx" as const, nguoiNhan: "nhom_moi_gioi" as const, cot: ["buildingName", "feeInclusion"] as const, today: TODAY, tenSan: "[Tên sàn]", tenNguoiGui: "" };
  const b = banXuatTuDong(dong, { ...tuy, tuVung });
  assert.deepEqual(b.cot, ["Toà", "Phí CN"]);
  assert.equal(b.dong[0]![1], "BP");
  // Chiều đỏ: không truyền từ vựng → chữ dựng sẵn.
  const cu = banXuatTuDong(dong, tuy);
  assert.deepEqual([cu.cot[1], cu.dong[0]![1]], ["Phí", "Bao phí"]);
  // Hộp thoại truyền từ vựng của lượt mở vào hàm dựng.
  const hop = readFileSync(join(DAY, "hop-thoai.tsx"), "utf8");
  assert.match(hop, /banXuatTuDong\([^)]*tuVung: mo\.tuVung/);
  // Menu Tạo «Xuất bảng hàng» chỉ chuyển về hộp thoại trên Bảng hàng — cùng một đường dựng.
  assert.match(readFileSync(join(DAY, "..", "..", "..", "exports", "new", "page.tsx"), "utf8"), /redirect\("\/inventory\?phat-hang=1"\)/);
});
