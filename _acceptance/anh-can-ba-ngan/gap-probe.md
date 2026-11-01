---
slug: anh-can-ba-ngan
at: 2026-11-01T08:30:00Z
verdict: findings
p0: 2
p1: 2
p2: 1
claims_input: ok
---

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P0 | design | Dòng sổ «không giữ ảnh trên máy để gửi sau, ở cả hai ngăn» ghi máy quyết theo câu «Mang theo ít», nhưng câu ấy không quyết hàng chờ ghi cho ngăn Gửi được — đánh đổi của chủ kho [va-sua-tren-o#F1] [sua-hang-loat#F2] | Đầu chủ mạng chập chờn thả 10 ảnh, cả lượt bị từ chối; chủ kho ký mà tưởng đã chốt | Đổi thành câu Hỏi trong sổ, khuyến nghị giữ nguyên | human-gate1: thành Hỏi-5 (dòng mới supersedes dòng cũ), AC-2 ghi Hỏi-5 |
| P0 | design | Xoá chỉ đặt removed_at, byte giấy tờ chủ nhà nằm lại mãi — lựa chọn giữ dữ liệu cá nhân không có trong sổ | Thả nhầm giấy tờ rồi xoá, byte vẫn còn; E4 chỉ đo 404 nên vẫn xanh | Câu Hỏi xoá mềm hay hẳn; E4 đếm dòng byte của ảnh đã xoá, có chiều đỏ | human-gate1: thành Hỏi-6 (khuyến nghị xoá hẳn byte, kho_dao true); AC-4 và E4 viết theo khuyến nghị kèm chiều đỏ |
| P1 | contract | Không rõ trưởng nhóm của nhóm nào; bảng ca 6 người thiếu trưởng nhóm thứ hai và căn chưa có lần rao | Luật lõi và SQL cùng sai giống nhau, E5 vẫn xanh | Thêm hai hàng, 8 người × 5 ô = 40 ô có chiều đỏ | fixed: AC-5 nêu trưởng nhóm cả sàn như hàng 11 (dòng sổ muc-tieu trỏ migration 006) và căn chưa có lần rao; E5 40 ô + chiều đỏ trưởng nhóm thứ hai |
| P1 | evals | AC-6 chỉ đo bằng quét dòng import; không ca nào soi kho thật của trình duyệt | Service worker hay lớp đệm chung lưu byte ảnh sổ vào Cache Storage, E6 vẫn xanh | E10 dò indexedDB và caches sau khi xem ảnh nội bộ, có đối chứng dương | fixed: E10 bước 5b dò indexedDB.databases() và caches, 0 mục nội bộ, đối chứng id ảnh Gửi được |
| P2 | contract | Nút «Chọn ảnh», dán ⌘V và xem bản lớn khai trong Coverage mà không bước ui-check nào đi qua | Nút không mở hộp chọn tệp, mọi eval vẫn xanh | Thêm bước vào E10 | fixed: E10 bước 5 (bản lớn), 5c (Chọn ảnh), 5d (dán ⌘V) có ảnh chụp |
