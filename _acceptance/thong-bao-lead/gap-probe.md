---
slug: thong-bao-lead
at: 2026-11-02T04:00:00Z
verdict: findings
p0: 2
p1: 3
p2: 0
---

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P0 | design | Gửi ngay sau khi ghi ghi là một-lối, bỏ sót hộp thư đi có gửi lại | Lỗi tạm làm mất tiếng chuông, lead quá hạn nhận | Nêu hai lối, chọn có căn cứ | fixed: dòng sổ mới chọn hộp thư đi, căn cứ kiến trúc «Hạn nhận lead 15 phút»; AC-3 và E3 thêm ca gửi lại |
| P0 | design + contract | Chỗ đặt dải bật máy tự chọn; trưởng nhóm không có lối bật | AC-8 không người dùng nào tới được | Đưa chỗ đặt thành câu hỏi | human-gate1: Hỏi-3 (khuyến nghị đầu khung Hôm nay cho đầu chủ và trưởng nhóm); AC-1, E7 thêm vai trưởng nhóm |
| P1 | evals | Phần nhìn của AC-1 thiếu trạng thái, đăng xuất chưa gỡ | Dải sai trạng thái, máy dùng chung nhận lead người cũ | Ma trận ảnh, ca đăng xuất | fixed: E7 ma trận hai vai × năm trạng thái; E1 thêm ca đăng xuất |
| P1 | evals | AC-6 chỉ đo hàm thuần; service worker chỉ kiểm chữ | Chạm thông báo rơi về đầu trang | ui-check mở /today?lead, bài đo bấm thông báo | fixed: E10 ui-check; E6 thêm bộ xử lý bấm thông báo tách mô-đun |
| P1 | contract | Thiếu Đường đo cho ngưỡng của opportunity.md | Phiên nghiệm thu không kết luận được | Mục Đường đo | fixed: mục Đường đo (mốc giao, gửi, gọi đầu); ngưỡng số do chủ kho điền trước phiên thử |
