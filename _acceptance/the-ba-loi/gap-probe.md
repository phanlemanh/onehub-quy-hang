---
slug: the-ba-loi
at: 2026-11-01T08:24:00Z
verdict: findings
p0: 1
p1: 3
p2: 1
---
## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P0 | design | Dòng sổ chọn chạy bài «ô chưa có khuôn» ở bước chấm ghi nguồn mục tiêu, nhưng câu ADR chỉ đặt lệnh vào bộ đối chiếu, không quyết độ cứng của rào — lựa chọn chỉ chủ kho có | Chủ kho tưởng «skipped → đỏ» là rào; vòng sau không chạy lệnh, CI vẫn xanh | Đưa thành câu hỏi cho chủ kho, ghi dòng sổ mới thay dòng cũ | human-gate1: Hỏi-1 (dòng sổ d-20261101T080258Z-9 thay d-20261101T080019Z-2) |
| P1 | evals | Trang ba lối là mặt người nhìn nhưng không eval nào mở nó ở 1440/375, sáng/tối; không trang mẫu | Trang tràn ngang hay chữ trùng nền mà E2–E4 vẫn xanh | ui-check trên trang mẫu dựng từ vật thử 17, bốn tổ hợp | fixed: thêm E11 ui-check (layer ui-observed) trên evidence/ba-loi-mau.html; AC-2 thêm vế đọc được; design §2.5 |
| P1 | evals | Không bài nào đi trọn từ khung `--ba-loi` ghi ra tới `--dung-ba-loi` | Khung ghi null hay {} → dựng ra mã 2 hay lỗi mờ, test vẫn xanh vì fixture viết tay | Khung chưa điền → mã 1 với ba dòng gọi tên lối; khung điền đúng khoá → mã 0 | fixed: thêm ca «ba lối: khung đi trọn tới trang» vào E1 |
| P1 | design | Răng so bản dựng lại từng byte sẽ đỏ ở hồ sơ đã ký khi mẫu trang đổi về sau | Hàng sau đổi CSS, lint đỏ ở hồ sơ đã ký mà kit cấm sửa | So bản dựng lại chỉ với hồ sơ chưa ký | fixed: AC-9 và design §2.3 chỉ so khi hồ sơ chưa ký; E9 thêm ma trận signed-off / machine-cleared |
| P2 | evals | E8 dựng bảng hai cột «trước hàng 83» từ 13 dòng hiện nay, không lấy từ git | Hàng 83 viết lại chữ ô «Chỗ» thì lịch sử thật ra «chỗ hở mới» giả | Lấy bản trước bằng git show | rejected: đã đo trên git — 13 tên «Chỗ» trước (93de6dd^1) và sau hàng 83 trùng hệt; job check của CI clone nông nên test không đọc được lịch sử; AC-8 sửa chữ cho khớp vật đo |
