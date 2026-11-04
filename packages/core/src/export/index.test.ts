// Lõi của E7 (hàng 43, AC-7): căn mồi qua `xuatBang` cho 5 mẫu × 2 người nhận × 4 cấu hình, mọi cột bảng hàng và một
// trường riêng; quét bảng, bài, nhãn cột bỏ và chữ trong tệp xlsx bằng `timRoRi`. Bài kiểm của hộp thoại (Task 4) chạy
// lại trên đường chuyển dòng của trang. Chiều đỏ: bản sao hàm xuất đọc thẳng căn thay vì bản đã ẩn.
import assert from "node:assert/strict";
import { test } from "node:test";
import { CAU_HINH_TAT_CA, canMoi, giaTriMoi, NGUOI_NHAN, timRoRi, type CanNoiBo } from "../redaction";
import { COT_BANG_HANG, ghiXlsx, MA_MAU_XUAT, xuatBang, type BanXuat, type CotBangHang, type CotGocNhin, type TuyChonXuat } from ".";

const TODAY = "2026-11-04";
const MOI_COT: readonly CotGocNhin[] = [...(Object.keys(COT_BANG_HANG) as CotBangHang[]), { id: "cf:canGoc", nhan: "Căn góc" }];

type HamXuat = (can: readonly CanNoiBo[], tuy: TuyChonXuat) => BanXuat;

function kiemRoRi(ham: HamXuat): string[] {
  const loi: string[] = [];
  const can = canMoi();
  for (const mau of MA_MAU_XUAT) {
    for (const nguoiNhan of NGUOI_NHAN) {
      for (const cauHinh of CAU_HINH_TAT_CA) {
        const b = ham([can], { mau, nguoiNhan, cauHinh, cot: MOI_COT, today: TODAY, tenSan: "[Tên sàn] Mồi" });
        const vanBan = [JSON.stringify(b), b.bai ?? "", new TextDecoder().decode(ghiXlsx(b))].join("\n");
        for (const r of timRoRi(vanBan, giaTriMoi(can, nguoiNhan, cauHinh))) loi.push(`${mau}/${nguoiNhan}: rò ${r.truong}`);
      }
    }
  }
  return loi;
}

test("E7 lõi — 5 mẫu × 2 người nhận × 4 cấu hình không rò mồi nào", () => {
  assert.deepEqual(kiemRoRi(xuatBang), []);
});

test("E7 lõi — khách riêng ẩn mã căn: không mã căn, không số tầng", () => {
  const b = xuatBang([canMoi()], { mau: "xlsx", nguoiNhan: "khach_rieng", cot: MOI_COT, today: TODAY, tenSan: "[Tên sàn]" });
  assert.ok(!b.khoa.includes("unitNumber") && !b.khoa.includes("floor"));
  assert.equal(b.dong[0]![b.cot.indexOf("Tầng")], "Tầng cao", "tầng 12 của toà 15 tầng");
});

test("E7 lõi chiều đỏ — bản sao đọc thẳng căn thay vì bản đã ẩn thì lọt chủ nhà", () => {
  const docThang: HamXuat = (can, tuy) => {
    const b = xuatBang(can, tuy);
    return { ...b, dong: can.map((c) => b.dong[0]!.map((o, i) => (i === 0 ? `${o} ${c.ownerName}` : o))) };
  };
  assert.ok(kiemRoRi(docThang).includes("xlsx/nhom_moi_gioi: rò ownerName"));
});
