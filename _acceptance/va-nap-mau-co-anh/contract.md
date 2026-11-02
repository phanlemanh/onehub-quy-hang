---
schema_version: 1
feature: Vá bài kiểm Nạp mẫu có ảnh — ca kho Storage dùng đúng kho bước chọn kho dựng, có đối chứng dương, phá thử thì đỏ
slug: va-nap-mau-co-anh
owner: phanlemanh@gmail.com
risk_tier: T3
surfaces: [api]
status: verified
design_doc: docs/superpowers/specs/2026-11-02-va-nap-mau-co-anh-design.md
approved_by: Manh Phan
approved_at: 2026-11-02
---

# Acceptance Contract: va-nap-mau-co-anh

## Context

Ca «kho-storage» của bài kiểm Nạp mẫu có ảnh khẳng định bảng byte rỗng nhưng kho giả nó dùng không bao giờ ghi bảng ấy,
và kho không đi qua bước chọn kho theo môi trường — chọn nhầm kho thì ca vẫn xanh. Chủ kho chọn «mở hợp đồng mới» cho mục
này ở Cổng Bằng chứng hàng 28 (Ngoài-3). Hàng này chỉ sửa bài kiểm.

## Criteria

Ca «kho-storage» nạp ba lần cùng gói mẫu; trước mỗi lần, sàn mẫu vắng (0 dòng `unit_photos`, `unit_photo_files` của mã
sàn mẫu), và số đếm của một lần nạp chụp ngay sau lần ấy, rồi gỡ trước lần kế.

- AC-1: Given gói mẫu và env đủ ba khoá `STORAGE_S3_*` giả, When ca lấy kho bằng `chonKhoAnh(env, fetch ghi lại)` rồi nạp,
  Then kho tên `s3`; số ảnh sàn mẫu trong `unit_photos` bằng số ảnh mong đếm từ gói mẫu (29) và số lời PUT bằng gấp đôi
  (58); tập đường PUT bằng tập `<endpoint>/<bucket>/<mã sàn mẫu>/<mã ảnh>/{original,thumb}` dựng bằng hàm dựng đường của
  API từ mã ảnh đọc lại; không lời gọi nào khác PUT; `unit_photo_files` có 0 dòng của sàn mẫu.
- AC-2: Given cùng gói mẫu và env ngoài bản thật không khoá nào, When nạp với kho `chonKhoAnh` chọn, Then kho tên
  `postgres`, `unit_photo_files` có 58 dòng của sàn mẫu và `fetch` ghi lại không nhận lời gọi nào — câu đếm bảng byte
  dùng ở tiêu chí trên từng thấy dòng. Byte gửi lên Storage ở lần nạp đủ khoá khớp byte của lần nạp này: tập bội (biến
  thể, sha256) của 58 thân PUT bằng tập bội (biến thể, sha256) của 58 dòng `unit_photo_files`.
- AC-3: Given phép so của AC-1 dùng chung một hàm, When chạy nó trên kết quả nạp kho Postgres của AC-2 (chọn nhầm kho),
  Then trả lệch, thông điệp nêu «kho postgres», «bảng byte có 58 dòng», «Storage nhận 0 lệnh ghi»; When chạy nó trên một
  lần nạp từ sàn mẫu vừa gỡ sạch mà kho Storage được bọc để cũng ghi `unit_photo_files` (bộ bọc tự đếm 58 lần ghi bảng),
  Then trả lệch, thông điệp nêu «bảng byte có 58 dòng của sàn mẫu».
- AC-4: Given bộ nạp, bước chọn kho và kho Storage của API không đổi (dưới `packages/` và `apps/` chỉ tệp bài kiểm đổi so
  với điểm rẽ nhánh), When chạy bộ kiểm nạp mẫu và kiểm kiểu gói db, Then đều xanh; ca «kho-storage» gỡ sàn mẫu ở mọi lối
  ra kể cả khi ném lỗi, và kết thúc với 0 sàn mẫu, 0 dòng `unit_photos`, `unit_photo_files` của các mã sàn mẫu nó đã dựng.

## Coverage

Quét tay — một trục rời rạc nhỏ (sổ quyết định, dòng «bỏ coverage-scan»):

| Trục | Giá trị | AC |
|---|---|---|
| Kho bước chọn kho dựng | Storage (đủ khoá) · Postgres (không khoá, ngoài bản thật) | AC-1, AC-2 |
| Chiều của phép so | đạt · chọn nhầm kho · byte rò vào bảng · byte gửi khác byte gói | AC-1, AC-2, AC-3 |
| Phần còn lại của bộ kiểm | không đổi | AC-4 |

## Out of scope

- Đổi bộ nạp, `chonKhoAnh`, `khoS3` hay kho Postgres của API.
- Kiểm kho Storage thật qua mạng (cần khoá thật, CI không có).
- Các ca «go-xoa-byte», «chon-kho», «khong-khoa-ngoai-ban-that» — ngoài mục chủ kho mở.

## Notes
