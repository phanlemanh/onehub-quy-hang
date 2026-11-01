// «Sẵn sàng bán» ở hồ sơ căn (hàng 23) — E4, E5, E5b, E6, E10. Phần thuần: không React, không mạng.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { STANDARD_STATUSES, type StandardStatus } from "@quy-hang/core/listing";
import type { UnitPhoto } from "@quy-hang/core/photos";
import { dungLenhTrangThai, type HangSua } from "../../inventory/cell-edit/lenh";
import { bamSanSang, demAnhThat, hienNutSanSang, kiemSanSang } from "./san-sang";

const DU: HangSua = { id: "h1", unitNumber: "A-0601", listPrice: 3_250_000_000, feeInclusion: "included", standardStatus: "Incomplete", legalStatus: "pink_book", occupantType: "vacant" };
/** Ảnh dạng phản hồi của API ảnh (kiểu UnitPhoto của lõi). */
const anh = (compartment: UnitPhoto["compartment"], isSample = false): UnitPhoto => ({
  id: `p-${Math.random().toString(36).slice(2, 8)}`,
  buildingName: "Toà A",
  unitNumber: "A-0601",
  compartment,
  displayOrder: 0,
  isCover: false,
  isSample,
  takenAt: null,
  contentType: "image/jpeg",
  byteSize: 1000,
  width: 10,
  height: 10,
  addedAt: "2026-11-01T00:00:00Z",
} as UnitPhoto);

test("E4 khi nào có nút: 6 trạng thái × 2 quyền viết trước", () => {
  const CO: Record<StandardStatus, [boolean, boolean]> = {
    Incomplete: [true, false],
    Active: [false, false],
    Pending: [false, false],
    Closed: [false, false],
    Hold: [true, false],
    Withdrawn: [false, false],
  };
  let so = 0;
  for (const tt of STANDARD_STATUSES) {
    assert.equal(hienNutSanSang(tt, true), CO[tt][0], `${tt}, sửa được`);
    assert.equal(hienNutSanSang(tt, false), CO[tt][1], `${tt}, không sửa được`);
    so += 2;
  }
  assert.equal(so, 12);
  const nguon = readFileSync(fileURLToPath(new URL("../ho-so/cot-ho-so.tsx", import.meta.url)), "utf8");
  assert.match(nguon, /from "\.\.\/ready\/nut-san-sang"/, "hồ sơ căn không nhập nút");
  const muc = nguon.slice(nguon.indexOf('"Lần rao đang mở"'), nguon.indexOf("</Muc>", nguon.indexOf('"Lần rao đang mở"')));
  assert.match(muc, /<NutSanSang /, "nút không nằm trong mục «Lần rao đang mở»");
});

test("E5 chỉ đúng chỗ thiếu: ma trận viết trước", () => {
  const CA: [string, Partial<HangSua>, number, [string, string][]][] = [
    ["thiếu giá", { listPrice: null }, 1, [["Giá về tay", "gia"]]],
    ["thiếu điều kiện phí", { feeInclusion: null }, 1, [["Giá về tay", "gia"]]],
    ["thiếu ảnh", {}, 0, [["Ảnh thật", "anh"]]],
    ["chưa có mã căn (không báo thêm ảnh)", { unitNumber: null }, 0, [["Mã căn", "ma"]]],
    ["thiếu pháp lý", { legalStatus: null }, 1, [["Pháp lý", "legalStatus"]]],
    ["thiếu tình trạng sử dụng", { occupantType: null }, 1, [["Tình trạng sử dụng", "occupantType"]]],
    [
      "thiếu cả năm",
      { listPrice: null, feeInclusion: null, legalStatus: null, occupantType: null },
      0,
      [["Giá về tay", "gia"], ["Ảnh thật", "anh"], ["Pháp lý", "legalStatus"], ["Tình trạng sử dụng", "occupantType"]],
    ],
  ];
  for (const [ten, doi, soAnh, mong] of CA) {
    const kq = kiemSanSang({ ...DU, ...doi }, soAnh);
    assert.deepEqual(kq.thieu.map((t) => [t.nhan, t.dich]), mong, ten);
    assert.equal(kq.lenh, null, `${ten}: không lệnh`);
  }
  assert.deepEqual(kiemSanSang(DU, 1).thieu, [], "đủ → rỗng");
});

test("E5b đếm ảnh thật như máy chủ: ma trận viết trước", () => {
  const CA: [string, UnitPhoto[], number][] = [
    ["không ảnh", [], 0],
    ["chỉ ảnh mẫu Gửi được", [anh("shareable", true)], 0],
    ["chỉ ảnh Nội bộ", [anh("internal")], 0],
    ["ảnh đã xoá (API không trả)", [], 0],
    ["một ảnh thật", [anh("shareable")], 1],
    ["hai thật, một mẫu, một nội bộ", [anh("shareable"), anh("shareable"), anh("shareable", true), anh("internal")], 2],
  ];
  for (const [ten, ds, mong] of CA) assert.equal(demAnhThat(ds), mong, `${ten}: đếm ${demAnhThat(ds)}`);
});

test("E6 đủ thì gửi đúng một lệnh của trình sửa ô", async () => {
  const kq = kiemSanSang(DU, 1);
  const tuO = dungLenhTrangThai(DU, "Active");
  assert.ok(tuO.ok && "lenh" in tuO);
  assert.deepEqual(kq.lenh, tuO.lenh, `payload: ${JSON.stringify(kq.lenh)}`);
  const da: unknown[] = [];
  const gui = async (l: unknown) => void da.push(l);
  assert.deepEqual(await bamSanSang(DU, { onLine: true, docAnh: async () => ({ anh: [anh("shareable")] }), gui }), { kind: "da-gui" });
  assert.deepEqual(da, [{ type: "status_changed", payload: { to: "Active" } }]);
  const tt = await bamSanSang(DU, { onLine: true, docAnh: async () => ({ anh: [anh("shareable", true)] }), gui });
  assert.equal(tt.kind, "thieu");
  assert.equal(da.length, 1, "còn thiếu mà vẫn gửi");
});

test("E10 ngoại tuyến hay đọc ảnh lỗi: «Cần mạng để kiểm ảnh», không gửi", async () => {
  let gui = 0;
  const g = async () => void gui++;
  const loi = async () => {
    throw new TypeError("Failed to fetch");
  };
  assert.deepEqual(await bamSanSang(DU, { onLine: true, docAnh: loi, gui: g }), { kind: "can-mang" }, "đọc ảnh lỗi không được coi là 0 ảnh");
  assert.deepEqual(await bamSanSang(DU, { onLine: false, docAnh: async () => ({ anh: [anh("shareable")] }), gui: g }), { kind: "can-mang" });
  assert.equal(gui, 0);
  assert.deepEqual(await bamSanSang(DU, { onLine: true, docAnh: async () => ({ anh: [anh("shareable")] }), gui: g }), { kind: "da-gui" }, "đối chứng");
  const nguon = readFileSync(fileURLToPath(new URL("./nut-san-sang.tsx", import.meta.url)), "utf8");
  assert.match(nguon, /disabled=\{!coMang \|\| dang\}/, "nút không mờ khi ngoại tuyến");
  assert.match(nguon, /CHU_CAN_MANG_KIEM_ANH/, "thiếu chữ «Cần mạng để kiểm ảnh»");
});
