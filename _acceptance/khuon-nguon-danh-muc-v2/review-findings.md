# Review findings: khuon-nguon-danh-muc-v2 (round 2)

## Trong hợp đồng

- **Lưới tên miền dùng danh sách đuôi đóng, nên `zalo.me`, `t.me`, `fb.me`, `.land`, `.xyz`, `.shop` lọt vào gói v2**
  AC: AC-7
  file: `packages/connect/src/catalog-feed.ts:184`
  severity: medium
  source: bugs
  detail: Mẫu tên miền chỉ nhận đuôi com|net|org|vn|io|info|biz|asia|co. Đã chạy parseCatalogFeed trên gói mẫu với `provider` lần lượt là `zalo.me/0900abc`, `zalo.me`, `fb.me/abc`, `t.me/kenh`, `nhadat.land`, `muaban.xyz`, `nha.shop`: cả bảy đều được nhận. Đối chứng `facebook.com` và `batdongsan.com.vn` bị từ chối. Không có `http://` hay `www.` thì hai mẫu đường dẫn cũng không bắt, nên chuỗi đi thẳng vào danh mục và ảnh chụp. AC-7 và ADR-0015 (dòng 63) hứa từ chối cả gói khi chuỗi có dáng URL hay tên miền, không giới hạn đuôi; thiết kế §«Không vào được» cũng không nêu danh sách đuôi. `zalo.me/...` là dạng liên kết liên hệ phổ biến ở thị trường này. Ma trận kiểm chỉ dùng một dáng tên miền trong danh sách nên không thấy lỗ. Hướng sửa: mở rộng đuôi (ít nhất me, land, xyz, shop và các gTLD phổ biến) hoặc bắt `nhãn chữ.đuôi chữ ≥2` kèm đối chứng `A.2305`, `Toà 3.1`, `Khu B.2`.

- **Bản sửa mốc đo chỉ chặn giờ của độ lệch; phút ≥ 60 và phần lẻ giây quá dài vẫn qua khuôn rồi thành 500**
  AC: AC-4
  file: `packages/connect/src/catalog-feed.ts:30`
  severity: low
  source: bugs
  detail: Refine của MocDo chỉ kiểm tổng `giờ*60 + phút <= 959` và năm 0000. parseCatalogFeed nhận `2026-11-09T08:00:00+07:60`, `+07:99`, `+0760`, `-00:75` ở cả `marketStats[].measuredAt` và `measuredAt` đầu gói (zod không giới hạn phút của độ lệch). Ép `::timestamptz` trên Postgres 16.15 báo `time zone displacement out of range` với `+07:60`, `+07:99`, `-00:75`. Phần lẻ giây 300 chữ số cũng qua khuôn, còn Postgres báo `invalid input syntax`. Theo mã nguồn, các lỗi này ở `ghiAnhChup` hoặc câu ghi khu làm giao dịch hoàn tác: đường token rơi vào nhánh cuối, ghi `server_error` và trả 500; đường phiên `throw e`. Dữ liệu không bị ghi dở, nhưng bên đẩy nhận lỗi máy chủ không có đường khoá, trái «sai khuôn 422» của AC-4 và trái chú thích ngay trên MocDo. Đây là phần còn sót của phát hiện lượt 1; ca kiểm chỉ thử giờ và năm. Hướng sửa: thêm điều kiện phút < 60 và giới hạn độ dài phần lẻ giây.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Mốc đo ở tương lai lọt khuôn và khoá vĩnh viễn ảnh chụp của khu (r1)**
  Người dùng thấy gì: Một gói đẩy nhầm năm hoặc sai đồng hồ có thể làm số thị trường và tin rao của một khu đứng yên, mọi gói đúng sau đó bị bỏ qua mà bên đẩy vẫn thấy báo thành công. Chỉ chủ cơ sở dữ liệu sửa tay được.
  Căn cứ: Hậu quả nặng vì ảnh hưởng mọi sàn dùng chung khu đó và người dùng không tự gỡ được, nhưng cần sự cố nhập sai mới xảy ra và việc sửa nhỏ, nên đáng đăng thành việc riêng.
  file: `packages/connect/src/catalog-feed.ts`
  severity: medium
  Đề xuất: new-contract

- **Hình 4 (không đối chứng dương): «giá trị đúng theo v1» so trước và sau với cùng một giá trị (r1)**
  Người dùng thấy gì: Bộ kiểm chưa chứng minh được rằng khi gói cũ đẩy lại, giá trị căn được lấy đúng từ gói cũ. Chưa thấy lỗi thật nào.
  Căn cứ: Nhẹ vì chỉ là chỗ kiểm yếu ở đường gói cũ đang chuyển tiếp, không có dữ liệu bị hỏng được chỉ ra, và bổ sung sau rẻ.
  file: `packages/api/test-db/khuon-v2/nhan-goi-v2.test.ts`
  severity: low
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).

