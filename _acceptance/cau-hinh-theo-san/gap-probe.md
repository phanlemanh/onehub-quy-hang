---
slug: cau-hinh-theo-san
at: 2026-11-04T08:15:00Z
verdict: findings
p0: 2
p1: 2
p2: 1
---

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
| --- | --- | --- | --- | --- | --- |
| P0 | design | Chọn «dừng chia lead» hay «chia theo mặc định và báo» khi gặp cặp hạn trái luật có sẵn là lựa chọn chỉ người có, sổ lại ghi máy quyết | Sàn có dòng hạn nhận 60 từ trước, nhịp chia ném lỗi, telesales không nhận lead nào trong khi GET báo 15/30 đang áp | Một dòng Hỏi do người quyết thay dòng cũ, AC-5 và E5b ghi theo Hỏi | human-gate1: thành Hỏi-1 (sổ d-20261104T081408Z-11, thay -5); AC-5, E5b, E5c, thiết kế §4 viết theo khuyến nghị (a) |
| P0 | design | Căn cứ hai dòng sổ hỏng: bỏ chép bù sự kiện khởi đầu (lối chết không chết thật) và bỏ quét độ phủ (câu trích không quyết) | Cấu hình đặt từ hàng 25 không có dòng nhật ký nào, trái Tham chiếu §4; một ô ma trận sót không ai gọi tên | Đổi dòng bỏ chép bù thành chép bù có ca kiểm; đổi căn cứ bỏ quét | fixed: 026 chép bù kèm ca kiểm (AC-6, E6 ca d, sổ -12 thay -6); căn cứ bỏ quét đổi sang một lối (sổ -13 thay -7); E1 đọc bằng vai không quản trị |
| P1 | evals | Lời hứa lối đọc của AC-5 chỉ đo ở lõi với dòng viết tay, không có ca nhịp chia thật trên Postgres và ca errors của GET | Hàm cơ sở dữ liệu đóng dấu đọc cấu hình theo lối khác, E5b xanh mà lead thật mang 60/30 | Thêm ca chèn thẳng dòng trái luật, GET báo, nhịp chia, đọc hạn trên lead, đối chứng dương | fixed: thêm E5c |
| P1 | evals | Hai lối ghi cũ chỉ đếm sự kiện, không kiểm người và vai trên sự kiện | Vai rỗng ở hai lối cũ mà E6 vẫn xanh | Mỗi sự kiện của ba lối deepEqual khoá, giá trị, người, vai | fixed: E6 ca c và AC-6 thêm «ghi khoá, giá trị, người và vai» |
| P2 | evals | Assertion âm tính không ghim tầng chặn: quyền cấp chặn trước trigger; ràng buộc lớp source ở bảng sự kiện không có ca | Quên trigger chặn sửa xoá hay quên check ở bảng sự kiện mà E6, E7 vẫn xanh | Ca bằng kết nối chủ bảng, ghim chuỗi raise của trigger và tên ràng buộc của bảng sự kiện | fixed: E6 ca b, E7 thêm ca bảng sự kiện |
