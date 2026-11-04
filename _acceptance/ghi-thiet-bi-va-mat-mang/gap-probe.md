---
slug: ghi-thiet-bi-va-mat-mang
at: 2026-11-03T14:40:00Z
verdict: findings
p0: 1
p1: 2
p2: 2
---

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P0 | design | Dòng sổ thiết bị theo mốc 768 ghi máy quyết, câu trích Tham chiếu chỉ liên quan, không quyết nghĩa «điện thoại»; lối loại máy thật vẫn sống | Điện thoại xoay ngang ở công trường (844px) bị ghi là máy tính, số đo mất mạng điện thoại bỏ sót, chủ kho quyết ngoại tuyến trên số lệch | Dòng Hỏi chỉ-người nêu hai lối; ca bề rộng 844 có ghim | human-gate1: Hỏi-2 (dòng sổ mới supersedes d-20261103T142400Z-1), khuyến nghị cạnh ngắn màn hình; AC-5 và E5 thêm ca 844×390 |
| P1 | design | Dấu «làm lúc mất mạng» chỉ gắn khi lần thử gần nhất đã mất mạng; thao tác đầu sau khi rớt mạng không mang dấu | Điện thoại vừa rớt mạng, sửa giá: sự kiện về với made_offline false, lượt queuedOps 0, E6 và E10 vẫn xanh | Luật gắn dấu khi lần gửi đầu gặp mất mạng; ca không dựng sẵn lượt lỗi | fixed: thiết kế thêm vế (b), AC-6 thêm vế máy vừa rớt mạng, E6 thêm ca «máy vừa rớt mạng» với chiều đỏ ghim |
| P1 | contract | Ngưỡng 95%/80%/mất dấu không có đường đo chạy được; không tách thao tác người với sự kiện máy | Sau 3 ngày chủ kho không đọc được tỉ lệ; ngưỡng mất dấu không bao giờ bật | Đường đo ghi cách đọc tỉ lệ; AC-8 nói rõ thao tác; ngưỡng mất dấu đo được hoặc khai không đo được | fixed: AC-8 thêm tong và khong-ro (mọi sự kiện của hàng do người làm), Đường đo ghi công thức và cách chạy tay; ngưỡng mất dấu khai không đo trực tiếp trên sàn thử, đo ở bài thử AC-6, AC-10 |
| P2 | contract | AC-4 và E4 bỏ ca chưa gắn sàn 403 | Đường mới quên kiểm sàn, người chưa gắn sàn ghi được dòng | Ca 403 đếm dòng 0 | fixed: AC-4 và E4 thêm ca 403 |
| P2 | evals | E7 queuedOps không ghim số viết trước | Đếm cả hàng đợi hay luôn 1 mà bài vẫn xanh | Ghim 2 thao tác trong lượt + 1 có từ trước ra 2, lượt rỗng ra 0 | fixed: E7 ghim đầu vào và giá trị, chiều đỏ nêu 3 |
