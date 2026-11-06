// Dòng phụ dưới giá bao phí ở hồ sơ căn (hàng 49, AC-7, E7b).
import assert from "node:assert/strict";
import { test } from "node:test";

import { dongDinhNghia } from "./dinh-nghia";

const DAU_MAC_DINH = {
  includedItems: ["personalIncomeTax", "registrationFee", "brokerageFee"],
  rates: { personalIncomeTax: 200, registrationFee: 50, brokerageFee: 100 },
  computedAt: "2026-11-06T03:00:00.000Z",
};

test("hồ sơ căn: dòng phụ theo dấu định nghĩa", () => {
  assert.equal(dongDinhNghia(3_000_000_000, DAU_MAC_DINH), "Tính theo định nghĩa ngày 06/11/2026: Thuế TNCN 2% · Trước bạ 0,5% · Môi giới 1% — về tay 2,895 tỷ");
  const tatLePhi = { ...DAU_MAC_DINH, includedItems: ["personalIncomeTax", "brokerageFee"], rates: { ...DAU_MAC_DINH.rates, brokerageFee: 200 } };
  const chu = dongDinhNghia(3_000_000_000, tatLePhi)!;
  assert.equal(chu, "Tính theo định nghĩa ngày 06/11/2026: Thuế TNCN 2% · Môi giới 2% — về tay 2,88 tỷ");
  assert.ok(!chu.includes("Trước bạ"), "khoản đã tắt không hiện");
  assert.equal(dongDinhNghia(3_000_000_000, null), null);
  assert.equal(dongDinhNghia(null, DAU_MAC_DINH), null);
  // Ngày theo giờ Việt Nam: 17:30Z ngày 05 là 00:30 ngày 06.
  assert.match(dongDinhNghia(3_000_000_000, { ...DAU_MAC_DINH, computedAt: "2026-11-05T17:30:00.000Z" })!, /ngày 06\/11\/2026/);
});

test("hồ sơ căn: dòng phụ không đọc định nghĩa hiện hành", () => {
  // Chiều đỏ của «theo dấu»: hàm chỉ nhận giá và dấu — không tham số cấu hình nào; cùng dấu luôn ra cùng chữ.
  assert.equal(dongDinhNghia.length, 2);
  assert.match(dongDinhNghia(3_000_000_000, DAU_MAC_DINH)!, /về tay 2,895 tỷ$/);
});
