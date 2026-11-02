---
slug: va-he-bo-cuc
at: 2026-11-02T08:36:00Z
verdict: findings
p0: 1
p1: 2
p2: 1
---

# Phản biện context sạch — va-he-bo-cuc

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P0 | design | Dòng sổ d-…-3 ghi máy quyết «báo rõ, không ẩn mục theo vai», nhưng câu giao bày hai lối «ẩn hay báo rõ» để người chọn; câu trích của mo-lead.ts chỉ nói đường lead, không quyết mục điều hướng; «vỏ không rẽ theo vai» là giá chứ không làm lối ẩn chết | Chủ kho ký AC-4 tưởng nguồn đã chốt; telesales và trưởng nhóm thấy năm mục chỉ ra dòng báo, muốn ẩn phải mở hàng khác | Dòng sổ Hỏi thay -3, nêu hai lối và giá; AC-4, E5, E7u viết theo lối người chọn | human-gate1: Hỏi-1 (d-20261102T083503Z-7 thay d-…-3, nguồn chỉ-người); fixed: AC-4, E5, E7u rẽ theo lối Hỏi-1 |
| P1 | evals | AC-3 không có eval mang tiêu chí AC-3; vế «sang nhóm có việc thì dòng báo mất» không bài nào đo; E6u không ghim nhóm nào có việc | Dữ liệu mẫu có việc ở cả năm nhóm thì không bao giờ thấy dòng báo; dòng báo đọng lại sau khi bấm sang nhóm có việc mà mọi eval xanh | Thêm ui-check cho AC-3 ghim nhóm trống, đếm dòng báo trước và sau khi sang nhóm có việc; E6u ghi tập nhóm có việc | fixed: thêm E10u (AC-3) — rút tập nhóm có việc từ lưới trần, dò nhóm trống qua hai tài khoản đầu chủ, ghi rõ khi dữ liệu không có nhóm trống (UNCERTAIN), đếm dòng báo trước/sau và khi tải lại; E6u ghi tập nhóm có việc trước khi bấm |
| P1 | contract | Trạng thái «đang tải» của bảng trạng thái không có AC hay eval; E1 không có đầu vào đang tải; E6u không có ca tải nguội | Mở thẳng /today?nhom=<mã> lúc lưới rỗng vì đang tải thì báo nhầm «không có việc», hay cuộn chạy trước khi có dòng | AC thêm vế tải nguội; E1 thêm ô đang tải kèm chiều đỏ; E6u thêm bước tải lại | fixed: AC-1 thêm vế tải nguội; E1 ma trận 5 × {đang tải, có việc, không việc} (15 ô) kèm chiều đỏ ô đang tải; E6u, E10u thêm bước tải lại; design mục 4 |
| P2 | contract | Giao điểm vai × tham số chưa có: người hai vai không eval nào đăng nhập; người không đầu chủ mở mã lạ không câu nào định nghĩa | Người hai vai nhận dòng báo «chỉ có ở Hôm nay của đầu chủ» trên lưới của mình; telesales mở mã lạ ra «Hàng đợi «undefined» …» | Ghi chữ báo cho mã lạ với người không đầu chủ; E5 thêm ô hai vai và mã lạ; ghim vai tài khoản mẫu | fixed: AC-1 ghi người hai vai xử như đầu chủ; AC-5 chữ báo mã lạ cho mọi người mở; E5 ma trận vai × mã kèm chiều đỏ ô hai vai; E7u ghim vai của hai tài khoản mẫu |
