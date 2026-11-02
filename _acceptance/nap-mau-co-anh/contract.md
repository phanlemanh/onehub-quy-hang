---
schema_version: 1
feature: Vá nạp mẫu bản thật — căn mẫu Đang bán nhận một ảnh thật vẽ bằng mã trước khi lên Đang bán, để nút «Nạp dữ liệu mẫu» chạy trọn trên sàn mới sau luật ảnh thật của hàng 23
slug: nap-mau-co-anh
owner: phanlemanh@gmail.com
risk_tier: T3
surfaces: [api]
status: approved
design_doc: docs/superpowers/specs/2026-11-02-nap-mau-co-anh-design.md
approved_by: Manh Phan
approved_at: 2026-11-02
---

# Acceptance Contract: nap-mau-co-anh

## Context

Hàng vá phát sinh từ hàng 23 (`_acceptance/san-sang-ban/`): luật lõi nay đòi ít nhất một ảnh thật để vào Đang bán, nên
bộ nạp mẫu bản thật (hàng 87) dừng ở hàng Đang bán đầu tiên và rút lại cả lần chạy. Hàng này cho bộ nạp thêm một ảnh vẽ
bằng mã qua API ảnh trước lệnh lên Đang bán, chọn kho byte như API, và dọn byte khi gỡ hay khi hỏng giữa chừng. Hạng T3
vì chạm `packages/db/**`.

## Criteria

- AC-1: Given một Postgres dãy không có sàn mẫu và kho byte Postgres, When nạp mẫu bản thật, Then 40 hàng phân bố đúng gói
  (Đang bán 14, Chưa đủ 6, Đã cọc 5, Đã bán 5, Tạm giữ 5, Ngừng hẳn 5); mỗi căn của 29 hàng từng lên Đang bán có ĐÚNG một
  ảnh ngăn Gửi được, không ảnh mẫu, chưa xoá, do đầu chủ của hàng thêm (một sự kiện `added`); căn của hàng Chưa đủ và Ngừng
  hẳn không có ảnh nào. (cross-layer)
- AC-2: Given ảnh vẽ bằng mã của bộ nạp, When sinh cho cùng thứ tự hàng hai lần và cho hai thứ tự khác nhau, Then cùng thứ
  tự ra cùng từng byte, khác thứ tự ra byte khác; bản gốc và bản nhẹ là PNG mà luật tệp ảnh của lõi nhận (`kiemTepAnh` ok,
  loại `image/png`), kích thước khai đúng chiều trong đầu tệp, mỗi tệp dưới 1 MB; ảnh đọc lại qua API ảnh ra đúng byte đã
  nạp.
- AC-3: Given sàn mẫu đã nạp có ảnh, When nạp lại, Then không đổi một dòng ở mọi bảng (gồm `unit_photos`,
  `unit_photo_files`, `unit_photo_events`) và kho byte không nhận lệnh ghi nào.
- AC-4: Given môi trường có đủ ba khoá `STORAGE_S3_*`, When nạp, Then byte bản gốc và bản nhẹ của mỗi ảnh đi vào kho
  Storage dưới tiền tố mã sàn mẫu (lệnh ghi bắt được bằng kho giả), bảng `unit_photo_files` không có dòng nào của sàn mẫu.
  Given `NODE_ENV=production` thiếu khoá — cả ba, hay chỉ một — When chạy dòng lệnh nạp, Then thoát mã 1 với lời báo nêu
  ĐÚNG tập biến `STORAGE_S3_*` thiếu (thiếu một thì chỉ nêu biến ấy), và không bảng nào đổi; đủ ba khoá thì không có lời
  báo thiếu khoá. Ngoài bản thật, thiếu một phần khoá cũng dừng như thế; không khoá nào thì dùng kho Postgres (Hỏi-1).
