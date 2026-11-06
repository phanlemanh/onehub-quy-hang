---
slug: luat-chia-lead-cap-han-hong
at: 2026-11-06T00:14:00Z
verdict: findings
p0: 2
p1: 2
p2: 1
---

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P0 | design | Dòng sổ d-20261106T001106Z-3 (nửa ghi thêm lấy giá trị đang áp, đè giá trị đã lưu) do máy quyết, nhưng câu trích hàng 82 chỉ quyết cách CHẠY khi cặp hỏng, không quyết cách GHI; lối «từ chối, bắt lưu cả hai» vẫn sống — lựa chọn chỉ người có. [go-ma-lo#F2] [bang-quyen-theo-vai#F1] | Chủ kho ký vì tưởng hàng 82 đã chốt cả cách ghi; sàn có hạn nhận 60 cố ý mất giá trị 60 mà không ai được hỏi. | Đổi thành Hỏi ở Cổng Phạm vi; dòng sổ mới supersedes d-3, nguồn người. | human-gate1: dòng d-20261106T001347Z-8 (Hỏi-1) supersedes d-3; nháp theo khuyến nghị «đè bằng giá trị đang áp» |
| P0 | evals | Hợp đồng có surfaces ui mà không eval ui-check; lối bỏ ui-observed (d-7) và bỏ design-pass (d-5) ghi một-lối nhưng lối không chết: AC-1 nhìn được trên màn thật, ca 200 còn lỗi dựng được bằng chặn mạng. [cach-goi-rieng#F1] [va-link-gui-can#F1] | Màn vẫn hiện «Đã lưu» khi dòng hạn nhận còn hiện giá trị cũ mà không frame nào bắt. | Thêm ui-check ba khung. | fixed: thêm E7 (ui-check, ba khung cap-ok, cap-400, cap-con-loi); d-9 supersedes d-7; d-20261106T001356Z-11 supersedes d-5 (bỏ design-pass vì không có bố cục mới, ảnh E7 thay khung nhìn) |
| P1 | evals | AC-5 hứa hành vi màn nhưng E5 chỉ đo hàm thuần ketQuaLuu; không eval nào chứng màn gọi nó thay toast vô điều kiện. | ketQuaLuu đúng mà bộ xử lý lưu vẫn toast «Đã lưu»: E5 xanh, AC-5 hỏng. | Dựng màn với phản hồi lưu giả. | fixed: E7 khung 3 (CDP Fetch trả 200 có errors) và khung 2 (400) đo trên màn thật, đối chứng khung 1 có toast |
| P1 | contract | Coverage thiếu ô hạn gọi hỏng × sửa hạn nhận × trái luật. | Bản cài kiểm hạn nhận so với giá trị lưu hỏng (10) thay vì đang áp (30): 400 oan, hoặc 400 ghi dở. | Thêm AC và eval cho ô thiếu. | fixed: thêm AC-6 và E3b (40 → 400 không ghi; 20 → 200, 20/30) |
| P2 | contract | AC-3, AC-4 đi qua backend mà thiếu tag cross-layer; E5, E6 thiếu layer. | Định tuyến S4 xếp lớp lệch. | Gắn tag hoặc ghi lý do một lớp. | rejected: AC-3, AC-4 chỉ có một lớp — lời hứa nằm trọn ở lối API (không qua màn), đo bằng API thật; layer của E5, E6 để trống theo nếp hàng 48 |
