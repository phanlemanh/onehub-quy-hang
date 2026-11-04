// Bài rò rỉ của route công khai trang khách (hàng 35: AC-8, luật đợt 39). Thân route đọc dựng bằng đúng hàm của route
// (`thanTrangKhach` của lõi, `docTrangKhach` gọi nó) từ căn mồi, ở mọi người nhận × mọi cấu hình; route ảnh chỉ trả ảnh có
// id trong thân ấy, nên ảnh nội bộ của căn mồi không được có trong thân. Ba route rào đọc tên ở đây:
//   "/api/v1/public/shares/:code"
//   "/api/v1/public/shares/:code/events"
//   "/api/v1/public/shares/:code/photos/:photoId"
import assert from "node:assert/strict";
import { test } from "node:test";
import { CAU_HINH_MAC_DINH, CAU_HINH_TAT_CA, canMoi, giaTriMoi, NGUOI_NHAN, timRoRi } from "@quy-hang/core/redaction";
import { thanTrangKhach } from "@quy-hang/core/sharing";

const HOM_NAY = "2026-11-04";
const AUDIENCE = { khach_rieng: "client", nhom_moi_gioi: "agents" } as const;

test("rò rỉ: route đọc công khai", () => {
  const can = canMoi();
  const noiBo = can.photos.filter((a) => a.compartment === "internal").map((a) => a.id);
  assert.ok(noiBo.length > 0, "đối chứng: căn mồi có ảnh nội bộ");
  let o = 0;
  const loi: string[] = [];
  for (const nguoiNhan of NGUOI_NHAN) {
    for (const cauHinh of CAU_HINH_TAT_CA) {
      const than = JSON.stringify(thanTrangKhach({ can: [can], audience: AUDIENCE[nguoiNhan], today: HOM_NAY, cauHinh }));
      for (const r of timRoRi(than, giaTriMoi(can, nguoiNhan, cauHinh))) loi.push(`${nguoiNhan}/${JSON.stringify(cauHinh)}: rò ${r.truong} (${r.dang})`);
      for (const id of noiBo) if (than.includes(id)) loi.push(`${nguoiNhan}/${JSON.stringify(cauHinh)}: ảnh nội bộ ${id}`);
      o++;
    }
  }
  assert.equal(o, NGUOI_NHAN.length * CAU_HINH_TAT_CA.length, "số tổ hợp");
  assert.deepEqual(loi, []);
  // Đối chứng dương: chèn một giá trị nội bộ của căn mồi vào thân thì máy dò bắt.
  const ban = JSON.stringify({ ...thanTrangKhach({ can: [can], audience: "client", today: HOM_NAY }), lo: can.ownerPhone });
  assert.ok(timRoRi(ban, giaTriMoi(can, "khach_rieng", CAU_HINH_MAC_DINH)).length > 0, "đối chứng: máy dò không bắt số chủ nhà");
});