- **Khuôn v2 vẫn nhận giá trị Postgres từ chối, gói sai khuôn thành 500 thay vì 422**
  Người dùng thấy gì: Nếu bên đẩy gửi một số tầng hoặc số phòng quá lớn, hoặc chuỗi chứa ký tự rỗng, họ nhận lỗi máy chủ chung chung thay vì thông báo sai khuôn rõ ràng. Không có dữ liệu nào bị ghi dở.
  Căn cứ: Hậu quả nhẹ: gói bị từ chối toàn bộ, không mất hay lộ dữ liệu, bên đẩy chỉ cần sửa số và gửi lại; chỉ khó đoán nguyên nhân hơn.
  file: `packages/connect/src/catalog-feed.ts`
  severity: medium
  Đề xuất: known-limits

- **Tài liệu OpenAPI của cửa nhận vẫn ghi «theo khuôn v1» dù route đã nhận v2**
  Người dùng thấy gì: Dòng tóm tắt trong tài liệu cho bên đẩy vẫn nói chỉ nhận khuôn v1, trong khi phần mô tả bên dưới nói nhận cả v2, nên đọc có thể thấy mâu thuẫn.
  Căn cứ: Chỉ là chữ trong tài liệu, không ảnh hưởng dữ liệu hay hành vi, sửa sau rất rẻ.
  file: `packages/api/src/catalog/feeds.ts`
  severity: low
  Đề xuất: known-limits

- **Chuỗi chứa ký tự NUL qua khuôn v2 rồi làm hỏng câu ép jsonb, trả 500 thay vì 422**
  Người dùng thấy gì: Một chuỗi chứa ký tự rỗng ẩn làm cả gói bị từ chối bằng lỗi máy chủ thay vì thông báo sai khuôn. Không có dữ liệu nào bị ghi.
  Căn cứ: Hiếm gặp với dữ liệu thật, không mất hay lộ dữ liệu, bên đẩy gửi lại gói sạch là xong.
  file: `packages/connect/src/catalog-feed.ts`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 2: Fixture viết tay đúng khuôn bên đọc, nhưng eval tuyên là round-trip qua bên viết thật**
  Người dùng thấy gì: Bài kiểm chỉ chứng minh gói mẫu do chính nhóm viết khớp với bộ đọc của nhóm, chưa chứng minh khớp với bên đẩy thật vì bên đó chưa tồn tại.
  Căn cứ: Giới hạn đã được ghi nhận từ đầu và chỉ hết khi Invest đẩy gói thật; không ảnh hưởng người dùng hiện tại.
  file: `_acceptance/khuon-nguon-danh-muc-v2/evals.yaml`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 5: Tuyên quét lớp «mọi lá chuỗi» nhưng tập ô rút lúc chạy từ chính gói mẫu, chỉ chặn sàn ≥ 15, không có ma trận viết trước**
  Người dùng thấy gì: Bài kiểm chặn đường dẫn và số điện thoại trong chuỗi có thể không phát hiện nếu sau này ai đó bớt trường khỏi gói mẫu, nên một lỗ rò có thể lọt mà bài vẫn xanh.
  Căn cứ: Hiện chưa có rò thật, chỉ là lưới kiểm lỏng cho thay đổi tương lai; siết lại sau rẻ.
  file: `packages/connect/src/catalog-feed-v2.test.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 5: Ô «giá không nguyên» và «giá ≤ 0» của lớp ba trường giá chỉ thử điểm listPriceLow**
  Người dùng thấy gì: Bài kiểm chỉ thử giá thấp nhất, nên nếu sau này giá cao hoặc giá trung vị đổi luật thì bài có thể không báo.
  Căn cứ: Hiện không có lỗi thật với người dùng, chỉ là chỗ bài kiểm chưa phủ hết, sửa sau rẻ.
  file: `packages/connect/src/catalog-feed-v2.test.ts`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 5: E1 hứa agreement_id cho cả ba bảng nhưng kiemGhiDu bỏ sót bảng tin rao**
  Người dùng thấy gì: Bài kiểm không xác nhận bảng tin rao ghi đúng thoả thuận, nên nếu sau này ghi nhầm thoả thuận thì bài vẫn xanh.
  Căn cứ: Hiện đang ghi đúng, chỉ thiếu một điểm kiểm; không ảnh hưởng người dùng, bổ sung sau rất rẻ.
  file: `packages/api/test-db/khuon-v2/nhan-goi-v2.test.ts`
  severity: low
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
