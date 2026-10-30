---
slug: vo-ung-dung
at: 2026-10-30T17:09:36Z
verdict: findings
p0: 1
p1: 4
p2: 0
---

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P0 | design | Dòng sổ bỏ design-pass trích câu chỉ chứng vỏ máy tính; vỏ điện thoại tự ghép chưa ai xem trước [bai-thu-dong-bo-mat-mang#F2] [moi-nguoi-vai-khu#F2] | Cổng Phạm vi duyệt vỏ điện thoại chỉ bằng chữ, chủ kho chê ở Cổng Bằng chứng thì làm lại vỏ chung | Tách hai vế; vế điện thoại thành câu hỏi cho chủ kho | human-gate1: sổ tách thành dòng bỏ design-pass vế máy tính (supersedes dòng cũ) và Hỏi-4 cho vế điện thoại |
| P1 | contract | Hỏi-2 (người chỉ quản trị trên điện thoại) không có đường kiểm giao diện; ngưỡng ô cơ hội chưa có mục Đường đo | Bảng thuần đúng nhưng thanh tab lọc mất Cài đặt sàn, không eval nào đỏ | Thêm vế AC-5, bước E6, mục Đường đo | fixed: AC-5 thêm vế người chỉ quản trị; E6 thêm bước và ảnh E6-quan-tri; contract thêm mục Đường đo |
| P1 | evals | E14 hỏi danh sách cài thêm và địa chỉ mới không nằm trong inputs; không hỏi §9 ghi ngoại lệ Hỏi-2, Hỏi-3 | Thiếu dòng catalog hay dòng /me mà hội đồng vẫn chấm đạt | Danh sách tường minh trong câu hỏi hoặc inputs | fixed: câu hỏi E14 liệt địa chỉ tường minh, trỏ danh sách cài thêm và hai điều đã chốt ở mục Notes của contract (contract nằm trong inputs) |
| P1 | evals | Đối chứng nhớ theo nhà của E4 vô hiệu (/today không có cột); không đổi người | Lưu một cờ chung hay cookie không khoá theo người mà E4 vẫn xanh | Đối chứng giữa hai nhà có cột, thêm bước đổi người, bảng mong đợi viết trước | fixed: E4 bốn bước với bảng mong đợi viết trước, /inventory ↔ /shares, đổi người trên cùng trình duyệt |
| P1 | evals | Đổi sàn đi qua máy chủ nhưng E3 chỉ đo nhãn trên thanh, AC-2 thiếu tag cross-layer | Bộ chọn chỉ đổi nhãn, phiên vẫn giữ sàn cũ, người ghi nhầm sàn | Tag cross-layer, tải lại và đọc danh sách người của sàn mới | fixed: AC-2 gắn (cross-layer); E3 thêm tải lại và so danh sách /settings/users trước-sau với hai sàn có người khác nhau |
