# Review findings: loi-hang-va-su-kien (round 1)

## Trong hợp đồng

- **Hình dạng 3 — ca «hai lệnh thắng ngay đồng thời» chỉ kiểm trạng thái cuối nằm trong một tập, trong khi lời hứa là quan hệ giữa thứ tự ghi và trạng thái cuối**
  AC: AC-9
  file: `packages/api/test-db/listings.test.ts:437`
  severity: high
  source: measurement
  detail: E9 hứa: «trạng thái cuối theo thứ tự ghi được bảng chuyển nhận». Ca chỉ kiểm `assert.ok(["Pending", "Closed"].includes(cuoi.standardStatus))`. Trước đó ca nhận cả 200/400 và `thanhCong >= 1`. Ca không đọc type/payload của sự kiện seq 5 và 6, nên không so trạng thái cuối với sự kiện ghi sau cùng. Ca cũng không kiểm cặp đã ghi có hợp bảng chuyển không. Ví dụ hỏng mà ca vẫn xanh: Closed ghi ở seq 5, rồi Pending vẫn được nhận ở seq 6 (Closed→Pending lọt bảng chuyển). Khi đó cả hai lệnh ra 200, seq 1..6 liền, trạng thái cuối là Pending — vẫn nằm trong tập. Phép đo chỉ thấy giá trị có mặt trong tập cho phép, không đo quan hệ thứ tự ghi ↔ trạng thái cuối mà lời hứa đòi.
  rationale: AC-9 đòi lệnh thắng ngay vẫn xét bảng chuyển trên trạng thái hiện tại khi chạy đồng thời; ca kiểm quá lỏng nên không chứng minh được điều đó.

- **Hình dạng 5 — E10 tuyên quét mọi loại sự kiện × mọi khoá source (cấp đầu và lồng) qua API, nhưng ca chạy dưới lệnh của E10 chỉ có ba điểm của một loại**
  AC: AC-10
  file: `packages/api/test-db/listings.test.ts:546`
  severity: high
  source: measurement
  detail: Lệnh của E10 là `executors.test.isolation` (db:migrate + db:test), lệnh này không chạy packages/core. E10 hứa: «với mỗi loại sự kiện, một khoá lạ ở cấp đầu và một khoá lạ lồng ... đều trả 400, không ghi; danh sách khoá source (chủ nhà, số chủ, giá đáy, ảnh sổ) viết trước, mỗi khoá thử ở cấp đầu và lồng». Ca API «payload theo khuôn chặt qua API» chỉ lặp ba payload viết tay, đều là `details_changed`: `ownerPhone` cấp đầu, `ownerName` lồng, `khoaLa` cấp đầu. Ca thêm một lần tạo hàng có `floorPrice`. Ca không đụng `price_changed`, `status_changed`, `owner_confirmed`, `created` (qua lệnh). `titleDeedPhoto` không được thử, `floorPrice` không thử dạng lồng. Ca cũng không có danh sách viết trước hay phép đếm «số lần so = số phần tử». Đây là điểm-case trong khi lời hứa là cả lớp. Lưu ý thêm: tên ca trong expected trùng với ca ở packages/core (listing.test.ts), mà ca đó thuộc executors.test.core chứ không thuộc lệnh của E10.
  rationale: AC-10 đòi payload mỗi loại sự kiện từ chối mọi khoá source ở mọi cấp, nhưng phép đo chỉ thử vài điểm của một loại.

- **Hình dạng 5 — ma trận khoá source ở lõi lấy danh sách từ chính mã đang kiểm (SOURCE_KEYS), không viết trước, không đếm**
  AC: AC-10
  file: `packages/core/src/listing/listing.test.ts:675`
  severity: medium
  source: measurement
  detail: Ca lặp `for (const k of SOURCE_KEYS)`, mà `SOURCE_KEYS` import từ `./events`, tức mã đang kiểm. Theo comment ở events.ts, danh sách này chỉ dùng để gọi đúng tên lỗi. E10 đòi «danh sách khoá source ... viết trước». Ca không có danh sách tay và không có `assert.equal(so, …)` để ghim số phần tử. Nếu một khoá bị gỡ khỏi `SOURCE_KEYS`, vòng lặp tự co lại và ca vẫn xanh. Ma trận không độc lập với mã, trái mẫu P105 (số assert = số phần tử viết trước). So sánh: status.test.ts làm đúng, có bảng tay và `assert.equal(so, 36)`.
  rationale: AC-10 đòi mọi khoá source bị từ chối; ma trận lấy danh sách từ chính mã đang kiểm nên khoá bị gỡ đi vẫn không làm ca đỏ.

