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
