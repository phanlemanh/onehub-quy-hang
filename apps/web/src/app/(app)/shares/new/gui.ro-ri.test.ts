// Bài rò rỉ của màn Gửi (hàng 34: AC-5, luật 19): trang xem trước, tin soạn sẵn và gói chia sẻ dựng từ căn mồi qua luật ẩn
// không mang giá trị nội bộ hay nguồn nào, ở mọi người nhận × mọi cấu hình. Rào cửa ra đọc tệp này (canMoi + timRoRi).
import assert from "node:assert/strict";
import { test } from "node:test";
import { banRaNgoai, CAU_HINH_MAC_DINH, CAU_HINH_TAT_CA, canMoi, giaTriMoi, NGUOI_NHAN, timRoRi } from "@quy-hang/core/redaction";
import { soanTin } from "@quy-hang/core/sharing";
import { createElement as h } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { goiChiaSe } from "./gui";
import { TrangKhach } from "./trang-khach";

const HOM_NAY = "2026-11-03";
const LINK = "https://quyhang.test/s/AbCdEfGhIjKl";

test("rò rỉ: trang xem trước, tin và gói chia sẻ", () => {
  const can = canMoi();
  // Đối chứng dương: máy dò bắt được giá trị nguồn trên chính căn mồi.
  const goc = timRoRi(JSON.stringify(can), giaTriMoi(can, "khach_rieng", CAU_HINH_MAC_DINH)).map((r) => r.truong);
  for (const t of ["ownerName", "ownerPhone", "floorPrice", "holderName"]) assert.ok(goc.includes(t), `đối chứng: máy dò không bắt ${t}`);

  let o = 0;
  const loi: string[] = [];
  for (const nguoiNhan of NGUOI_NHAN) {
    for (const cauHinh of CAU_HINH_TAT_CA) {
      const ban = [banRaNgoai(can, { cua: "gui_link", nguoiNhan, cauHinh, today: HOM_NAY })];
      const moi = giaTriMoi(can, nguoiNhan, cauHinh);
      const tin = soanTin({ ban, nguoiNhan, tenKhach: "[Tên]" });
      const goi = goiChiaSe(tin, LINK, ban);
      const vat: [string, string][] = [
        ["trang", renderToStaticMarkup(h(TrangKhach, { ban, nguoiNhan, duongAnh: (id) => `/anh/${id}` }))],
        ["tin", tin],
        ["gói", JSON.stringify({ text: goi.text, files: goi.anh.map((a) => a.ten) })],
      ];
      for (const [ten, chu] of vat) for (const r of timRoRi(chu, moi)) loi.push(`${nguoiNhan}/${JSON.stringify(cauHinh)}/${ten}: rò ${r.truong} (${r.dang})`);
      o++;
    }
  }
  assert.equal(o, NGUOI_NHAN.length * CAU_HINH_TAT_CA.length, "số ô");
  assert.deepEqual(loi, []);
});
