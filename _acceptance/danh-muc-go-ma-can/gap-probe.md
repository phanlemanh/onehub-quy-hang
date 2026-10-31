---
slug: danh-muc-go-ma-can
at: 2026-10-31T03:44:00Z
verdict: findings
p0: 2
p1: 2
p2: 1
---

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P0 | design | Sổ để máy quyết việc phát hành danh mục mẫu ra bản thật (d-4 vế phát hành, d-5 câu trích chỉ quyết việc nạp lúc dựng bảng) | Hai tuần thử bắt đầu trước hàng 10, đầu chủ gõ mã thật nhận «không đúng cách đọc», tỉ lệ tự điền đo ra 0% vì danh mục là đồ mẫu — không ai ký đánh đổi | Dòng chỉ-người lên thẻ, thay vế phát hành của d-4, d-5 | human-gate1: Hỏi-3 (d-12 thay d-5), d-13 thay d-4 giữ vế không dựng bảng |
| P0 | contract | Hạng T2 máy hạ từ T3 của hàng; lối giữ T3 không chết; bảng gán trường vào lớp catalog nằm ngoài t3_paths [bai-thu-luoi-5000-dong#F1] | Chủ kho ký mà không thấy mình bỏ Cổng 1.5 và việc người chấm mục phán xét | Dòng chỉ-người riêng trên thẻ | human-gate1: Hỏi-4 (d-14 thay d-9); Context trỏ câu hỏi |
| P1 | evals | E9 chỉ đo ba trong bốn kết cục và đo danh sách khoá cấm (chuỗi có mặt) thay vì tập khoá cho phép | Ứng viên của ambiguous mang bản ghi danh mục nguyên vẹn, khoá lạ ngoài danh sách cấm lọt ra, E9 vẫn xanh | Tiêm danh mục hai dự án, đủ bốn kết cục qua HTTP, so tập khoá bằng tập cho phép, đối chứng âm khoá lạ bất kỳ | fixed: AC-9 và E9 viết lại — fixture hai dự án mang khoá lạ ghiChuNoiBo, deepEqual tập khoá, đối chứng âm ownerName |
| P1 | evals | E10 thiếu thước đúng căn độc lập — biến thể sinh bằng mã đang đo, tổng lead chỉ kiểm khác 0 | Tỉ lệ 100% vòng tròn, đạt cả khi hàm đọc tráo tầng với trục | Đáp án từ UPI hàng và toà + mã căn của lead, ghim 47, năm kiểu viết lại viết tay, ca âm tráo tầng trục | fixed: AC-10 và E10 viết lại — 47 mã ghim, 282 lần tra, đáp án dựng không qua hàm đọc, hai đối chứng âm |
| P2 | contract | Đường đo hứa chạy trên mã thật hai tuần thử mà không AC nào bảo đảm lệnh nhận nguồn khác | Tới lúc thử mới thấy lệnh chỉ đọc gói mẫu | Bỏ câu hứa, chuyển Later | fixed: bỏ dòng ở Đường đo, thêm mục Out of scope |
