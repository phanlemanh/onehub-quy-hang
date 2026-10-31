## Trong hợp đồng

- **Ma trận payload chặt: với loại 'created', phép đo 'không được ghi' đếm sự kiện của hàng khác nên không bắt được lệnh tạo bị ghi lén**
  file: `packages/api/test-db/listings.test.ts:346`
  severity: low
  AC: AC-10
  source: conventions
  detail: Trong test 'payload theo khuôn chặt qua API', mỗi lần thử đều kiểm `assert.equal(await demSuKien(h.id), n, ...)`. Với type === 'created', hàm `gui` gọi POST /api/v1/listings, tức là tạo một hàng MỚI chứ không thêm sự kiện vào h.id. Vì vậy với 12 lần thử của dòng 'created' (4 khoá chủ nhà + 2 khoá lạ, mỗi khoá ở cấp đầu và lồng), số sự kiện của h.id không bao giờ đổi, dù server có lỡ ghi một hàng mang khoá chủ nhà. Phép kiểm này đúng trên mặt chữ nhưng không đo được gì cho lệnh tạo. Kết luận 'không lệnh sai nào được ghi' cho lệnh tạo hiện chỉ dựa vào mã 400. Muốn đo thật thì phải đếm số hàng hoặc số sự kiện của công ty a trước và sau mỗi lần thử, không phải sự kiện của h.id. Đây là đúng lối bất biến 2 (thông tin chủ nhà không rời công ty), mà vòng này đang siết riêng.
  rationale: AC-10 đòi payload mang khoá chủ nhà hay khoá lạ bị từ chối ở mọi loại sự kiện; với lệnh tạo, phép đo 'không ghi' không chứng minh được điều đó, nên AC-10 (và vế 'bị từ chối không ghi gì' của AC-1) chưa được đo thật.

- **Phép đo 'không được ghi' rỗng với loại created: đếm sự kiện của hàng h, trong khi lệnh tạo hàng ghi vào một hàng mới**
  file: `packages/api/test-db/listings.test.ts:355`
  severity: medium
  AC: AC-10
  source: bugs
  detail: Trong test 'payload theo khuôn chặt qua API', với type === "created" thì gui() gọi POST /api/v1/listings. Nếu payload hợp lệ thì lệnh này tạo một hàng mới với id mới. Nhưng kiểm 'không được ghi' lại so demSuKien(h.id) trước và sau lệnh (dòng 346 và 355), mà h là hàng có sẵn, lệnh tạo không bao giờ đổi số sự kiện của h. Vì vậy 12 trên 60 ô của ma trận (created × 6 khoá × 2 cấp) luôn qua phép đếm này, kể cả khi API lỡ nhận khoá chủ nhà, ghi một hàng mới mang ownerPhone hay floorPrice vào listings/listing_events, rồi trả lỗi. Các kiểm status, mã lỗi và details.path vẫn chạy, nhưng lời khẳng định của test 'không lệnh sai nào được ghi' (bất biến 2, AC-10) không được đo cho lệnh tạo. Cách sửa: với created, đếm số dòng của listings hoặc listing_events theo company_id của sàn a, trước và sau lệnh.
  rationale: Cùng lỗ hổng đo ở lệnh tạo: finding tự nêu AC-10 và bất biến 2; khoá chủ nhà ở lệnh tạo chưa được chứng minh là không bị ghi.

- **Assertion âm-tính đo sai chủ thể: kiểm «không được ghi» cho loại created đếm sự kiện của hàng khác**
  file: `packages/api/test-db/listings.test.ts:352`
  severity: low
  AC: AC-10
  source: measurement
  detail: Trong ma trận E10, `gui("created", payload)` gửi POST /api/v1/listings, tức là tạo một hàng MỚI. Thế nhưng phép kiểm «không được ghi» là `assert.equal(await demSuKien(h.id), n, ...)`, mà demSuKien chỉ đếm listing_events của hàng có sẵn h. Với type=created, số này đúng trong mọi trường hợp, kể cả khi máy chủ đã ghi hàng/sự kiện created mang khoá chủ nhà rồi mới trả 400. Vì vậy ở 12 ô created (4 khoá chủ nhà + 2 khoá lạ, mỗi khoá thử ở cấp đầu và lồng), vế «không ghi» của E10 không được đo. Chỉ còn assert status 400 và đường khoá trong lỗi gánh ca này. Phép kiểm chỉ có nghĩa khi đếm đúng bảng mà lệnh created ghi vào, ví dụ đếm listings hoặc listing_events của công ty trước và sau mỗi lần thử.
  rationale: Cùng một lỗ hổng: ma trận khuôn chặt của AC-10 không đo vế 'không ghi' cho 12 ô của lệnh tạo.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **listing_events không có khoá ngoại tới listings; ràng buộc listings_company_id_unique được tạo nhưng không bảng nào tham chiếu (r1)**
  Người dùng thấy gì: Cơ sở dữ liệu không tự chặn được một dãy sự kiện không thuộc hàng nào. Hiện chỉ đường ghi duy nhất của hệ thống giữ quy tắc này nên người dùng thường không gặp.
  Căn cứ: Nhẹ với người dùng vì chỉ đường ghi duy nhất của hệ thống mới tạo được dữ liệu này và không ai thấy hàng lạc; ghi lại để sau này siết thêm ở tầng cơ sở dữ liệu.
  file: `packages/db/migrations/004_loi_hang_va_su_kien.sql`
  severity: low
  Đề xuất: known-limits

- **Ngày bán không có thật (vd 2026-02-30) qua được kiểm payload rồi làm cơ sở dữ liệu báo lỗi 500 thay vì trả 400 invalid-payload (r1)**
  Người dùng thấy gì: Nhập ngày bán không có thật như 30 tháng 2 khi chốt bán sẽ nhận lỗi hệ thống chung chung thay vì thông báo chỉ rõ ngày sai. Việc chốt bán không thành và không có dữ liệu nào bị ghi nửa chừng.
  Căn cứ: Không mất hay lộ dữ liệu và người dùng tự sửa ngày rồi thử lại được, nhưng thông báo gây khó hiểu; sửa rẻ nên đáng làm trong một việc riêng.
  file: `packages/core/src/listing/events.ts`
  severity: medium
  Đề xuất: new-contract

- **Kiểm mã hàng quá lỏng nên chuỗi 36 ký tự không phải UUID đi xuống Postgres và trả 500 thay vì 404 (r1)**
  Người dùng thấy gì: Gõ sai mã hàng theo kiểu chuỗi 36 ký tự lạ sẽ nhận lỗi hệ thống thay vì thông báo không tìm thấy. Không có dữ liệu nào bị đổi hay lộ.
  Căn cứ: Chỉ xảy ra khi tự gõ mã bậy ngoài giao diện, không mất hay lộ dữ liệu, tải lại là xong nên không đáng mở việc riêng.
  file: `packages/api/src/listings/routes.ts`
  severity: low
  Đề xuất: wont-fix

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
