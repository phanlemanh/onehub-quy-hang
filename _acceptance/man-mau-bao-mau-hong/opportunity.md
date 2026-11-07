---
schema_version: 1
slug: man-mau-bao-mau-hong
feature: Màn Mẫu của Cài đặt › Sàn báo cho Quản trị khi mẫu bảng hàng hay mẫu bài đã lưu có chỗ không đọc được, nói rõ chỗ nào; lần lưu kế không lặng lẽ xoá các chỗ ấy mà Quản trị biết trước điều sẽ xảy ra.
owner: phanlemanh@gmail.com
stage: decided              # discovery | decided | archived
decision: build   # build | iterate | park | kill — người ký Cổng 0 điền
decided_by: Manh Phan
decided_at: 2026-11-07T11:40:18Z   # ISO UTC — Cổng Bằng chứng #191 mau-bang-hang-va-bai: Ngoài-9 «mở hợp đồng mới» (sổ d-20261107T114018Z-46); luật 74 của đợt ghi «đã quyết»
prototype:
  base_commit:     # điểm cắt nhánh proto khỏi nhánh chính — guard diffBase khi keep
  disposition:     # keep | archive
lo_trinh_ma: man-mau-bao-mau-hong
lo_trinh_tep: docs/plan/lo-trinh.json
---

## Vấn đề & ai gặp

Mở từ hàng man-mau-bao-mau-hong của «Lộ trình onehub-quy-hang» (`docs/plan/lo-trinh.json`).

Màn Mẫu của Cài đặt › Sàn báo cho Quản trị khi mẫu bảng hàng hay mẫu bài đã lưu có chỗ không đọc được, nói rõ chỗ nào; lần lưu kế không lặng lẽ xoá các chỗ ấy mà Quản trị biết trước điều sẽ xảy ra.

Vì sao: Ngoài-9 của mau-bang-hang-va-bai (#191): chủ kho chọn «mở hợp đồng mới» ở Cổng Bằng chứng 07/11 (sổ d-20261107T114018Z-46). Hàng không mã — đã quyết.

## Ngưỡng chết / ngưỡng UAT

- Câu hỏi phép đo trả lời: đã đạt «Quản trị mở màn Mẫu thấy ngay mẫu đã lưu nào có chỗ không đọc được và vì sao; lần lưu kế không bỏ chỗ ấy mà Quản trị không được báo trước» chưa? (Ngoài-9 của mau-bang-hang-va-bai)
- Kết quả nào là SỐNG: Quản trị mở màn Mẫu thấy ngay mẫu đã lưu nào có chỗ không đọc được và vì sao; lần lưu kế không bỏ chỗ ấy mà Quản trị không được báo trước
- Kết quả nào là CHẾT: chưa đạt câu SỐNG ở trên khi hết timebox
- Timebox: hết đợt dau-khach-nhap
