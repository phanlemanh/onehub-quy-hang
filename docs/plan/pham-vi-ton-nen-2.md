# Bản phạm vi — việc tồn của đợt nen-2 (31/10)

Nguồn: trang tri thức của đợt (`docs/tri-thuc/wiki/dot/ton-nen-2.md`, kèm tài liệu thô chép từ sổ quyết định ba hàng và
nhật ký đợt nen-2). Mọi mục dưới đây là chữ của chủ kho ở Cổng Phạm vi hay Cổng Bằng chứng: «mở hợp đồng mới» (hàng 13,
hàng 9) hoặc «tách sang hàng sau» (hàng 11). Mã giữ theo gốc: `H<hàng>-N<số>` là mục Ngoài-<số> của hàng ấy,
`H11-H1` là Hỏi-1 của hàng 11. Việc của người không nằm ở đây — xem «Ra khỏi kho» ở mô tả PR cắt lượt.

<!-- <<<PHAM-VI-MA -->
```
dot: ton-nen-2
dang: lan-va
nguon: wiki/dot/ton-nen-2.md#85a4e60f45b708157b5705b6b8bc702346d1ac99

- `H13-N3` — lỗi tạm thời của máy chủ (5xx, 401 hết phiên) bị coi là «máy chủ từ chối»: thao tác rời hàng đợi sang Cần xem thay vì được gửi lại
- `H13-N13` — lỗi tạm thời đẩy thao tác sang Cần xem và chỉ còn lối «Bỏ thay đổi» (vòng chấm 2)
- `H13-N25` — máy chủ trả 5xx hay 401 bị coi là từ chối (vòng chấm 1)
- `H13-N4` — lần kéo về nuốt mọi lỗi và báo «Mất mạng», kể cả khi lưới chặn nguồn từ chối, hết phiên hay kho trên máy lỗi
- `H13-N6` — sửa căn đang Cần xem rồi bấm «Giữ của tôi» đảo thứ tự thay đổi: sửa cũ đè sửa mới, hoặc căn lại rơi vào Cần xem
- `H13-N16` — sửa một căn đang Cần xem tạo thao tác kẹt trong hàng đợi; «Lấy bản mới» hay «Bỏ thay đổi» không bỏ nó
- `H11-H1` — mã hoá số chủ nhà ở mức trường; phải xong trước khi có dữ liệu thật
- `H9-N4` — hai toà cùng dự án có căn trùng mã: tra trả căn của toà nạp sau mà không báo; xử cùng lúc nạp danh mục thật
```
<!-- PHAM-VI-MA>>> -->

## Chi tiết cho người cắt lượt

- Sáu mục của hàng 13 là ba hành vi (cùng lỗi phân loại 5xx/401 hiện ở ba vòng chấm) trong cùng vùng
  `apps/web/src/lib/sync/**` — cắt thành một hàng (61). Ba hành vi phải xong trước hai tuần thử.
- `H11-H1` đứng trên hàng 11 (bảng chủ nhà, cửa «Mở số» duy nhất) — hàng 62, hạng T3 (migration, lớp `source`).
- `H9-N4` đứng trên hàng 9 (tra mã căn) — hàng 63. Không đứng trên hàng 10: danh mục thật có thể đến qua hàng 10 hay qua
  nhập tay, nên tra phải phân biệt hai toà trước cả hai đường.
