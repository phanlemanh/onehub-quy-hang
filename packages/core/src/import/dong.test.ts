import assert from "node:assert/strict";
import { test } from "node:test";
import { dongDauMoiCan, khoaCan, kiemNgayXacNhan, LY_DO_DONG_NHAP, lyDoTrung, quyetDongNhap, type ImportRowFacts, type OpenListingFact } from "./dong";

// Đáp án viết tay theo bảng «Lõi: quyết một dòng» của thiết kế hàng 65a — mỗi dòng: điều kiện đứng trước thắng.
const DAP_AN: [string, (f: ImportRowFacts) => boolean, string, string][] = [
  ["bỏ dòng", (f) => f.skippedByPerson, "skip", "bạn bỏ dòng này"],
  ["ô chặn", (f) => f.blockedCell, "skip", "còn ô cần bạn xem ở toà, mã căn hay giá chào"],
  ["trùng", (f) => f.duplicateOfRow !== null, "skip", "trùng dòng 3 trong file"],
  ["đã bán", (f) => f.fileStatus === "Closed", "skip", "file ghi đã bán — không nhập"],
  ["ngừng", (f) => f.fileStatus === "Withdrawn", "skip", "file ghi ngừng hẳn — không nhập"],
  ["đầu chủ", (f) => !f.agentValid, "skip", "chưa có đầu chủ giữ căn"],
  ["người giữ", (f) => f.openListing === "held_by_effective_agent", "update", "căn đã có hàng bạn giữ — cập nhật hàng ấy"],
  ["người khác", (f) => f.openListing === "held_by_other", "supplement", "căn đã có hàng mở — gửi tin bổ sung cho đầu chủ giữ căn"],
  ["không đọc", (f) => f.openListing === "unreadable", "supplement", "căn đã có hàng của người khác trong sàn"],
  ["mới", () => true, "create", "căn mới"],
];

test("quyết dòng: ma trận đủ tổ hợp", () => {
  const HANG_MO: OpenListingFact[] = ["none", "held_by_effective_agent", "held_by_other", "unreadable"];
  let soLan = 0;
  for (const skippedByPerson of [false, true])
    for (const blockedCell of [false, true])
      for (const duplicateOfRow of [null, 3])
        for (const fileStatus of [null, "Closed", "Withdrawn"])
          for (const agentValid of [true, false])
            for (const openListing of HANG_MO) {
              const f: ImportRowFacts = { skippedByPerson, blockedCell, duplicateOfRow, fileStatus, agentValid, openListing };
              const [, , action, reason] = DAP_AN.find(([, dk]) => dk(f))!;
              assert.deepEqual(quyetDongNhap(f), { action, reason }, JSON.stringify(f));
              soLan++;
            }
  assert.equal(soLan, 192, "2 × 2 × 2 × 3 × 2 × 4 tổ hợp");

  // Vài tổ hợp ghi thẳng, đọc được không cần bảng.
  const goc: ImportRowFacts = { skippedByPerson: false, blockedCell: false, duplicateOfRow: null, fileStatus: "Active", agentValid: true, openListing: "none" };
  assert.deepEqual(quyetDongNhap(goc), { action: "create", reason: "căn mới" });
  assert.deepEqual(quyetDongNhap({ ...goc, blockedCell: true, duplicateOfRow: 3 }), { action: "skip", reason: "còn ô cần bạn xem ở toà, mã căn hay giá chào" }, "ô chặn đứng trước trùng");
  assert.deepEqual(quyetDongNhap({ ...goc, fileStatus: "Closed", openListing: "held_by_other" }), { action: "skip", reason: "file ghi đã bán — không nhập" });
});

test("quyết dòng: lý do là hằng của lõi", () => {
  assert.deepEqual(Object.values(LY_DO_DONG_NHAP), [
    "bạn bỏ dòng này",
    "còn ô cần bạn xem ở toà, mã căn hay giá chào",
    "file ghi đã bán — không nhập",
    "file ghi ngừng hẳn — không nhập",
    "chưa có đầu chủ giữ căn",
    "căn đã có hàng bạn giữ — cập nhật hàng ấy",
    "căn đã có hàng mở — gửi tin bổ sung cho đầu chủ giữ căn",
    "căn đã có hàng của người khác trong sàn",
    "căn mới",
  ]);
  assert.equal(lyDoTrung(10), "trùng dòng 10 trong file");
});

test("quyết dòng: trùng xét trên cả file", () => {
  const k = khoaCan("Toà A", "A-12.01");
  assert.equal(k, khoaCan("toa a", "A 1201"), "cùng căn dù gõ khác");
  assert.equal(khoaCan("Toà A", null), null);
  const trung = dongDauMoiCan([
    { row: 250, key: k },
    { row: 10, key: k },
    { row: 11, key: khoaCan("Toà A", "A-1202") },
    { row: 12, key: null },
    { row: 300, key: k },
  ]);
  assert.deepEqual([...trung.entries()].sort((a, b) => a[0] - b[0]), [
    [250, 10],
    [300, 10],
  ]);
});

test("quyết dòng: ngày xác nhận trong khoảng", () => {
  const HOM_NAY = "2026-11-03";
  assert.equal(kiemNgayXacNhan("2026-06-01", HOM_NAY), null);
  assert.equal(kiemNgayXacNhan("2024-11-03", HOM_NAY), null, "đúng mốc hai năm vẫn dùng được");
  assert.match(kiemNgayXacNhan("2024-11-02", HOM_NAY)!, /trước mốc 2 năm/);
  assert.match(kiemNgayXacNhan("2026-11-04", HOM_NAY)!, /sau hôm nay/);
});
