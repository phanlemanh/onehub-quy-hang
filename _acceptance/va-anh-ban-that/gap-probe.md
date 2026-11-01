---
slug: va-anh-ban-that
at: 2026-11-01T10:45:00Z
verdict: findings
p0: 2
p1: 1
p2: 1
---

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P0 | evals | Không bài nào chạy đường ba bước trên kho ảnh thật; máy chủ giả không kiểm chữ ký, CORS, Content-Range; đường ba bước phía web không có bài đo | Bản thật từ chối PUT vì CORS hay chữ ký, mọi bài vẫn xanh | Bài web cho nguon-api; thử trên kho thật | fixed: thêm E1c (web, ba lời gọi đúng thứ tự); human-gate1: thử khói trên kho thật thành Hỏi-3 (máy không có khoá), AC-6 ghi rõ chạy ở dev |
| P0 | design | Ngoài-8 ghi máy quyết một lối nhưng lối link sống lâu vẫn sống — đổi chác chi phí và thời gian lộ link | Chủ kho ký tưởng chỉ có một cách | Dòng Hỏi mới | human-gate1: thành Hỏi-2 (dòng mới supersedes), AC-4 ghi Hỏi-2 |
| P1 | evals | E2 thiếu ca photoId sàn khác, photoId đã có dòng, cỡ và loại khai sai, và không khẳng định DELETE chỉ trong tiền tố sàn | Xác nhận lần hai trả 500 hay ghi đè; DELETE nhầm đối tượng sàn khác | Bốn ca viết trước + assert tiền tố trên mọi DELETE | fixed: E2 thêm bốn ca và assert tiền tố; AC-2 thêm câu |
| P2 | contract | Chữ thông báo lệch giữa đặc tả UX, AC-5, E5; E5 chỉ đo hàm, không đo nút | Nút đổi thứ tự không đi qua hàm báo lỗi, vẫn im lặng | Bảng năm chữ chung; quét nút | fixed: bảng năm chữ ở đặc tả UX, AC-5, E5; E5 quét muc-anh.tsx không lời gọi sửa/xoá ngoài lamViec |
