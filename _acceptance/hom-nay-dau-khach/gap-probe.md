---
slug: hom-nay-dau-khach
at: 2026-11-04T14:20:00Z
verdict: findings
p0: 1
p1: 3
p2: 1
---

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P0 | contract | Dòng sổ cắt «lịch xem» ghi máy quyết theo mục tiêu nhưng câu trích Tham chiếu lại liệt lịch xem trong màn P0; câu quyết thật là dòng Cổng Đáng «mục lịch xem chờ điều kiện» (cùng kiểu [trang-khach-rieng#F1]) | Cổng Phạm vi duyệt Out of scope «Lịch xem» trên một căn cứ nói ngược | Thay dòng sổ bằng dòng trích đúng câu quyết việc cắt | fixed: dòng sổ mới supersedes dòng cũ, trích opportunity.md «Vì sao: Màn P0 (M6, phác 29/10); mục lịch xem chờ điều kiện»; phần cắt vẫn hiện ở Out of scope để người ký |
| P1 | contract | Lớp màn của AC-1 (vùng theo vai) không eval nào đo; E6b phụ thuộc phần nối chờ hàng 92 | Phần nối vungTheoVai sai mà mọi eval vẫn xanh vì E1 chỉ nhìn API | Eval web cho vungTheoVai với bảng tập vai → vùng | fixed: thêm E1b (bảng năm dòng, chiều đỏ); Notes ghi E6b chạy sau khi phần nối có |
| P1 | contract | AC-4 không ghim ba ca rìa: căn khớp hai bộ, căn trong bộ không có giá lúc gửi, căn trở lại Đang bán sau Pending | Thợ chọn cách nào cũng qua; tin lặp hay mất người nhận | Ghim ba ca vào AC-4 và bảng viết trước của E4 | fixed: AC-4 và E4 thêm ba dòng; Hỏi-2 ghi lại (supersedes) kèm ba ca để người duyệt |
| P1 | contract | Đường đo đếm «sau lần mở Hôm nay» mà không AC nào ghi lần mở hay nguồn Lần gửi (cùng kiểu [nhap-nho-mau#F2]) | Hết hai tuần thử không tính được số đo cho đường rút ngắn | Ghi nguồn Lần gửi, hoặc nêu rõ dữ liệu đã có đủ đo | fixed: Đường đo đổi sang khoảng «lên Đang bán → Lần gửi đầu tiên có căn ấy của cùng đầu khách», đo bằng dữ liệu đã có; tách nguồn cần migration nên để vòng sau. deferred: ngưỡng số và hạn thử chủ kho đặt trước hai tuần thử |
| P2 | evals | AC-7 không có phép đo nối bộ tải với ngăn chi tiết thật trên màn | Ngăn vẫn trống khi mở id đã xoá dù E7 xanh | Thêm bước ui-check mở /shares?lan= với id không có | fixed: E6b thêm bước 5 chụp ngăn chi tiết báo lỗi kèm «Thử lại» |
