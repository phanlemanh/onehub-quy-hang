---
schema_version: 1
feature: "Vá sửa trên ô: dòng «Hiểu là» đọc lại đúng số máy ghi, không làm tròn; nút Hoàn tác trên thông báo hoàn tác đúng lần sửa của chính nó và không ghi đè lần sửa sau"
slug: va-sua-tren-o
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: [ui]
status: implemented
approved_by: Manh Phan
approved_at: 2026-11-01
design_doc: _acceptance/va-sua-tren-o/design.md
---

# Acceptance Contract: va-sua-tren-o

## Context

Hàng phát sinh của đợt (dãy B), giám sát xếp 01/11 sau Cổng Bằng chứng hàng 15 (sua-tren-o): gộp hai mục chủ kho chọn
«mở hợp đồng mới» — Ngoài-2 (đọc lại làm tròn) và Ngoài-3 (Hoàn tác trên thông báo cũ đảo nhầm hay im lặng). Ranh giới:
`packages/core/src/pricing/**`, `apps/web/src/app/(app)/inventory/cell-edit/**`, `_acceptance/va-sua-tren-o/**`; cộng
hàng lộ trình máy thêm (`docs/plan/lo-trinh.json`, giám sát cho, B-16) và tệp vẽ lại.

## Criteria

- AC-1: Given bộ viết giá `vietGia` và bộ đọc `docGia` ở `packages/core/src/pricing/`, When viết rồi đọc lại một bảng số
  viết trước (gồm 4.655.000.000, 4.650.500.000, 1.500.000, 1.234.567, 950.000.000, 4.800.000.000, 1.000.000.000.000,
  1.000.000, 999.999.999, 1.000.000.001) và 2.000 số nguyên đồng sinh theo hạt giống cố định trong khoảng 1 triệu tới
  1.000 tỷ, Then mọi số đọc lại đúng bằng chính nó; và chữ viết của bảng viết trước khớp từng dòng («4,655 tỷ»,
  «4,6505 tỷ», «1,5 triệu», «1,234567 triệu», «950 triệu», «4,8 tỷ», «1000 tỷ», …).
- AC-2: Given trình sửa Giá, When gõ «4,655 tỷ», «4 tỷ 655», «1,5 triệu» hay giá chốt «4,6505 tỷ», Then dòng «Hiểu là: …»
  viết đúng số máy sẽ ghi (4,655 tỷ · 4,655 tỷ · 1,5 triệu · giá chốt 4,6505 tỷ); hộp hỏi lại và thông báo «Đã đổi …»
  cũng viết giá đúng từng đồng. Bảng viết trước các chỗ hiện giá trong trình sửa: đọc lại, đọc lại giá chốt, mô tả
  «cũ → mới» của hộp hỏi lại, chữ điền sẵn ô gõ — mỗi chỗ một assert.
- AC-3: Given căn đang giá 4.655.000.000, When mở ô Giá, Then ô gõ điền sẵn «4,655 tỷ»; Enter không gõ gì thì sự kiện
  ghi (nếu có) mang listPrice 4.655.000.000 — không bao giờ là 4.660.000.000. (cross-layer)
- AC-4: Given đầu chủ sửa giá căn A rồi sửa giá căn B (hai thông báo cùng hiện), When bấm «Hoàn tác» trên thông báo của
  A, Then đúng MỘT sự kiện bù ghi cho A về giá và phí trước; B không có sự kiện mới; thông báo «Đã hoàn tác giá A».
  (cross-layer)
- AC-5: Given một thông báo của lần sửa căn A, When căn A đã có lần sửa sau (của chính người này hay người khác, kéo về
  máy) rồi bấm «Hoàn tác» trên thông báo cũ, Then không sự kiện nào ghi và hiện «Không hoàn tác được: căn đã có lần sửa
  sau». Ma trận viết trước của hàm quyết: chưa dùng + cùng phiên bản → ghi; khác phiên bản (lớn hơn, nhỏ hơn, không còn
  trên máy) → từ chối; đã dùng → «Đã hoàn tác rồi». Lần sửa sau của người khác kéo về máy cũng chặn như vậy. Lối khi
  căn đã có lần sửa sau là Hỏi-1 (sổ d-20261101T035548Z-6), nháp theo khuyến nghị. (cross-layer)
- AC-6: Given một lần sửa vừa ghi, When hoàn tác bằng nút trên thông báo rồi bấm Ctrl/Cmd+Z, hay bấm Ctrl/Cmd+Z rồi bấm
  nút, Then chỉ một sự kiện bù được ghi; nút lần hai hiện «Đã hoàn tác rồi». Lệnh bù không tạo bản ghi hoàn tác mới:
  Ctrl/Cmd+Z giữ bản ghi của lần sửa thành công gần nhất (hoàn tác A bằng nút rồi Ctrl+Z thì đảo B, lần sửa sau A);
  bản ghi ấy đã dùng thì Ctrl+Z không làm gì. (cross-layer)
- AC-7: Given cây sau hàng này, When chạy kiểm kiểu, lint (luật `quy-hang-ui`, mức nợ 0), bộ test và sàn thiết kế, Then
  tất cả xanh; không tệp nào ngoài ranh giới của hàng đổi.

## Coverage

Quét không gian AC theo trục (preset test-matrix, rút gọn):

- Trục A — chỗ viết giá: đọc lại · giá chốt · hộp hỏi lại · thông báo · chữ điền sẵn ô gõ [thước CE: mọi chỗ gọi `vietGia`
  trong `cell-edit/`]
- Trục B — số: tỷ lẻ nhiều số · triệu lẻ · biên 1 triệu, dưới/trên 1 tỷ, 1.000 tỷ · ngẫu nhiên có hạt giống
- Trục C — đường hoàn tác: nút của thông báo đúng lần sửa · nút của thông báo cũ (căn khác sửa sau / cùng căn sửa sau) ·
  Ctrl+Z · dùng hai lần
- Core: A×B ở AC-1, AC-2, AC-3; C ở AC-4, AC-5, AC-6; rào AC-7.
- Later: cột Giá của Bảng hàng viết đúng từng đồng · Ctrl+Z sau lần ghi lỗi (Ngoài-4 hàng 15).
- Never: hoàn tác ghi đè lần sửa sau.

## Out of scope

- Cột Giá của Bảng hàng (hàng 14) vẫn viết gọn hai số lẻ — ngoài vùng, hàng sau nếu cần.
- Ghi lỗi rồi Ctrl/Cmd+Z đảo lần sửa thành công trước (Ngoài-4 hàng 15, chủ kho đã chọn Known limits).
- Làm chặt các bài tự kiểm của hàng 15 (Ngoài-5 tới 9).

## Notes

- Dữ liệu cho bài nhìn: chỗ thử dãy B của hàng 14 (`_acceptance/bang-hang-kieu-sheet/thu/dung-b.mjs`).
