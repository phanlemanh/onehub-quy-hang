---
slug: va-ho-so-lan-rao-hang-lo-ngoai-khu
at: 2026-11-08T16:40:00Z
verdict: findings
p0: 1
p1: 3
p2: 1
---

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P0 | design | Dòng sổ ghi một lối nhưng chỉ nêu giá của lối khác [va-xem-them-noi-lap-dong#F1] | Cổng đọc như không còn lối nào | Nêu lối khác kèm giá, bỏ nguồn một lối | fixed: dòng sổ mới nguồn mục tiêu trích luật hồ sơ theo hàng ở ho-so.ts, thiết kế nêu lối khác kèm giá |
| P1 | contract | Ngoài khu phụ thuộc hàng vá lỗi đọc căn ngoài khu | Link đúng mà hồ sơ vẫn báo không thấy căn | Ghi phụ thuộc | rejected: hàng vá kia chỉ chạm lần đầu mất mạng; hồ sơ ngoài khu đã mở được trên màn ở E8 hàng 79 |
| P1 | design, evals | Mã hàng và mã lần rao lẫn nhau; không ca hai lần rao | Rao lại mở nhầm lần rao | Thống nhất mã | fixed: thiết kế nói rõ mỗi lần rao là một hàng riêng, link mang mã hàng; ca hai lần rao không tồn tại trong hồ sơ theo hàng |
| P1 | evals | Đường đóng viết tay; bảng thẻ không đo trên màn | Đường thật khác khuôn | Lấy từ hàm dựng của màn | fixed: E1 dựng đường đóng bằng dongCot của màn. Bảng thẻ trên màn: deferred — cùng hàm mô hình, E1 phủ hai dạng đường |
| P2 | evals | E3 so tiêu đề; timebox rỗng | Link nhầm hàng cùng khu vẫn xanh | So mã hàng trong url | fixed: E3 so mã hàng trong url và mục Thuộc tính căn còn trên màn. Timebox: deferred, chủ kho đặt ở Cổng Đáng |
