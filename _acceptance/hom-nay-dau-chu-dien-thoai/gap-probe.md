---
slug: hom-nay-dau-chu-dien-thoai
at: 2026-11-05T09:10:00Z
verdict: findings
p0: 2
p1: 3
p2: 0
---

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P0 | design | Dòng sổ «ngăn mở ngay khi chạm Gọi» ghi nguồn một-lối trong khi lối mở khi trang hiện lại vẫn sống, hai lối có giá khác nhau với người dùng | Chủ kho ký mà tưởng không còn lựa chọn; đầu chủ huỷ cuộc gọi vẫn bị ngăn che | Viết lại dòng sổ thành câu chỉ-người kèm khuyến nghị và lối khác | human-gate1: dòng mới d-20261105T083059Z-11 (Hỏi-1) thay dòng d-20261105T082851Z-5; AC-5 ghi «Hỏi-1, viết theo khuyến nghị» |
| P0 | design | Luật 32 không quyết «mỗi chạm một lần mở số»; máy tính mở số một lần rồi dùng lại | Gọi lại ba lần một ngày ghi ba vết mở số trên điện thoại, một trên máy tính; số đo theo thiết bị lệch | Tách dòng sổ, căn cứ đúng, sửa AC-4 và E4 | fixed: dòng d-20261105T083059Z-12 giữ Luật 32 cho «căn người khác không có Gọi»; dòng d-20261105T083059Z-13 trích hom-nay-dau-chu.tsx dòng 174 — mỗi dòng mở số một lần trong phiên trang; AC-4, E4, design §2 sửa theo |
| P1 | evals | E8 nạp hai việc và cho qua khi ít hơn 7 thẻ — AC-2 đạt oan | Thẻ cao gấp đôi mà E8 vẫn xanh | Nạp ≥10 việc, đếm thẻ nằm trọn trong khung nhìn ≥7, bỏ nhánh «ít hơn 7» | fixed: AC-2 ghi «khi có từ mười việc»; E8 nạp ≥10 việc và đếm thẻ nằm trọn ≥7 |
| P1 | evals | Không bài nào đo ngăn còn mở khi trang ẩn rồi hiện hay tải lại; 48 px chỉ xem lớp chữ | App bị dừng ở nền, quay lại thì ngăn mất mà E5, E8 vẫn xanh | E8 phát ẩn/hiện và tải lại, đo cao thật; E5 kiểm hàm nhớ ngăn | fixed: AC-5 thêm «kể cả khi trang đã ẩn rồi hiện lại hay tải lại»; E5 kiểm hàm nhớ ngăn qua dựng lại; E8 thêm e8-quay-lai và đo cao thật |
| P1 | evals | Lối mở số chủ của căn chỉ đo với lời gọi bơm, không chạy thật | Lối thật trả khuôn khác hay từ chối người giữ, «Gọi» ở căn hỏng mà E4 xanh | Thêm cảnh e8-goi-can và đối chứng căn người khác giữ | fixed: E8 thêm e8-goi-can (số chủ mẫu, số lần mở số chủ tăng đúng 1) và đối chứng căn do dau-chu-2 giữ |
