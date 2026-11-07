// Bài rò rỉ của màn Mẫu (hàng mau-bang-hang-va-bai, AC-9): mã nguồn màn không đọc trường nội bộ nào của căn, và hai tab
// dựng ra (danh sách mẫu, xem trước bài) không mang giá trị mồi nào. Rào cửa ra đọc tệp này (canMoi + timRoRi).
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { COT_BANG_HANG, docMauBang, type CotBangHang } from "@quy-hang/core/export";
import { CAU_HINH_MAC_DINH, canMoi, giaTriMoi, NGUOI_NHAN, timRoRi } from "@quy-hang/core/redaction";
import { createElement as h } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { loiMauHong } from "./mau-san";
import { BangMauBai } from "./vung-mau-bai";
import { BangMauBang } from "./vung-mau-bang";

const TEP = ["mau-san.ts", "vung-mau-bang.tsx", "vung-mau-bai.tsx", "page.tsx", "bao-hong.tsx"];
const NOI_BO = ["ownerName", "ownerPhone", "floorPrice", "titleDeedPhoto", "holderName", "holderUserId", "ghiChuNoiBo", "contacts"];

test("rò rỉ: mã nguồn màn Mẫu không đọc trường nội bộ", () => {
  const loi: string[] = [];
  for (const t of TEP) {
    const ma = readFileSync(new URL(`./${t}`, import.meta.url), "utf8");
    for (const k of NOI_BO) if (new RegExp(`\\b${k}\\b`).test(ma)) loi.push(`${t}: đọc ${k}`);
  }
  assert.deepEqual(loi, []);
  // Đối chứng dương: bộ quét bắt được khi một tệp nêu trường nội bộ.
  assert.ok(new RegExp(`\\bholderName\\b`).test("const x = can.holderName;"));
});

test("rò rỉ: hai tab dựng ra không mang giá trị mồi", () => {
  const html = [
    renderToStaticMarkup(h(BangMauBang, { tt: { kieu: "xong", giaTri: [{ id: "00000000-0000-4000-8000-000000000001", name: "[Tên] gửi đội", columns: ["unitNumber", "listPrice"] }] }, lamMoi: () => {} })),
    renderToStaticMarkup(h(BangMauBai, { tt: { kieu: "xong", giaTri: { zalo: { opening: "Chào nhóm", closing: "Gọi em" } } }, lamMoi: () => {} })),
  ].join("\n");
  let o = 0;
  for (const nguoiNhan of NGUOI_NHAN) {
    assert.deepEqual(timRoRi(html, giaTriMoi(canMoi(), nguoiNhan, CAU_HINH_MAC_DINH)), [], `${nguoiNhan}: mồi lọt`);
    o++;
  }
  assert.equal(o, NGUOI_NHAN.length);
});

// Hàng man-mau-bao-mau-hong (E6): khối báo mẫu hỏng dựng từ một mẫu đã lưu mang MỌI cột của bảng hàng (kể cả cột nội bộ)
// nêu cột bằng nhãn, không mang giá trị mồi nào của căn.
test("rò rỉ: khối báo mẫu hỏng không mang giá trị mồi", () => {
  const moiCot = Object.keys(COT_BANG_HANG) as CotBangHang[];
  const { ds, loi } = docMauBang([{ id: "00000000-0000-4000-8000-000000000002", name: "[Tên] ghi thẳng", columns: moiCot }]);
  assert.ok(loi.length > 0, "dữ liệu không hỏng — ca không đo gì");
  const html = renderToStaticMarkup(h(BangMauBang, { tt: { kieu: "xong", giaTri: ds, baoHong: loiMauHong(loi) }, lamMoi: () => {} }));
  assert.ok(html.includes("Người giữ"), "khối báo không hiện — ca không đo gì");
  for (const nguoiNhan of NGUOI_NHAN) assert.deepEqual(timRoRi(html, giaTriMoi(canMoi(), nguoiNhan, CAU_HINH_MAC_DINH)), [], `${nguoiNhan}: mồi lọt`);
});

test("rò rỉ: khối báo không chép giá trị lạ trong mẫu đã lưu", () => {
  // Dòng ghi thẳng mang chính giá trị nội bộ của căn mồi ở chỗ khoá cột và ở mẫu không đọc được: câu báo phải nêu bằng
  // lời chung («một cột lạ»), không chép giá trị ấy ra màn.
  const moi = canMoi();
  const loi = docMauBang([{ id: "00000000-0000-4000-8000-000000000003", name: "[Tên] B", columns: ["listPrice", String(moi.holderName)] }, String(moi.ownerName)]).loi;
  assert.ok(loi.some((l) => l.includes(String(moi.holderName))), "đối chứng: dòng lỗi của lõi có mang giá trị mồi — ca đo được");
  const html = renderToStaticMarkup(h(BangMauBang, { tt: { kieu: "xong", giaTri: [], baoHong: loiMauHong(loi) }, lamMoi: () => {} }));
  for (const nguoiNhan of NGUOI_NHAN) assert.deepEqual(timRoRi(html, giaTriMoi(moi, nguoiNhan, CAU_HINH_MAC_DINH)), [], `${nguoiNhan}: khối báo chép giá trị mồi`);
});
