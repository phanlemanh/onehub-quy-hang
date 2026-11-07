---
slug: truong-rieng-toi-thieu
at: 2026-11-06T07:15:00Z
verdict: findings
p0: 0
p1: 3
p2: 2
---
## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P1 | evals | AC-7 hứa không ai ngoài người giữ và trưởng nhóm đọc được custom của liên hệ chủ nhà, nhưng E7 chỉ đo select thẳng trên bảng contacts và E6 chỉ đo người giữ — các đường đọc liên hệ khác (danh sách, tra số, hồ sơ căn, đổi đầu chủ hàng loạt, đồng bộ, hàm security definer) chưa đo | Một hàm hay bộ dựng thân chép nguyên dòng contacts kể cả custom, giá trị lớp nguồn tới telesales hay quản trị; E7 vẫn xanh | Ca backend-effect mọi đường × mọi người với mồi, đếm đường bằng grep, kèm quét hàm security definer không select * | fixed: thêm E7c (ma trận đường × người, đếm đường bằng grep, quét migration không select *) |
| P1 | evals | Check data_class ở DB phải tương đương lopTruongRieng trên cả ma trận, E6b chỉ so chuỗi trong migration | Check viết contact_types <@ array Seller Landlord — chuỗi đủ hai loại, dòng Seller bị chặn, nhưng Seller+Buyer ghi custom_field lọt | Ma trận hành vi trên Postgres 8 dòng × 2 lớp | fixed: E6b thôi so chuỗi, thêm E6d chạy ma trận chung trên Postgres (8 × 2 assert) |
| P1 | design, evals | Đồng bộ ngoại tuyến của custom_changed chỉ đo chiều kéo; chưa đo lệnh đặt lúc ngoại tuyến đẩy lên, và «bộ trường chưa tải» bị coi như rỗng làm mất cột trong góc nhìn đã lưu | Đặt Căn góc lúc mất mạng, quản trị bỏ trường; lệnh bị 400 mà bản trên máy vẫn hiện Có; hoặc góc nhìn bị ghi đè mất cột custom | Ca web hàng đợi ngoại tuyến qua máy chủ giả; dòng góc nhìn ở trạng thái chưa tải | fixed: thêm E4e (đường đẩy là POST /events thật qua applyCommand, 400 làm lùi bản trên máy); E4c thêm dòng «chưa tải» giữ góc nhìn |
| P2 | contract, evals | Vế màn của AC-9 (người không quản trị mở /settings/fields) không có eval, AC-9 thiếu thẻ cross-layer | Trang mới quên chặn quyền, đầu chủ thấy form tới khi bấm Lưu | Bước ui-check đăng nhập đầu chủ | fixed: AC-9 gắn (cross-layer), E11 thêm bước 6 đầu chủ bị chuyển về Cá nhân kèm câu báo |
| P2 | decisions | Dòng descope «không kèm trường riêng khi phát hàng cho đội khác» trích câu chỉ nói trang khách, không quyết việc phát cho đội bạn | Chủ kho ký tưởng câu giao đã quyết, AC-5 khoá cứng một lựa chọn sản phẩm máy đặt | Đổi thành câu chỉ người | fixed: dòng S1 mới Hỏi-6 (chi-nguoi, supersedes d-20261106T065520Z-13) và Hỏi-6 trong design doc |
