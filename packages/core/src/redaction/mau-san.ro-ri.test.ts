// Rò rỉ qua mẫu của sàn (hàng mau-bang-hang-va-bai, E9, bất biến 4): mẫu bảng mang MỌI cột của bảng hàng — kể cả cột nội
// bộ, như một dòng ghi thẳng vào cơ sở dữ liệu — và mẫu bài có lời đầu, lời cuối; bảng và bài vẫn chỉ mang bản đã ẩn.
import assert from "node:assert/strict";
import { test } from "node:test";
import { COT_BANG_HANG, docMauBang, MAU_XUAT, xuatBang, type CotBangHang } from "../export";
import { CAU_HINH_MAC_DINH, canMoi, giaTriMoi, timRoRi } from ".";

const TODAY = "2026-11-07";
const MOI_COT = Object.keys(COT_BANG_HANG) as CotBangHang[];
const MAU_BAI = { zalo: { dau: "[Tên sàn] gửi nhóm", cuoi: "Gọi 0900 000 001" }, facebook: { dau: "Bảng hàng tuần", cuoi: "Hẹn xem nhà" } };

test("rò rỉ: bảng và bài theo mẫu chỉ mang bản đã ẩn", () => {
  let dem = 0;
  for (const nguoiNhan of ["nhom_moi_gioi", "khach_rieng"] as const) {
    const moi = giaTriMoi(canMoi(), nguoiNhan, CAU_HINH_MAC_DINH);
    for (const m of MAU_XUAT) {
      const ban = xuatBang([canMoi()], { mau: m.ma, nguoiNhan, cot: MOI_COT, today: TODAY, tenSan: "[Tên sàn]", mauBai: MAU_BAI });
      const lot = timRoRi(JSON.stringify({ cot: ban.cot, dong: ban.dong, bai: ban.bai ?? "" }), moi);
      assert.deepEqual(lot, [], `${nguoiNhan} · ${m.ma}: mồi lọt ${JSON.stringify(lot).slice(0, 200)}`);
      dem++;
    }
  }
  assert.equal(dem, 2 * MAU_XUAT.length);
});

test("rò rỉ: mẫu ghi thẳng mang cột nội bộ bị lọc khi đọc", () => {
  const { ds } = docMauBang([{ id: "00000000-0000-4000-8000-000000000001", ten: "[Tên] ghi thẳng", cot: MOI_COT }]);
  for (const c of ds[0]!.cot) assert.notEqual(COT_BANG_HANG[c].khoa, null, `cột nội bộ ${c} còn trong mẫu đọc ra`);
  // Đối chứng dương: bộ quét bắt được khi một cột nội bộ lọt vào chữ ra.
  const moi = giaTriMoi(canMoi(), "nhom_moi_gioi", CAU_HINH_MAC_DINH);
  assert.ok(timRoRi(`người giữ: ${canMoi().holderName}`, moi).length > 0, "bộ quét không bắt được tên người giữ");
});
