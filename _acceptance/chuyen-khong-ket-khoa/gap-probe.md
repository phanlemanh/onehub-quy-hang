---
slug: chuyen-khong-ket-khoa
at: 2026-11-01T15:20:00Z
verdict: findings
p0: 1
p1: 2
p2: 2
---

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P0 | design | Câu trích 016 chỉ liên quan, không quyết cách sửa | Cổng duyệt tưởng văn bản gốc đã chốt | Ghi lại nguồn đúng | fixed: dòng sổ mới supersedes, nguồn một-lối — khoá tư vấn phải sửa thước của hồ sơ đã ký, chạy tuần tự trong tệp không chặn tệp khác |
| P1 | evals | Đối chứng dương không chứng bài chuyển chạy thật | Bài chuyển bị chọn làm nạn nhân, dữ liệu quay lui, ca vẫn xanh | Assert lỗi bài chuyển riêng, liên hệ mã mới | fixed: hai assert lỗi riêng có thông điệp; liên hệ sau chuyển là mã mới |
| P1 | evals | Phép đo không tất định | Chiều đỏ chỉ đỏ theo nhịp máy | Chờ pg_locks thấy bài chuyển đứng đợi; chạy đỏ N lần | fixed: ca chờ khoá chưa cấp trên listing_owners; phá thử 10/10 đỏ |
| P2 | evals | Vế diff không đổi assert không nằm trong lệnh chấm | Nới phép so cũ mà E2 vẫn xanh | So diff dòng assert | fixed: thu AC-2 về «có mặt và xanh»; diff đi qua lượt soát của S4 |
| P2 | contract | Không chạy cùng hai bài gỡ ràng buộc thật | Bài thật khoá thứ tự khác vẫn kẹt | Eval song song N lần, hoặc ghi rủi ro | fixed: ghi rủi ro có tên ở Notes của hợp đồng |

## Làm lại phạm vi (02/11, sau veto)

Phản biện lại AC-1, E1 mới: P0 0 · P1 2 · P2 3.

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P1 | evals | Một lần chụp không đo thứ tự khoá | Đảo hai lệnh khoá mà ca vẫn xanh | Chụp sau từng lệnh khoá, phá thử đảo khoá | fixed: chụp ba lần; phá thử đảo khoá đỏ |
| P1 | evals | «Không khoá độc quyền» chỉ đo bằng tìm chữ | Khoá không ghi chế độ lọt | Đếm khoá mạnh của chính kết nối lúc chạy | fixed: đếm khoá loại bảng mode mạnh = 0; phá thử khoá không ghi chế độ đỏ |
| P2 | evals | Không ghi điều kiện lọc pg_locks | Đỏ oan hay lọc vô nghĩa | Ghi rõ lọc | fixed: locktype relation, granted, ba bảng gồm contacts |
| P2 | evals | Vế chạy trọn thiếu đối chứng dương | Xanh vô nghĩa khi không gỡ liên kết | Đếm trước khi chuyển | fixed: lead chưa gắn liên hệ > 0 trước khi chuyển |
| P2 | contract | Notes còn sáu dòng giới hạn của ca cũ | Người duyệt ký sai phạm vi | Gỡ, nói rõ Ngoài-3 đóng | fixed: gỡ sáu dòng máy, thêm câu Ngoài-3 đóng |
