## Trong hợp đồng

- **Hình dạng 4, assertion âm-tính-một-mình: «toàn nội dung không đổi» không thể đỏ ở bảng căn**
  file: `packages/api/test-db/khuon-v2/va-moc.test.ts:49`
  severity: medium
  AC: AC-2
  source: measurement
  detail: Dòng 49 `assert.deepEqual(await chup(khu), truoc, ...: toàn nội dung không đổi)` là assert âm tính duy nhất cho bảng catalog_units. `chup` (packages/api/test-db/khuon-v2/chung.ts:28) chỉ đọc 4 cột của bảng này: upi, living_area, field_confidence, agreement_id. Gói lỗi `sai` dựng từ `goiMoiHon(g)`, hàm này chỉ đổi marketStats và publicListings. Khác biệt duy nhất của `sai` chạm vào phần căn là ca dòng 29, sửa buildingName thành «zalo.me/mau», và ca đó ghi vào cột building_name (feeds-ghi.ts:103, 156). Cột building_name không được chụp, nên kể cả khi gói bị từ chối vẫn ghi lọt vào catalog_units thì `chup` trả y như trước và assert vẫn xanh. Không có đối chứng dương cho phần căn: bước «gói đúng sau đó» chỉ kiểm segments của thiTruong, không chứng minh phép chụp nhìn thấy được một thay đổi ở bảng căn. AC-2 của contract hứa «toàn nội dung ba bảng của khu không đổi» và comment của `chup` cũng ghi «Toàn nội dung ba bảng», nhưng phép đo chỉ có sức phân biệt ở hai bảng ảnh chụp. Các cột unit_number, stack, direction_faces, measured_at của catalog_units cũng nằm ngoài phần chụp.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Bỏ đuôi .io/.co khỏi mẫu không phân biệt hoa thường làm lọt tên miền trước đây đã chặn**
  Người dùng thấy gì: Một tên miền đuôi .io hoặc .co viết hoa chữ đầu, như Nhadat.io, vẫn lọt vào danh mục dù trước đây bị chặn. Bản viết thường vẫn bị chặn.
  Căn cứ: Hậu quả nhẹ: chỉ vài dạng tên miền hiếm lọt vào tên toà hay tên khu, không mất dữ liệu, và sửa hay gỡ sau đều rẻ.
  file: `packages/connect/src/catalog-feed.ts`
  severity: medium
  Đề xuất: known-limits

- **Bỏ .io và .co khỏi danh sách không phân biệt hoa thường làm tên miền có chữ hoa lọt vào gói v2, trước đây bị chặn**
  Người dùng thấy gì: Gói danh mục có tên miền đuôi .io hoặc .co viết hoa chữ đầu vẫn được nhận và ghi vào danh mục, dù tài liệu nói tên miền không được vào.
  Căn cứ: Hậu quả nhẹ và hiếm gặp, dữ liệu không bị mất hay lộ, người vận hành dọn được sau và sửa lưới sau này không tốn kém.
  file: `packages/connect/src/catalog-feed.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 5, tuyên quét LỚP nhưng ma trận thiếu phần tử: «mọi trường chữ do người gõ» chỉ đo 6/7, sót stack**
  Người dùng thấy gì: Trường tên dãy căn chưa được kiểm riêng, nên nếu sau này nó vô tình thoát khỏi lưới chặn tên miền thì bộ kiểm không báo.
  Căn cứ: Hậu quả nhẹ: hiện lưới vẫn áp cho trường này, chỉ thiếu bài kiểm giữ cho tương lai, và thêm một ô kiểm sau rất rẻ.
  file: `packages/connect/src/catalog-feed-va.test.ts`
  severity: medium
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).

