// Rò rỉ nhãn trạng thái riêng (hàng 46, E5b, bất biến 4): nhãn của sàn là lớp company_internal — căn mang nhãn ra trang
// khách và bản phát hàng như mọi căn cùng trạng thái chuẩn (`availability`), không mang chữ hay mã nhãn.
import assert from "node:assert/strict";
import { test } from "node:test";
import { xuatBang, type CotGocNhin } from "../export";
import { banRaNgoai, canMoi, type CanNoiBo } from ".";

const TODAY = "2026-11-06";
// Mồi ngoài khuôn mã — chỉ để quét chuỗi; không qua lệnh thật, chỉ dựng tay trên bản nội bộ.
const MOI = "MOI-NHAN-TT";
const COT: readonly CotGocNhin[] = ["buildingName", "unitNumber", "livingArea", "listPrice", "feeInclusion", "standardStatus"];
const canNhan = (): CanNoiBo => ({ ...canMoi(), standardStatus: "Pending", statusLabel: MOI }) as CanNoiBo;

/** Bộ quét: một bản ra có mang nhãn của sàn không. */
const lot = (ban: unknown) => JSON.stringify(ban).includes(MOI) || (typeof ban === "object" && ban !== null && "statusLabel" in ban);

test("rò rỉ: nhãn trạng thái riêng không ra ngoài", () => {
  for (const nguoiNhan of ["khach_rieng", "nhom_moi_gioi"] as const) {
    const ban = banRaNgoai(canNhan(), { cua: "gui_link", nguoiNhan, today: TODAY });
    assert.equal(lot(ban), false, `${nguoiNhan}: bản ra mang nhãn`);
    assert.equal((ban as { availability?: unknown }).availability, "under_contract", `${nguoiNhan}: theo luật của neo`);
  }
  const xuat = xuatBang([canNhan()], { mau: "post_zalo", nguoiNhan: "nhom_moi_gioi", cot: COT, today: TODAY, tenSan: "[Tên sàn]" });
  assert.ok(!JSON.stringify(xuat).includes(MOI), "bản phát hàng mang nhãn");

  // Đối chứng dương: một cửa ra lỡ chép statusLabel thì bộ quét bắt được.
  const hong = { ...banRaNgoai(canNhan(), { cua: "gui_link", nguoiNhan: "khach_rieng", today: TODAY }), statusLabel: MOI };
  assert.equal(lot(hong), true);
});
