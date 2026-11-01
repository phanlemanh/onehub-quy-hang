# Vá ảnh bản thật — thiết kế (hàng va-anh-ban-that, dãy H)

Hàng phát sinh từ Cổng Bằng chứng hàng 18 (`_acceptance/anh-can-ba-ngan/`, chủ kho 01/11 chọn «mở hợp đồng mới» cho ba
mục). Phải xong trước hai tuần thử. Không đổi cơ sở dữ liệu (T2).

| Mục hàng 18 | Lỗi ở bản thật | Cách vá |
|---|---|---|
| Ngoài-6 | Ảnh 4,5–10 MB không tải lên được: hàm Vercel từ chối thân yêu cầu > 4,5 MB trước khi tới API | Bản gốc đi thẳng lên kho ảnh bằng link ký tải lên (Hỏi-1) |
| Ngoài-8 | Phản hồi chuyển hướng tới link ký 60 giây được giữ đệm 300 giây → mở lại hồ sơ sau 1 phút thấy ảnh vỡ | Phản hồi chuyển hướng không giữ đệm (`private, no-store`, Hỏi-2); phản hồi byte (bản Postgres) giữ như cũ |
| Ngoài-10 | Sửa, xoá ảnh thất bại thì im lặng | Báo bằng thông báo nổi (sonner, như sửa trên ô ở Bảng hàng): «Không <việc> được — thử lại» |

Ngoài-9 (byte mồ côi khi lỗi giữa chừng) chủ kho giữ ở hạn chế đã biết — không vào hàng này.

## 1. Tải bản gốc thẳng lên kho ảnh (Hỏi-1)

Khuyến nghị: **link ký tải lên** — giữ nguyên byte bản gốc (Tham chiếu ghi chép 28/10 luật 6: «Giữ bản gốc, gửi bản
nhẹ … bản gốc giữ để in hoặc đăng Platform»).

1. Trình duyệt `POST /api/v1/units/photos/upload-url` với toà, mã, ngăn, cỡ, loại khai. API kiểm quyền thêm ảnh
   (`app.can_see_unit_internal` dưới luật theo dòng — cùng luật với lệnh thêm), kiểm cỡ ≤ 10 MB và loại khai, sinh mã ảnh
   mới, trả link PUT ký 60 giây cho đúng đối tượng `<company_id>/<photo_id>/original`. Bản Postgres (dev, CI) trả
   `{ truc_tiep: false }` — đi đường cũ.
2. Trình duyệt PUT bản gốc lên link ấy (không qua Vercel).
3. Trình duyệt `POST /api/v1/units/photos` như cũ nhưng mang `photoId` thay cho tệp gốc (bản nhẹ ≤ 1 MB vẫn qua API). API
   đọc đầu đối tượng trên kho (GET có Range 0–63 ký bằng khoá máy chủ) để kiểm byte đầu là ảnh và cỡ thật ≤ 10 MB, rồi
   mới ghi dòng ảnh, bản nhẹ và sự kiện. Đối tượng sai loại hay quá cỡ bị xoá, API trả 400 như cũ.

Đối tượng tải lên mà bước 3 không bao giờ tới (đóng trang giữa chừng) nằm lại kho riêng tư — cùng lớp hạn chế Ngoài-9
chủ kho đã giữ. Lối khác: **thu nhỏ bản gốc trên trình duyệt** xuống dưới 4 MB rồi gửi qua API — một đường, không link
ký tải lên, nhưng mất bản gốc nguyên độ phân giải.

## Thử trên kho ảnh thật (Hỏi-3)

Máy không có khoá Storage thật. Lượt chấm đo đường tải thẳng bằng máy chủ S3 giả và bài kiểm phía web. Bản xem trước
chưa đăng nhập được (ADR-0009), nên chủ kho chạy `_acceptance/va-anh-ban-that/thu/khoi-storage.mjs` một lần trên máy mình
với ba khoá ở `.env.local`: ký link PUT bằng mô-đun `kho-s3`, PUT 8 MB, hỏi CORS (OPTIONS kèm Origin tên miền chính), GET
Range, xoá — dán kết quả vào PR trước khi gộp. Chưa chạy được thì gộp với hạn chế đã biết.

## 2. Ranh giới mã

- `packages/api/src/photos/kho-s3.ts` — `kyLinkPut`, `docDau` (GET Range); `kho.ts` — `kyLinkTaiLen`, `kiemBanGoc` trên
  giao diện `KhoAnh` (bản Postgres trả null); `store.ts`, `routes.ts` — lệnh `upload-url`, POST nhận `photoId`, phản hồi
  chuyển hướng `no-store`.
- `apps/web/src/app/(app)/units/photos/` — `nguon-api.ts` đi ba bước khi có link; `muc-anh.tsx` báo lỗi sửa/xoá bằng
  `toast`.
- Không migration, không đổi lõi lớp dữ liệu.

## Đặc tả UX

<!-- ux-spec:start -->
### Khuôn IA đã chọn + căn cứ

Không đổi bố cục mục Ảnh (khuôn `ho-so-can`). Thông báo lỗi dùng `toast` của sonner như trình sửa trên ô
(`inventory/cell-edit/tren-o.tsx`).

### Màn và trạng thái

| Trạng thái | Thấy gì |
|---|---|
| Ảnh 4,5–10 MB đang tải | Ô chờ như ảnh nhỏ |
| Sửa/xoá ảnh lỗi | Thông báo nổi theo việc: «Không đặt ảnh bìa được — thử lại», «Không đánh dấu ảnh mẫu được — thử lại», «Không chuyển ngăn được — thử lại», «Không đổi thứ tự được — thử lại», «Không xoá ảnh được — thử lại»; ảnh về như trước |
<!-- ux-spec:end -->