- **Hình dạng 4 — ca khoá chủ nhà qua API chỉ kiểm phép từ chối, không ghim lý do vào khoá; ca lồng không có đối chứng cùng hình**
  AC: AC-10
  file: `packages/api/test-db/listings.test.ts:549`
  severity: medium
  source: measurement
  detail: Với `{ furnished: { ownerName: "[Tên]" } }`, ca chỉ kiểm `status 400` và `error === invalid-payload`. validatePayload từ chối MỌI khối lồng dưới khoá đã biết («không nhận khối lồng», events.ts). Vì vậy `{ furnished: {} }` hay `{ furnished: { x: 1 } }` cũng ra đúng 400 invalid-payload, và ca không phân biệt được khoá chủ nhà có bị bắt hay không. Ca không đọc `details[].path`, nên `furnished.ownerName` không được ghim. Đối chứng `{ furnished: "full" }` không cùng hình với ca lồng. Lần tạo hàng có `floorPrice` (dòng 551–552) cũng chỉ kiểm `status === 400`, không kiểm mã lỗi hay path `floorPrice`. Đó là phép âm-tính đứng một mình: 400 vì bất kỳ lý do nào cũng làm ca xanh.
  rationale: AC-10 đòi khoá source lồng bị từ chối; ca chỉ kiểm có 400 nên không chứng minh bị từ chối vì khoá chủ nhà.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **listing_events không có khoá ngoại tới listings; ràng buộc listings_company_id_unique được tạo nhưng không bảng nào tham chiếu**
  Người dùng thấy gì: Cơ sở dữ liệu không tự chặn được một dãy sự kiện không thuộc hàng nào. Hiện chỉ đường ghi duy nhất của hệ thống giữ quy tắc này nên người dùng thường không gặp.
  Căn cứ: Nhẹ với người dùng vì chỉ đường ghi duy nhất của hệ thống mới tạo được dữ liệu này và không ai thấy hàng lạc; ghi lại để sau này siết thêm ở tầng cơ sở dữ liệu.
  file: `packages/db/migrations/004_loi_hang_va_su_kien.sql`
  severity: low
  Đề xuất: known-limits

- **Ngày bán không có thật (vd 2026-02-30) qua được kiểm payload rồi làm cơ sở dữ liệu báo lỗi 500 thay vì trả 400 invalid-payload**
  Người dùng thấy gì: Nhập ngày bán không có thật như 30 tháng 2 khi chốt bán sẽ nhận lỗi hệ thống chung chung thay vì thông báo chỉ rõ ngày sai. Việc chốt bán không thành và không có dữ liệu nào bị ghi nửa chừng.
  Căn cứ: Không mất hay lộ dữ liệu và người dùng tự sửa ngày rồi thử lại được, nhưng thông báo gây khó hiểu; sửa rẻ nên đáng làm trong một việc riêng.
  file: `packages/core/src/listing/events.ts`
  severity: medium
  Đề xuất: new-contract

- **Kiểm mã hàng quá lỏng nên chuỗi 36 ký tự không phải UUID đi xuống Postgres và trả 500 thay vì 404**
  Người dùng thấy gì: Gõ sai mã hàng theo kiểu chuỗi 36 ký tự lạ sẽ nhận lỗi hệ thống thay vì thông báo không tìm thấy. Không có dữ liệu nào bị đổi hay lộ.
  Căn cứ: Chỉ xảy ra khi tự gõ mã bậy ngoài giao diện, không mất hay lộ dữ liệu, tải lại là xong nên không đáng mở việc riêng.
  file: `packages/api/src/listings/routes.ts`
  severity: low
  Đề xuất: wont-fix

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
