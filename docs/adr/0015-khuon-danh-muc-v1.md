# ADR-0015: Khuôn danh mục v1 và vùng danh mục dùng chung

Ngày: 2026-11-01 · Trạng thái: **accepted** (Manh Phan duyệt Cổng Phạm vi hồ sơ `nhan-danh-muc-invest` 31/10, Hỏi-1..5
theo khuyến nghị; duyệt kế hoạch 1/11) · Liên quan: ADR-0017 §5 của kho `onehub-invest`; ADR-0016 (mọi loại hình);
Tham chiếu §4, §12; hàng 10 của lộ trình

## Bối cảnh

Danh mục căn là thứ duy nhất dùng chung giữa các sàn. Invest đẩy danh mục theo khuôn của loại kết nối «nguồn danh mục»
(`catalog_source`), khuôn nằm ở kho này, tắt thoả thuận là dừng chảy ngay. Khuôn phiên bản 0 là nháp chưa ai ghim; hàng
72 đã đổi tên khoá của nó sang khu `subdivisions` mà chưa nâng số, và khuôn chưa chở trường của nhà phố, đất.

## Quyết định

1. **Khuôn v1** (`packages/connect/src/catalog-feed.ts`, `schemaVersion: 1`, bỏ v0): đúng hình danh mục của lõi
   (`CatalogData`) — khu `subdivisionKey`/`subdivisionName`/`complexName`, toà `buildingKey`/`buildingName`, căn `upi`,
   `unitNumber`, `stack`, `floor`, `livingArea`, `bedroomsTotal`, `directionFaces`, `propertyType`, `propertySubType`,
   và tuỳ có `lotSizeArea`, `storiesTotal`, `frontageLength`, `accessRoadWidth`. `.strict()` ở mọi cấp.
2. **Luật loại hình nằm trong khuôn** (Hỏi-5): cặp loại hình phải có trong bảng loại hình của lõi, căn không mang trường
   loại hình không dùng; UPI và khoá khu không trùng trong một gói. Bên đẩy kiểm gói bằng chính khuôn là biết gói có
   được nhận về hình dạng không. `packages/connect` phụ thuộc `@quy-hang/core`; lõi không phụ thuộc ngược.
3. **Luật nhận nằm ngoài khuôn** chỉ có hai: sàn gửi nằm trong danh sách công ty được nền tin ghi danh mục
   (`catalog_trusted_companies`, vận hành thêm, sàn không tự thêm — Hỏi-1), và sàn có thoả thuận `catalog_source` chiều
   vào, đang bật, trong hiệu lực, có lớp `catalog`.
4. **Điều kiện loại ở lõi thoả thuận** (Hỏi-4): `mayFlow` nhận loại và chiều mong đợi; thiếu thì giữ hành vi cũ. Cửa
   nhận luôn truyền `catalog_source` / `inbound`.
5. **Vùng dùng chung** (migration 010): mọi sàn đọc; ghi qua hàm `app.catalog_source_active` ở luật theo dòng, mốc hiệu
   lực theo `now()` của cơ sở dữ liệu; không ai xoá; chỉ cột lớp `catalog`.
6. **Cửa nhận** `POST /api/v1/catalog/feeds`: quản trị sàn gửi bằng phiên đăng nhập (Hỏi-2); gói sai → 422
   `invalid-feed` kèm đường khoá; thoả thuận không hiệu lực → 403 `agreement-inactive`; một giao dịch, không ghi một
   phần; gửi lại không nhân đôi.

## Hệ quả

- Đổi khuôn sau này là lên v2, giữ v1 một thời gian.
- Để sau: khoá máy cho Invest tự đẩy; gói cũ hơn gói đã nhận; xoá căn vắng khỏi gói; ô Gõ mã căn đọc vùng dùng chung
  (Hỏi-3, hàng kế); số thị trường và tin rao trong khuôn.

## Sửa đổi 09/11: khoá máy (hàng 96)

Điều «Để sau: khoá máy cho Invest tự đẩy» đã làm. Manh Phan duyệt Cổng Phạm vi hồ sơ `token-may-ket-noi` ngày 09/11, Hỏi-1..8
theo khuyến nghị.

- **Cách gọi.** Máy bên kia gọi `POST /api/v1/catalog/feeds` với `Authorization: Bearer qhm_…`, không phiên. Sàn và thoả
  thuận lấy từ token, cookie đi kèm bị bỏ qua; có Bearer thì không rơi về phiên. Đường phiên của quản trị sàn giữ nguyên.
- **Token.** Gắn đúng một thoả thuận loại `catalog_source` chiều vào hoặc `catalog_confirmation` chiều ra, tối đa 2 token còn
  sống mỗi thoả thuận, không có hạn riêng. Quản trị sàn cấp, đọc, thu hồi ở `/api/v1/agreements/{agreementId}/machine-tokens`;
  chuỗi rõ chỉ hiện ở phản hồi cấp, cơ sở dữ liệu giữ băm SHA-256 và tám ký tự nhận diện (migration 041).
- **Tắt.** `paused` và quá hạn chỉ chặn tạm. `ended` thu hồi hẳn: mở lại vẫn phải cấp token mới.
- **Mã lỗi.** Token sai, lạ, đã thu hồi chung 401 `invalid-machine-token`. Thoả thuận tắt hay sàn ngoài danh sách tin 403
  `agreement-inactive`, kể cả khi token bị thu hồi vì thoả thuận đang `ended`. Sai loại hay chiều 403 `token-scope`. Gói sai
  khuôn 422 `invalid-feed`. Lỗi máy chủ 500 `internal-error`.
- **Nhật ký.** Mỗi lời gọi mang token nhận ra được một dòng ở `machine_token_calls`, chỉ thêm; token lạ không ghi dòng. Lần
  nhận ghi trong cùng giao dịch với gói.
- Chưa làm: giới hạn tần suất, hạn giữ nhật ký (Hỏi-8); màn bật tắt và đọc nhật ký (hàng 98); API kéo sự kiện (hàng 97).
