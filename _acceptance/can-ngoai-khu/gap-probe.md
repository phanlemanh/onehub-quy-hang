---
slug: can-ngoai-khu
at: 2026-11-07T11:40:00Z
verdict: findings
p0: 1
p1: 4
p2: 0
---

# Phản biện context sạch — can-ngoai-khu

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
| --- | --- | --- | --- | --- | --- |
| P0 | design | Sổ ghi máy quyết lối tạo căn riêng (nguồn một-lối) trong khi lối gộp vào lệnh tạo hàng vẫn sống | Cổng Phạm vi duyệt hình dạng API như thể không còn lựa chọn | Đổi thành câu hỏi chủ kho, hoặc nêu căn cứ bác lối gộp | human-gate1: thành Hỏi-4 (khuyến nghị lối riêng), sổ dòng mới supersedes dòng cũ; design §Hỏi chủ kho |
| P1 | contract | Không ca ở tầng dữ liệu cho khoá ngoại hàng → căn khác sàn; khoá ngoại đơn không qua luật theo dòng | Lối ghi khác (nhập file, gấp lại) ghi hàng sàn A trỏ căn sàn B | Ca cách ly insert listings trỏ căn sàn B → lỗi khoá ngoại | fixed: design chốt khoá ngoại ghép (company_id, id); AC-7 và E7 thêm ca «listings trỏ căn sàn khác» có đối chứng dương |
| P1 | evals | E6 nhận «4xx» chung, không so với mã không tồn tại | 403 cho mã của B, 404 cho mã ngẫu nhiên — sàn dò được căn sàn khác | So phản hồi mã của B với uuid ngẫu nhiên | fixed: E6 assert cùng status và deepEqual thân lỗi cho đọc căn và tạo hàng; design ghi luật «cùng một phản hồi» |
| P1 | design | Không nói hàng lô có đối chiếu danh mục không, trong khi AC-8 nói «lô Townhouse theo danh mục mẫu» | E8 xanh nhờ fixture tay, hoặc đỏ vì cơ sở dữ liệu không có lô | Chốt nguồn kiểm lô hoặc ghi Out of scope | fixed: không đối chiếu ở vòng này (như toà hôm nay) — design, Out of scope, sổ descope; AC-8 bỏ chữ «Townhouse theo danh mục», E8 rút lô từ danh mục mẫu của lõi |
| P1 | contract | Không AC đo quyền Bảng hàng với bảng căn ngoài khu | Người cùng sàn không có Bảng hàng tạo, đọc được địa chỉ căn | Ca API 403 + ca cách ly works_listings false | fixed: AC-6 thêm vế «cùng sàn không Bảng hàng», E6 ca «AC-6 không Bảng hàng» có đối chứng dương, E7 ca phiên không Bảng hàng đọc 0 dòng; trục D thêm giá trị |
