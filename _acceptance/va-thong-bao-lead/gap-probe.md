---
slug: va-thong-bao-lead
at: 2026-11-02T07:35:00Z
verdict: findings
p0: 1
p1: 2
p2: 1
---

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P0 | design | Dòng sổ -5 ghi nguồn mục tiêu, nhưng câu trích (dòng tiêu đề của dải) chỉ cho thấy hàng 26 có sẵn lời cho lần bấm hỏng; nó không quyết rằng tình trạng mới «trình duyệt đã bật, máy chủ chưa lưu» dùng đúng lời ấy — chọn lời là nghĩa sản phẩm. [va-san-sang-ban#F1] | Chủ kho ký AC-7 tưởng nguồn đã chốt lời; đầu chủ thấy trình duyệt đã cho phép mà dải báo «Chưa bật được thông báo», bấm lại lỗi máy chủ vẫn còn, dải đứng y nguyên. | Một dòng Hỏi mới (supersedes -5) ở Cổng 1, khuyến nghị kèm lối còn sống và giá; AC-7 ghi theo câu trả lời. | human-gate1: dòng sổ Hỏi-1 (chi-nguoi, supersedes d-20261102T072922Z-5); AC-7 ghi lời theo Hỏi-1, khuyến nghị dùng lại lời sẵn có. |
| P1 | evals | «Không gửi trùng» (AC-5) chỉ đo bằng hằng và hàm thuần; không bài nào chứng hạn chót thật sự được truyền ở nhịp chia và lối giao; E6 một đăng ký không phân biệt có hạn 8 giây hay không; AC-5 đi qua cơ sở dữ liệu mà không có tag cross-layer. | Quên truyền hạn ở nhịp chia: 12 dòng × 5 giây = 60 giây, giữ chỗ hết khi đang gửi, gửi trùng; hay lối giao không hạn, ba thiết bị làm telesales chờ 15 giây — E1–E13 vẫn xanh. | AC-5 cross-layer; ca Postgres nhịp chia với thời hạn rút ngắn qua tham số + ca mặc định đọc đúng hằng; E6 ba đăng ký, dưới 8 giây, chỉ một dòng thử; đối chứng đỏ bỏ hạn chót. | fixed: AC-5 (cross-layer) thêm vế nhịp chia dừng ở hạn chót; E14 mới (runLeadTick, thời hạn qua tham số, ca mặc định, đối chứng đỏ); AC-6 và E6 đổi thành ba thiết bị, dưới 8 000 ms, đúng một dòng thử, đối chứng đỏ. |
| P1 | contract | Thiết kế hứa đăng xuất vẫn chạy khi thân mang địa chỉ lạ và gỡ đăng ký dùng khuôn mới, nhưng không AC hay eval nào đo; bộ hàng 26 không có ca đăng xuất. | Khuôn chặt áp vào đăng xuất trả 400, đầu chủ trên máy dùng chung không thoát được phiên. | Một AC cross-layer + ca Postgres: đăng xuất với địa chỉ lạ vẫn hết phiên, không gỡ gì; với địa chỉ fcm gỡ đúng một dòng. | fixed: AC-8 mới (cross-layer) và E15 (Postgres, hai chiều trong một ca); bộ kiểm hàng 26 thành AC-9. |
| P2 | evals | «Lưu hỏng» gồm lỗi mạng và mọi mã không 2xx, nhưng E7 chỉ đo phanLoai với daLuu truyền sẵn, E8 chỉ ca 400; bước đổi kết quả lưu thật thành daLuu false không được đo. | Hàm lưu ném khi mất mạng, trạng thái không ra loi-luu, dải ẩn hay về «chưa bật» — đúng lỗ Ngoài-5 ở mạng chập chờn. | Ma trận lưu với fetch giả: từ chối, 500, 401, 201; đối chứng đỏ hàm lưu không bắt lỗi. | fixed: E7 thêm ma trận luu(đăng ký, fetch giả) — từ chối, 500, 401, 400 → false; 201, 200 → true; đối chứng đỏ; AC-7 nói rõ mất mạng, máy chủ lỗi, hết phiên. |
