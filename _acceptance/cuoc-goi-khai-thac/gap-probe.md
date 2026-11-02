---
slug: cuoc-goi-khai-thac
at: 2026-11-02T05:14:00Z
verdict: findings
p0: 1
p1: 2
p2: 2
claims_input: ok
---
## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P0 | design | Dòng sổ d-20261102T050335Z-7 (máy quyết, trích luật 8) không quyết việc trả lời danh sách hỏi có tính là đã gọi — nghĩa sản phẩm chạm thước «lead → cuộc gọi đầu» [va-san-sang-ban#F1] [chuyen-khong-ket-khoa#F1] | Đầu chủ đi trọn bằng phím, chọn đủ 5/5, Ctrl+Enter, không bấm «Đã gọi»: lead nằm mãi ở Lead mới, first_called_at null | Hỏi-6 nguồn chỉ-người, supersedes dòng 7; AC-2 theo lựa chọn; E2 thêm bước chỉ phím rồi GET stage | fixed: thêm Hỏi-6 (khuyên câu trả lời đầu tiên ghi mốc, kèm phím G), AC-2 viết lại, E2 thêm lead L12 đi trọn bằng phím; người quyết ở Cổng Phạm vi (human-gate1) |
| P1 | contract | AC-7 ghi sự kiện giá lên máy chủ nhưng thiếu tag (cross-layer) và không eval nào đo máy chủ nhận hay từ chối [san-sang-ban#F2] | Thân sự kiện giá lệch khuôn máy chủ; trên máy vẫn 5/5 nên E7, E7b xanh, giá không lên máy chủ | AC-7 gắn (cross-layer), nói rõ khi bị từ chối; thêm E7c backend-effect | fixed: AC-7 gắn (cross-layer) và câu bị từ chối → Cần xem; thêm E7c (lead L14: 2,8 → máy chủ; 3,5 đã xác nhận; căn đã bán bị từ chối) |
| P1 | design | Nhóm «Giá và phí»: phím số chọn điều kiện phí đá với luật không bắt phím số khi con trỏ ở ô giá | Gõ «2,8 tỷ» rồi bấm 1 thành «2,8 tỷ1»; E6b, E7b vẫn xanh | Ghi phím đi từ ô giá sang điều kiện phí; thêm ca vào E6b; E7b làm hoàn toàn bằng phím | fixed: Alt+1 / Alt+2 chọn điều kiện phí trong ô giá, Esc rời ô (design §4, AC-6, AC-7); E6b 10 ca có Alt+1 ở ô giá; E7b chỉ bằng phím |
| P2 | evals | Sáu bài ui-check dùng chung lead L1, có bài đổi dữ liệu; E4b đếm sự kiện «nếu có hồ sơ» không đối chứng dương | Chạy E7b trước E9 làm E9 đỏ giả; máy tính lỡ ghi giá mà E4b vẫn xanh | Lead riêng cho bài làm biến dữ liệu; E4b trên L5/H5 kèm đối chứng dương | fixed: E2 → L11/L12, E7b → L13, E7c → L14, E9 → L15; E1b, E5b, E10b chỉ đọc L1; E4b chạy trên L5/H5, n1 = n0 + 1 rồi n2 = n1 |
| P2 | contract | E1 thiếu lead đã bỏ; E10 thiếu quản trị sàn; Context nói «còn trong nhóm» trái AC-1 | Lead đã bỏ vẫn ra 200 mà E1 xanh; người chấm hiểu L2 là «không còn» | E1 thêm ca đã bỏ (6 ca); E10 thêm quản trị → 403; sửa Context | fixed: cả ba |
