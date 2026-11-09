# Đọc vùng danh mục dùng chung — thiết kế

Hàng 99 (dãy D, T2). Căn cứ: ADR-0015 mục Hệ quả («ô Gõ mã căn đọc vùng dùng chung, Hỏi-3, hàng kế»), ô cơ hội chủ kho đã ký.

## Vấn đề

Danh mục nhận qua cửa `POST /api/v1/catalog/feeds` nằm ở `catalog_subdivisions`, `catalog_units`, nhưng không chỗ đọc nào dùng: gõ mã,
`GET /api/v1/catalog`, Nhập Excel, «chỉ biết toà» của lead đều đọc gói mẫu nướng lúc khởi động.

## Cách làm

Một nguồn duy nhất `packages/api/src/catalog/nguon.ts`:

- `docDanhMuc()` trả `CatalogData` dựng từ hai bảng dùng chung, chỉ các cột lớp danh mục mà vai `quy_hang_app` được đọc (migration 014).
- Dấu phiên bản: mỗi lần đọc hỏi `count(*)` và `max(updated_at)`; dấu đổi thì dựng lại, không thì dùng bản đang giữ. Nhiều máy chủ không
  cần báo nhau; gói mới thấy ngay ở lần đọc kế.
- Bốn nơi đọc (`routes.ts`, `doc-ca-danh-muc.ts`, Nhập Excel, «chỉ biết toà») nhận `nguon` thay vì `CatalogData` cố định. Bài kiểm vẫn
  truyền được nguồn cố định.

Đọc lỗi cơ sở dữ liệu: đang giữ bản thật thì trả bản ấy; chưa giữ thì lỗi máy chủ. Không bao giờ rơi về gói mẫu khi lỗi, vì lỗi tạm sẽ làm
người dùng thấy dữ liệu mẫu như thật. Dấu phiên bản đọc từ hai bảng vì đọc thẳng cả danh mục mỗi lần gõ mã là tốn, dấu do cửa nhận ghi cần bảng
mới (migration, T3), giữ bản theo hạn thì gói mới không thấy ngay.

**Hỏi-1, vùng rỗng.** Không có đường nạp nào vào vùng ngoài cửa nhận, và lệnh nạp mẫu không gọi cửa ấy; bản thật đang sống nhờ gói mẫu
(bài `nap-ban-that` tra `A-01.03` từ đó; chưa đọc được bản thật để xác nhận vùng trống). Bản nháp theo khuyến nghị: vùng rỗng thì đọc gói
mẫu, có một khu thật trở lên thì tắt hẳn gói mẫu. Gói mẫu chỉ còn được nhắc ở `nguon.ts`.

Giá của khuyến nghị: danh mục dùng chung, nên một sàn nạp một khu là gói mẫu tắt cho mọi sàn, kể cả với khu gói chưa phủ, và không có đường
quay lại ngoài xoá vùng bằng quyền chủ bảng. Trên bản thật, căn mẫu của sàn mẫu sẽ thành «ngoài danh mục» từ lúc ấy.

Lối khác: bỏ hẳn gói mẫu, lệnh nạp mẫu đẩy gói qua cửa nhận. Sạch hơn nhưng chạm `packages/db/seed` (hạng T3), cần thêm sàn vào danh sách
tin và thoả thuận trên bản thật; làm chậm và có việc vận hành.

## Máy khách

Bảng hàng và hồ sơ căn đã đọc `GET /api/v1/catalog`, tra mã; khuôn trả không đổi nên không sửa màn.

## Không làm

Xoá căn vắng khỏi gói; gói cũ hơn gói đã nhận; danh mục lô thấp tầng (giữ nguồn hiện tại); khoá máy cho Invest.

## Đối chiếu ngành

Tên cột đã theo RESO (`SubdivisionName`, `BuildingName`, `UnitNumber`, `LivingArea`); hàng này không thêm trường. Không có màn mới.
