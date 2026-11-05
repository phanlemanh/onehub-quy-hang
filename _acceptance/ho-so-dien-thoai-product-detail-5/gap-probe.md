---
slug: ho-so-dien-thoai-product-detail-5
at: 2026-11-05T13:20:00Z
verdict: findings
p0: 2
p1: 3
p2: 0
---

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P0 | design | Dòng «bỏ đường-đo» ghi máy quyết trong khi ô ngưỡng chỉ để trống — đặt hay bỏ ngưỡng là của người [va-gui-can-da-go#F1] | Chủ kho ký vì tưởng không còn lựa chọn; Cổng Giá trị không có số | Thay bằng câu hỏi chỉ-người có khuyến nghị | fixed: dòng mới Hỏi-3 (chi-nguoi) thay dòng 7 |
| P0 | design | Dòng «dùng lại bản chuyển thể, không cài Pro» ghi nguồn mục tiêu với câu trích chỉ liên quan; chốt sẵn nửa Hỏi-1 [va-gui-can-da-go#F2] | Chủ kho chọn ReUI vì muốn khối gốc mà máy dựng từ bản trang khách | Đưa thành lựa chọn của người | fixed: dòng mới Hỏi-1b (chi-nguoi) thay dòng 2; Out of scope ghi «theo Hỏi-1b» |
| P1 | evals | E3 chỉ 7 mục, thiếu chữ khoá, mở toàn màn, đóng hồ sơ; không đối chứng dương thân cột | Thân cột thiếu nhãn mục → hai bên cùng hụt, so bằng nhau vẫn xanh | Ma trận 10 mục × 3 vai × 2 chỗ, đối chứng dương từng ô | fixed: E3 viết lại 60 ô, chiều đỏ ở chỗ Bảng hàng thẻ |
| P1 | contract | AC-4 đi qua dữ liệu máy chủ mà thiếu thẻ cross-layer, không bài đo dữ liệu trình duyệt nhận | Thân mới đọc thêm đường chưa qua luật ẩn → số chủ nằm trong phản hồi | Bài đo dữ liệu thật cho vai đầu khách, đối chứng dương đầu chủ | fixed: AC-4 gắn (cross-layer), thêm E10 lớp backend-effect dò phản hồi mạng; thiết kế ghi không thêm đường đọc |
| P1 | contract | AC-6 hứa bản đã tải khi mất mạng mà thiết kế không nêu nguồn; năm trạng thái không có ảnh | Ngoài đời mất mạng hiện trang lỗi, E6 vẫn đạt | Nêu nguồn và chụp ảnh trạng thái | fixed: nguồn là kho trên máy (KH-hs-tren-may, cùng nguồn thân cột); E9 thêm ảnh không thấy · chưa ảnh · mất mạng |
