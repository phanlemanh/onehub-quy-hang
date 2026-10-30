---
slug: du-lieu-mau-san-thu
at: 2026-10-30T17:15:00Z
verdict: findings
p0: 0
p1: 2
p2: 3
---

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P1 | evals | E2 coi mọi dãy từ 9 chữ số là số điện thoại; giá đồng của mẫu B lọt vào bộ dò | E2 đỏ oan ở mọi ô giá, người vá bằng cách bỏ qua ô số, rồi số thật lưu dạng số lọt qua | Dò theo trường điện thoại và cột tìm theo tiêu đề; quét rộng chỉ bắt 10 chữ số mở đầu bằng 0; đối chứng ô giá không bị đếm; phá thử ô số ở cột điện thoại | fixed: E2 dò theo trường và cột, quét rộng 10 chữ số mở đầu 0, đối chứng ô giá ≥ 1e9, thêm phá thử ô số |
| P1 | evals | Dòng cơ sở dữ liệu ở E2, E3 lấy ra bằng chính nhãn nên phép kiểm vòng tròn; E2 có thể đỏ oan sau E8 | Lệnh nạp ghi một người email lạ vào sàn thử mà E2, E3 vẫn xanh | Lấy dòng bằng chênh lệch ảnh chụp năm bảng trước và sau khi nạp; phá thử chèn người email lạ; ghim thứ tự với E8 | fixed: E2, E3 lấy dòng bằng chênh lệch ảnh chụp, không lọc theo nhãn, chạy trên cơ sở dữ liệu chưa có dòng đối chứng; E3 thêm phá thử người email lạ |
| P2 | contract | Không thước nào đo tệp xlsx mở được bằng Excel thật | Máy đọc bằng zipfile xanh, Excel báo tệp hỏng ở hàng 20, 21 | Thêm bước chủ kho mở tệp bằng Excel kèm ảnh | deferred: không phải eval máy đo được ở đây — Cổng Bằng chứng trình ảnh tiêu đề, chủ kho mở thử một lần (Notes của hợp đồng) |
| P2 | contract | Ngưỡng chết của ô cơ hội để trống timebox, Đường đo không có dòng cho nó | Cổng Phạm vi duyệt ngưỡng chết không bao giờ kích hoạt | Điền timebox và thêm dòng Đường đo | human-gate1: timebox là quyết định của chủ kho — máy khuyên 2 vòng chấm S4 hay hết 31/10 |
| P2 | evals | Vế email của AC-2 chỉ có đối chứng dương, không phá thử | Email thật nằm ở trường ghi chú hay ô của mẫu B lọt qua | Phá thử chèn email lạ vào trường không phải email và vào ô mẫu B | fixed: E2 thêm phá thử email lạ ở trường ghi chú và ô của bản sao mau-b.xlsx |
