// Bài rò rỉ của trang nhóm môi giới (hàng 44, E7): bảng, Excel và ảnh dựng từ thân lõi của căn mồi không mang giá trị nội
// bộ hay nguồn nào, ở mọi cấu hình — có và không ẩn mức chia. Rào cửa ra đọc tệp này (canMoi + timRoRi).
import assert from "node:assert/strict";
import { test } from "node:test";
import { CAU_HINH_TAT_CA, canMoi, giaTriMoi, timRoRi } from "@quy-hang/core/redaction";
import { thanTrangKhach } from "@quy-hang/core/sharing";
import { createElement as h } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { chuTrongZip } from "../../(app)/inventory/phat-hang/moi-xuat.test-helpers";
import { BangMoiGioi } from "./bang";
import { moHinhTep, veMoiGioi, xlsxMoiGioi, type ToVe } from "./tep";

const HOM_NAY = "2026-11-06";

test("rò rỉ: trang nhóm môi giới — bảng, Excel, ảnh", () => {
  const can = canMoi();
  let o = 0;
  const loi: string[] = [];
  for (const cauHinh of CAU_HINH_TAT_CA) {
    for (const an of [false, true]) {
      const than = {
        ...thanTrangKhach({ can: [can], audience: "agents", today: HOM_NAY, cauHinh, luuTrenLanGui: { mucChia: 40, feeInclusion: null }, cauHinhMoiGioi: { anMucChia: an, feeInclusion: ["brokerageFee"] } }),
        listingIds: ["L0"],
      };
      const moi = giaTriMoi(can, "nhom_moi_gioi", cauHinh);
      const m = moHinhTep(than);
      const ve: string[] = [];
      const tao = (): ToVe => ({
        width: 0,
        height: 0,
        getContext: () => ({ font: "", fillStyle: "", textBaseline: "", measureText: (s: string) => ({ width: s.length }), fillText: (s: string) => void ve.push(s), fillRect: () => {}, scale: () => {} }),
      });
      veMoiGioi(m, tao);
      const ra: [string, string][] = [
        ["bảng", renderToStaticMarkup(h(BangMoiGioi, { code: "AbCdEfGhIjKl", than }))],
        ["excel", chuTrongZip(xlsxMoiGioi(m))],
        ["ảnh", ve.join("\n")],
        ["thân", JSON.stringify(than)],
      ];
      for (const [ten, chu] of ra) for (const r of timRoRi(chu, moi)) loi.push(`${JSON.stringify(cauHinh)}/ẩn=${an}/${ten}: rò ${r.truong} (${r.dang})`);
      o++;
    }
  }
  assert.equal(o, CAU_HINH_TAT_CA.length * 2, "số ô");
  // Đối chứng dương: mồi có trong căn nội bộ đầu vào.
  assert.ok(timRoRi(JSON.stringify(can), giaTriMoi(can, "nhom_moi_gioi", CAU_HINH_TAT_CA[0]!)).length > 0, "đối chứng: căn mồi phải mang mồi");
  assert.deepEqual(loi, []);
});
