# Review findings: va-khuon-v2-moc-tuong-lai (round 2)

## Trong hợp đồng

- **Hình 5, tuyên quét LỚP nhưng chỉ có điểm-case: AC-5 hứa bốn vị trí mốc qua cửa nhận, phép đo tầng ghi chỉ chạm marketStats**
  file: `packages/api/test-db/khuon-v2/va-moc.test.ts:92`
  severity: medium
  AC: AC-5
  source: measurement
  detail: AC-5 hứa ma trận ở bốn vị trí mốc, «422 không phải 500 qua cả hai đường vào», và biên «được nhận và ghi được» (cross-layer). card-plain.json gap_probe_plain[2] ghi «đã đo đủ bốn vị trí và hai đường». Ở tầng cửa nhận, cả «mốc đo lạ: 422 không phải 500» (dòng 92) lẫn «mốc đo biên ghi được» (dòng 109) chỉ gán `g.marketStats[0].measuredAt`; số ô là 6×2 = 12 (dòng 100), và E6 cũng chốt «ở marketStats.measuredAt». Bốn vị trí chỉ có ở tầng khuôn (E5). Ba vị trí còn lại đi đường ghi khác: mốc đầu gói vào catalog_subdivisions và catalog_units (feeds-ghi.ts dòng 135, 173), mốc tin rao vào bảng ảnh chụp tin (dòng 80). Vì vậy «ghi được» ở biên +15:59 và 9 chữ số lẻ chưa được đo cho các đường này, gồm cả gói v1 qua cửa nhận.

- **Hình 5, tuyên ba bảng nhưng chỉ đo hai: «gói đúng vẫn thay được ảnh chụp» không có assert nào trên bảng tin rao**
  file: `packages/api/test-db/khuon-v2/va-moc.test.ts:29`
  severity: low
  AC: AC-2
  source: measurement
  detail: Chú thích goiMoiHon (dòng 25) nói «nội dung khác ở cả ba bảng», nhưng dòng 29 chỉ đổi `measuredAt` của publicListings, `listings` giữ nguyên. Sau gói đúng (dòng 61-70), test chỉ assert segments và bảng căn; `sau.tin` không được đọc. `.tin` chỉ xuất hiện ở đối chứng trước khi đẩy (dòng 49). AC-2 hứa khu không bị đóng băng, và catalog_public_listing_snapshots dùng cùng luật thay theo mốc đo (ghiAnhChup, feeds-ghi.ts dòng 65, 80). Nếu bảng tin rao không thay được thì ca này vẫn xanh. Riêng bảng này, «không đổi» ở dòng 57 cũng thiếu đối chứng dương rằng phép so thấy được thay đổi.

- **Hình 5, tuyên «toàn nội dung» nhưng chỉ so một tập cột: hai bảng ảnh chụp bỏ provider và updated_at**
  file: `packages/api/test-db/khuon-v2/va-moc.test.ts:57`
  severity: low
  AC: AC-2
  source: measurement
  detail: Dòng 57 assert với thông điệp «toàn nội dung không đổi», và AC-2 hứa «toàn nội dung ba bảng». chupDu (dòng 19-22) chỉ `select *` cho catalog_units. Hai bảng ảnh chụp lấy từ `chup` (chung.ts dòng 29-30), chỉ gồm subdivision_key, measured_at, segments hoặc listings, agreement_id. Trong khi đó câu ghi có `set provider = $2 ... updated_at = now()` (feeds-ghi.ts dòng 64), nên một lần ghi vào hai cột này nằm ngoài phép so. Commit bee6ff9e đã sửa đúng lỗ này cho bảng căn nhưng chưa sửa cho hai bảng còn lại.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Bỏ .io và .co khỏi mẫu không phân biệt hoa thường làm lọt tên miền có chữ hoa mà bản trước đã chặn**
  Người dùng thấy gì: Một vài tên miền viết hoa như Nhadat.IO vẫn lọt vào tên khu hay tên toà, trong khi trước đây bị chặn. Tên miền quảng cáo có thể xuất hiện trên danh mục dùng chung.
  Căn cứ: Hậu quả nhẹ: chỉ vài dạng viết hoa hiếm, không lộ dữ liệu chủ nhà, và sàn có thể sửa tay chữ này sau; sửa sau vẫn rẻ.
  file: `packages/connect/src/catalog-feed.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình 5, tuyên quét LỚP nhưng ma trận thiếu phần tử: lớp «mọi trường chữ do người gõ» có 7 trường, ma trận chỉ có 6, thiếu stack**
  Người dùng thấy gì: Một trường chữ phụ (tầng) chưa được bài kiểm thử tên miền bao phủ, nên nếu lưới bỏ sót nó thì không ai phát hiện.
  Căn cứ: Rủi ro thấp: chỉ là khoảng trống trong bài kiểm, chưa có lỗi thật, và thêm ca kiểm sau này rẻ.
  file: `packages/connect/src/catalog-feed-va.test.ts`
  severity: medium
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).

