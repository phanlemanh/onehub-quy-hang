// Thân trang khách và tên sự kiện của Lần gửi (hàng 35: AC-1, AC-4, AC-5). Bảng viết trước; căn mồi của hàng 31.
import assert from "node:assert/strict";
import { test } from "node:test";
import { banRaNgoai, CAU_HINH_MAC_DINH, canMoi, truongRa, type CanNoiBo } from "../redaction";
import { nguoiNhanCua, SU_KIEN_LAN_GUI, thanTrangKhach } from "./trang-khach";

const HOM_NAY = "2026-11-04";
const ba: CanNoiBo[] = [
  { ...canMoi(), unitNumber: "Z-03.01" },
  { ...canMoi(), unitNumber: "Z-01.01", standardStatus: "Pending" },
  { ...canMoi(), unitNumber: "Z-02.01", standardStatus: "Hold" },
];

test("trang khách: thân dựng từ bản ra theo thứ tự gửi", () => {
  const BANG = [
    ["client", "khach_rieng"],
    ["agents", "nhom_moi_gioi"],
  ] as const;
  assert.equal(BANG.length, 2, "số dòng bảng viết trước");
  for (const [audience, nguoiNhan] of BANG) {
    assert.equal(nguoiNhanCua(audience), nguoiNhan);
    const than = thanTrangKhach({ can: ba, audience, today: HOM_NAY });
    assert.deepEqual(Object.keys(than), ["companyName", "senderName", "nguoiNhan", "can"], "khoá của thân");
    assert.deepEqual([than.companyName, than.senderName, than.nguoiNhan], [ba[0]!.companyName, ba[0]!.senderName, nguoiNhan]);
    assert.deepEqual(than.can, ba.map((c) => banRaNgoai(c, { cua: "gui_link", nguoiNhan, today: HOM_NAY })), `${audience}: bản ra, giữ thứ tự`);
    const duoc = truongRa(nguoiNhan, CAU_HINH_MAC_DINH);
    for (const c of than.can) for (const k of Object.keys(c)) assert.ok((duoc as readonly string[]).includes(k), `${audience}: khoá thừa ${k}`);
  }
  // Đối chứng dương: khách riêng không có mã căn, nhóm môi giới có.
  assert.equal(thanTrangKhach({ can: ba, audience: "client", today: HOM_NAY }).can[0]!.unitNumber, undefined);
  assert.equal(thanTrangKhach({ can: ba, audience: "agents", today: HOM_NAY }).can[0]!.unitNumber, "Z-03.01");
});

test("trang khách: tên sự kiện là hai giá trị của migration 031", () => {
  assert.deepEqual(Object.values(SU_KIEN_LAN_GUI), ["link_opened", "interest"]);
});
