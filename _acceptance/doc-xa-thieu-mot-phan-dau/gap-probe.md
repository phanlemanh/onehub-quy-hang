---
slug: doc-xa-thieu-mot-phan-dau
at: 2026-11-06T15:12:00Z
verdict: findings
p0: 2
p1: 1
p2: 1
claims_input: ok
---

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P0 | contract AC-3, evals E3, design | Luật tương thích có chiều; E3 đòi mọi 74 cặp có thứ tự không khớp, sổ không quyết chiều ngược | «Phường Tân Dĩnh, TP.HCM» tương thích Tân Định và ra Tân Định — nửa số dòng E3 đỏ dù bộ đọc đúng thiết kế | Chia cặp thành nhóm trái và nhóm thiếu theo luật viết trước, in hai số cộng bằng 74; nhóm thiếu có kỳ vọng tường minh | fixed: AC-3/E3 chia nhóm trái (44, không ra B) và thiếu (30, ra B chuan); thiết kế mục «Chiều của luật»; sổ d-20261106T150614Z-6 quyết chiều theo câu giao (căn cứ bat_khi của hàng, kho_dao false vì khoá chưa lưu — hàng 76 chưa làm); không đẩy lên người vì câu giao đã quyết |
| P0 | design, contract AC-4 AC-7, evals E4 E7 | Không có luật tên trùng nguyên văn thắng | Gõ đúng «Văn Lang» ra cần người chọn với Văn Lăng; E4 đối chứng và E7 deepEqual đỏ | Luật nguyên văn thắng; đối chứng cho cả hai xã mỗi cặp; phá thử tắt luật | fixed: thiết kế thêm luật nguyên văn thắng sau lọc tỉnh, công tắc phá thử tuong-thich-tron; AC-4/E4 đối chứng 2 × |Q|, nhánh dạng chung trùng một tên ra tên ấy; sổ d-20261106T150614Z-5 |
| P1 | contract AC-1 AC-6, evals E1 E6 | Luật ma trận không loại xã có anh em cùng tỉnh cùng dạng bỏ dấu | Xã mã nhỏ nhất có anh em tương thích → cần người chọn, E1/E6 đỏ | Loại xã có xã khác cùng tỉnh cùng dangSo trước khi lấy mã nhỏ nhất, in xã bị loại | fixed: AC-1, AC-2, E1, E2, E6 thêm điều kiện loại viết trước, số dòng in ra thay hằng 34 |
| P2 | evals E7 | Phá thử E7 chạy trên ma trận khác lời hứa | So sai trường vẫn xanh còn phá thử đỏ ở ma trận khác | Phá thử cùng hàm so, cùng ma trận, vế mới cấy lệch | fixed: E7 phá thử dùng bộ đọc cấy lệch trên đúng ma trận 4 × AC-1 |