- AC-5: Given sàn mẫu đã nạp có ảnh và một sàn thật có ảnh, When gỡ, Then kho byte nhận lệnh xoá cho đúng mọi ảnh của sàn
  mẫu, mỗi lệnh xoá mang mã sàn mẫu (tiền tố của đối tượng Storage), không lệnh xoá nào mang mã sàn thật hay mã ảnh của
  sàn thật; sàn thật không đổi một dòng (Hỏi-2).
- AC-6: Given lần nạp hỏng sau khi đã ghi một số ảnh lên kho — lead cuối bị từ chối, hay kho ném lỗi ở lần ghi thứ 10
  (sau khi byte đã ghi) — When lần chạy ném lỗi, Then cả lần chạy rút lại như hàng 87 VÀ kho byte nhận lệnh xoá cho đúng
  mọi mã ảnh mà kho đã nhận lệnh ghi trong lần chạy ấy (theo nhật ký của kho, không theo danh sách của bộ nạp), mỗi lệnh
  mang mã sàn mẫu; lỗi xoá ở kho không che lỗi gốc.
- AC-7: Given tệp nút «Nạp dữ liệu mẫu» (`.github/workflows/nap-mau.yml`), When đọc, Then bước «Chạy bộ nạp» nhận ba biến
  `STORAGE_S3_ACCESS_KEY`, `STORAGE_S3_SECRET_KEY`, `STORAGE_S3_ENDPOINT` từ `secrets.*` và không bước nào khác, job không
  khai chúng ở mức job; bước ấy vẫn khai `NODE_ENV: production` (dấu bản thật làm bộ nạp dừng khi thiếu khoá); các ca cũ
  của bài kiểm tệp nút vẫn đạt.
- AC-8: Given README của `packages/db/seed/`, When đọc, Then mục «Bản thật» ghi: căn mẫu từng lên Đang bán có một ảnh vẽ
  bằng mã, không ảnh thật của ai; bước một lần thêm ba secret `STORAGE_S3_*` ở environment `production` (cùng giá trị
  Vercel Production); thiếu secret thì nút dừng trước khi ghi với lời báo thiếu khoá; gỡ xoá cả byte ảnh mẫu trên kho;
  không giá trị nào của khoá. (judgment)

## Coverage

Ba trục, quét tay (sổ quyết định, dòng «bỏ coverage-scan»):

| Trục | Giá trị | AC |
|---|---|---|
| Kho byte | Postgres · Storage · bản thật thiếu khoá | AC-1, AC-4 |
| Việc | nạp mới · nạp lại · gỡ · hỏng giữa chừng | AC-1, AC-3, AC-5, AC-6 |
| Trạng thái hàng | từng lên Đang bán (Đang bán, Đã cọc, Đã bán, Tạm giữ) · không (Chưa đủ, Ngừng hẳn) | AC-1 |
| Vật của ảnh | tất định · đúng khuôn lõi · đọc lại được | AC-2 |
| Đường chạy trên bản thật | nút GitHub · tài liệu bước một lần | AC-7, AC-8 |

Ô bỏ: «gỡ khi hỏng giữa chừng» (gỡ là một giao dịch xoá sàn — byte xoá trước khi xoá sàn; hỏng sau đó thì byte đã mất mà
sàn còn, ảnh vỡ tới lần gỡ sau) — ghi ở Out of scope.

## Out of scope

- Thêm ảnh cho sàn mẫu đã nạp trước hàng 23 (hàng đã có được bỏ qua) — gỡ rồi nạp lại.
- Gỡ hỏng sau khi đã xoá byte: sàn mẫu còn mà ảnh vỡ tới lần gỡ sau.
- Thêm ba secret vào GitHub — việc của chủ kho, máy không có giá trị.
- Ảnh ngăn Nội bộ, ảnh bìa riêng, ảnh có chữ hay EXIF ngày chụp.
- Đổi gói `mau/du-lieu-mau.json` hay công cụ dựng dev của hàng 17 (đã vá ở hàng 23).

## Notes
