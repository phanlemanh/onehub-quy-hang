---
slug: va-dinh-nghia-doc-lai
at: 2026-11-09T03:05:00Z
verdict: findings
p0: 2
p1: 3
p2: 0
---

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P0 | design | Sổ ghi máy quyết «lúc giá chờ gửi thì dòng biến mất» với câu trích nói về lần đọc hỏng; hiện gì lúc chờ là nghĩa người dùng thấy | Chủ kho duyệt mà không biết đây là một lựa chọn; đầu chủ mất mạng thấy dòng biến mất không lời giải thích | Dòng sổ mới, thành một Hỏi ở Cổng Phạm vi | human-gate1: dòng sổ mới thành Hỏi-1 kèm khuyến nghị và lối khác; Out of scope ghi theo Hỏi-1 |
| P0 | design | Hai căn cứ không đứng: lối khoá theo phiên bản có giữ dòng chưa chết; câu trích không quyết nhịp thử lại | Người ký tin máy chỉ có một lối; chớp mạng làm dòng vắng tới lượt kéo kế | Hai dòng sổ mới mang supersedes | fixed: dòng -3 nêu ràng buộc giết từng lối, gồm khoá phiên bản có giữ dòng; dòng -4 dẫn mang.ts, nêu trễ xấu nhất 30 giây và lối nghe sự kiện mạng đã có sẵn ở bộ đồng bộ |
| P1 | evals | Phần bỏ lần đọc đang giữ nằm trong thành phần, không eval nào chạy nó; thiếu trạng thái đang đọc dở; E4 lỏng số lần đọc và thời gian | Quên bỏ lần đọc thì đổi đi đổi về đứng ở dấu cũ mà E2 vẫn xanh; phản hồi muộn được nhận | Bài chạy đúng thứ tự với lời đọc điều khiển được; E4 đúng một lần và có hạn giây | fixed: thứ tự chuyển vào bộ đọc không dính React, E2 chạy bộ đọc thật với lời đọc điều khiển được (đổi đi đổi về, phản hồi muộn, đúng một lần); E4 đúng 1 lần đọc trong hạn 8 giây |
| P1 | contract | AC-3, AC-5 đi qua máy chủ mà thiếu cross-layer; không eval đo phản hồi thật vào nhánh nào; E7 chỉ máy chủ giả | 5xx bị gộp thành null thì dòng vắng tới khi tải lại mà E5 vẫn xanh; đọc theo giá vừa bị từ chối | Tag cross-layer, eval trên API thật | fixed: tag cross-layer AC-3, AC-5; E3b chạy lớp đọc thật qua API (200 dấu, 200 null, 404) và công tắc mất mạng, 500; E7b từ chối thật qua API, ghi từng bước, khoá đọc không bao giờ mang giá bị từ chối |
| P1 | evals | E6 chỉ một đại diện, không ma trận theo tập sự kiện | Loại thao tác khác mang giá lọt | E6 lặp trên EVENT_TYPES của lõi | fixed: E6 lặp EVENT_TYPES lấy từ lõi với bảng viết trước kiểu Record theo loại sự kiện. Ca căn chưa lên máy chủ rejected: apTrenMay từ chối sửa căn chưa có trên bản kéo, created không vào hàng đợi |
