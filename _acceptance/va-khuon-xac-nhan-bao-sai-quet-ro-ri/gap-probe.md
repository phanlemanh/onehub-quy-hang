---
slug: va-khuon-xac-nhan-bao-sai-quet-ro-ri
at: 2026-11-08T17:00:00Z
verdict: findings
p0: 2
p1: 3
p2: 0
---

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P0 | design | Luật khoá máy cấp ghi máy quyết «một lối», kho_dao false; lối ghim đúng dạng khoá còn sống, luật thuộc khuôn Invest ghim, phần dư chạm bất biến 2 | bld_0900000071 qua khuôn mà mọi eval xanh; người ký không biết phần dư | Dòng sổ chỉ-người kho_dao true, ca eval ghim hành vi | human-gate1: thành Hỏi-1; đoạn tách cả theo `_` nên bld_0900000071 bị chặn; E7 ghim cả phần dư x0900000071; Notes ghi phần dư |
| P0 | contract | Không siết khuôn chiều vào ghi mục-tiêu nhưng câu trích không quyết; hậu quả căn UPI lạ bị kẹt không ghi | Sàn gặp căn UPI lạ không báo sai được, chỉ Invest sửa; cổng không biết | Thành Hỏi kho_dao true, Notes ghi điều sàn thấy | human-gate1: thành Hỏi-2; Notes và thiết kế §1 ghi hậu quả |
| P1 | evals | E6 có thể xanh nhờ lỗi tra danh mục; correctValue chỉ một field; E2 thiếu giá trị mới bị từ chối | Hàm dựng ok mà khuôn từ chối vẫn xanh | Cấy mồi vào danh mục, ghim thông điệp dạng, mở correctValue, thêm vào E2 | fixed: E6 chín trường × tám mồi (72), mồi khoá cấy vào danh mục, thông điệp «dạng», đối chứng dương, chiều đỏ; E2 thêm UPI đoạn số, bld_0900000071, mã căn có dấu |
| P1 | evals | E3 danh sách mồi không ghim; đường đầu vào không có ca trên mã thật; cấy 2 không khớp hàm quét | Mồi undefined thì xanh; cấy không đỏ được | Ghim danh sách, đếm, một hàm quét hai đường, cấy theo từng hàm | fixed: E3 danh sách ghim trước, đếm khớp, một hàm quetRoRi hai đường; E4 bảy phép cấy (ba hàm × hai đường + một) |
| P1 | evals | Ma trận thiếu `_`, `/`, khoảng trắng; không có ca biên 9 chữ số | Regex chỉ nhận `.` `-` vẫn xanh | Thêm mồi, thêm ca biên | fixed: ma trận tám mồi ở E5, E6; ca biên 8 số qua, 9 số chặn |
