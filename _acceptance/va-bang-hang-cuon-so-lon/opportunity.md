---
schema_version: 1
slug: va-bang-hang-cuon-so-lon
feature: "Bảng hàng của sàn có 5.000 căn mở và cuộn được tới «/ 5000 căn» mà không sập («Không mở được màn này», React #185 — vòng cập nhật vô hạn resizeItem → measureElement → onChange của bộ cuộn ảo), ở 1366×768 và 1920×1080; một bài kiểm đơn vị khoá vòng ấy."
owner: phanlemanh@gmail.com
stage: decided                # discovery | decided | archived
decision: build       # build | iterate | park | kill — người ký Cổng 0 điền
decided_by: Manh Phan
decided_at: 2026-11-06T13:24:07Z   # ISO UTC
prototype:
  base_commit:     # điểm cắt nhánh proto khỏi nhánh chính — guard diffBase khi keep
  disposition:     # keep | archive
lo_trinh_ma: va-bang-hang-cuon-so-lon
lo_trinh_tep: docs/plan/lo-trinh.json
---

## Vấn đề & ai gặp

Mở từ hàng va-bang-hang-cuon-so-lon của «Lộ trình onehub-quy-hang» (`docs/plan/lo-trinh.json`).

Bảng hàng của sàn có 5.000 căn mở và cuộn được tới «/ 5000 căn» mà không sập («Không mở được màn này», React #185 — vòng cập nhật vô hạn resizeItem → measureElement → onChange của bộ cuộn ảo), ở 1366×768 và 1920×1080; một bài kiểm đơn vị khoá vòng ấy.

Vì sao: Máy thêm khi mở vòng từ mô tả, 2026-11-06

Cổng Đáng: giám sát mở hàng vá khẩn giao dãy D (BÁO 06/11, D-23 «duyet» 13:24Z) sau khi lượt ghim lại của #165 phát hiện Bảng hàng trên main sập với sàn 5000 căn (React #185); chủ kho giao giám sát tự quyết việc kỹ thuật. Ngưỡng UAT: không — thước là E11 của bang-hang-kieu-sheet và bài kiểm đơn vị khoá vòng lặp.

## Ngưỡng chết / ngưỡng UAT

- Câu hỏi phép đo trả lời: Bảng hàng sàn 5.000 căn còn sập (React #185) ở máy tính hay điện thoại không?
- Kết quả nào là SỐNG: kiem-cuon.mjs đạt ở 1366×768, 1920×1080, 375×812, 375×812 mở hồ sơ, và đổi khổ trên một trang; E11 cuộn tới dòng 5000 ba lượt; bài kiểm đơn vị khoá vòng xanh.
- Kết quả nào là CHẾT: còn một khổ hiện «Không mở được màn này» hay lỗi #185 khi hết lượt chấm thứ ba.
- Timebox: trong ngày 06/11 — #165 đứng sau hàng này.
