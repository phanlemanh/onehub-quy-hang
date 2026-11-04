---
slug: ho-so-can-dien-thoai
at: 2026-11-03T16:12:00Z
verdict: findings
p0: 1
p1: 3
p2: 1
---

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P0 | design | Sổ ghi máy tự quyết bỏ hẳn ngăn Nội bộ với mọi người không giữ căn; luật «màn đọc cờ» không loại lối giữ thẻ khoá cho mọi người — đây là đánh đổi trải nghiệm | Chủ kho ký AC-2, AC-6 tưởng ẩn ngăn là hệ quả bắt buộc; Đầu khách mất dấu hiệu căn có giấy tờ nội bộ mà không ai chọn | Một dòng chỉ-người (Hỏi-4) thay phần ngăn Nội bộ; AC-2, AC-6 ghi theo Hỏi-4 | human-gate1: Hỏi-4 (dòng sổ chỉ-người, supersedes d-20261103T160418Z-5), AC-2, AC-6 ghi «theo Hỏi-4»; gửi giám sát yêu cầu B-6 |
| P1 | contract | Trạng thái mất mạng của nút hỏi có ở Coverage và đặc tả UX nhưng không AC, không eval | Ngoại tuyến lời gọi tên đầu chủ treo, nút kẹt mà mọi eval xanh | Thêm Then mất mạng vào AC-4 và bước chặn mạng ở E9 | fixed: AC-4 thêm vế mất mạng; E9 thêm bước chặn /api, đọc window.__chia, ảnh E9-ngoai-tuyen.png |
| P1 | evals | Assert phủ định không đối chứng dương — căn ở E8 có thể vốn không có Sẵn sàng bán; mẫu nguồn có thể rỗng | E8 và quét rò qua suông dù lớp phủ hỏng | Ghim căn có nút với người giữ; assert mẫu khác rỗng; findSourceLeaks trên thân trưởng nhóm khác rỗng | fixed: E8 bước đối chứng dau-chu-1 thấy nút ở X rồi Đầu khách mở X; E2, E3, E4, E8 assert mẫu khác rỗng và đối chứng dương |
| P1 | evals | Không eval đo nhãn nút thật trên màn khớp Hỏi-2 | Chủ kho giữ nhãn cũ, tài liệu sửa theo, hằng mã vẫn nhãn mới; E15, E9 vẫn xanh | Ghim chuỗi nút đúng nhãn Hỏi-2 ở E9 và một ca test web cho hằng nhãn | fixed: E9 ghim «<nhãn Hỏi-2> · <tên>»; E5 thêm ca «hỏi đầu chủ: nhãn» |
| P2 | evals | E2 đòi tham số toa không có trong thiết kế; Đường đo gán số từ lệch | E2 đỏ oan; người duyệt đọc thước hỏi đầu chủ do bài ảnh bảo đảm | Sửa E2 theo hứa của thiết kế; sửa Đường đo | fixed: E2 chỉ đòi unit đúng mã qua URLSearchParams; Đường đo thước 1 E1, E4, E6, E7, E8 · thước 2 E2, E3, E5, E9 |
