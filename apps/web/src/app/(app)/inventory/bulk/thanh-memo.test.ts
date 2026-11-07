import { test } from "node:test";
import assert from "node:assert/strict";
import { OTich } from "./thanh";

// va-bang-hang-e11-hieu-nang AC-5: lưới vẽ lại mọi dòng đang hiện mỗi khung cuộn; ô tích phải là memo để React bỏ qua
// vẽ lại Checkbox khi props không đổi. Thước bản chậm/bản nhanh trên bản chạy thật là E1/E2 (đo cặp).
test("ô tích của dòng là React.memo", () => {
  const loai = (OTich as unknown as { $$typeof?: symbol }).$$typeof;
  assert.equal(loai, Symbol.for("react.memo"), "OTich không phải memo — mỗi khung cuộn vẽ lại Checkbox của mọi dòng");
});
