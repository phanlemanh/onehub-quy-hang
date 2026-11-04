// Bài rò rỉ của trang khách `/s/<mã>` (hàng 35: AC-8, luật đợt 19): trang dựng từ bản ra của căn mồi không mang giá trị
// nội bộ hay nguồn nào, ở mọi người nhận × mọi cấu hình — cả bộ căn lẫn chi tiết. Rào cửa ra đọc tệp này (canMoi + timRoRi).
import assert from "node:assert/strict";
import { test } from "node:test";
import { banRaNgoai, CAU_HINH_TAT_CA, canMoi, giaTriMoi, NGUOI_NHAN, timRoRi } from "@quy-hang/core/redaction";
import { createElement as h } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { TrangKhachCongKhai } from "./trang";

const HOM_NAY = "2026-11-04";

test("rò rỉ: trang khách công khai", () => {
  const can = canMoi();
  let o = 0;
  const loi: string[] = [];
  for (const nguoiNhan of NGUOI_NHAN) {
    for (const cauHinh of CAU_HINH_TAT_CA) {
      const b = banRaNgoai(can, { cua: "gui_link", nguoiNhan, cauHinh, today: HOM_NAY });
      const than = { companyName: can.companyName, senderName: can.senderName, nguoiNhan, can: [b], listingIds: ["L0"] };
      const moi = giaTriMoi(can, nguoiNhan, cauHinh);
      for (const [ten, chiTiet] of [["bộ căn", undefined], ["chi tiết", 0]] as const) {
        const chu = renderToStaticMarkup(h(TrangKhachCongKhai, { code: "AbCdEfGhIjKl", than, can: chiTiet }));
        for (const r of timRoRi(chu, moi)) loi.push(`${nguoiNhan}/${JSON.stringify(cauHinh)}/${ten}: rò ${r.truong} (${r.dang})`);
      }
      o++;
    }
  }
  assert.equal(o, NGUOI_NHAN.length * CAU_HINH_TAT_CA.length, "số ô");
  assert.deepEqual(loi, []);
});
