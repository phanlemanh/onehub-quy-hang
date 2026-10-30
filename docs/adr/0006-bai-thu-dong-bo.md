# ADR-0006: Chọn bộ đồng bộ — kết quả bài thử mất mạng

Ngày: 2026-10-30 · Trạng thái: **đề xuất — chờ chủ kho chốt** · Liên quan: ADR-0001 mục «Chưa chốt» (bộ đồng bộ),
Kiến trúc §1 «Nhanh tức thì, ghi trên máy trước», §9 bước 1 (b), §10 · Số đo: `_acceptance/bai-thu-dong-bo-mat-mang/ket-qua.md`

## Bối cảnh

Kiến trúc dòng 156 ghi «Thử trước: PowerSync là ứng viên chính, ElectricSQL là phụ. Không đạt thì tự làm mỏng». Ở Cổng
Phạm vi, chủ kho chọn dựng bộ tự làm mỏng và đo nó; PowerSync và ElectricSQL so bằng tài liệu công bố. Ngưỡng sống: hai
sàn, ba vai, không dòng sàn kia và không số chủ của đầu chủ khác xuống máy; mất mạng năm phút rồi nối lại mọi thay đổi
lên đúng thứ tự.

Đã đo (`ket-qua.md`): 34 ca máy trên Postgres có luật theo dòng đều xanh — cách ly sàn và số chủ đến từ cơ sở dữ liệu,
hàng đợi giữ và áp đúng thứ tự, gửi lại không trùng, ghi sai sàn bị từ chối. Phiên điện thoại thật: một lần kéo sạch,
iPhone giữ 5 thay đổi qua hơn 15 phút mất mạng; vế mất mạng **chưa đo được** trên thiết bị (đường hầm mất vì iPhone vừa
là máy thử vừa là điểm phát) — chủ kho quyết đo lại khi dựng tính năng thật.

ADR này chỉ **đề xuất**; chủ kho chốt. Bất biến 1 (cách ly giữa công ty) và 2 (thông tin chủ nhà không rời công ty) của
`AGENTS.md` là tiêu chí loại, không phải tiêu chí cân.

## So ba lối

Mỗi ô mang một nhãn: **Đo** = số đo của bài thử, trỏ `ket-qua.md`; **Chưa đo (tài liệu)** = hiểu biết từ tài liệu công
bố của bên làm, bài thử không dựng lối đó; **Chưa đo (suy luận)** = suy từ thiết kế của bài thử, chưa có số.

| | Tự làm mỏng | PowerSync | ElectricSQL |
| --- | --- | --- | --- |
| Cách ly sàn | **Đo** (ket-qua.md): luật theo dòng của Postgres, một chỗ; kéo chạy bằng vai `quy_hang_app` không vượt luật | **Chưa đo (tài liệu)**: đọc nhật ký sao chép, cách ly viết lại bằng sync rules/bucket theo tham số trong JWT | **Chưa đo (tài liệu)**: đọc nhật ký sao chép, cách ly là điều kiện `where` của shape, máy chủ proxy phải tự gắn |
| Số chủ theo vai | **Đo** (ket-qua.md): luật riêng của bảng số chủ; số chủ không đi qua sổ thay đổi | **Chưa đo (tài liệu)**: phải có bucket riêng theo người; sai tham số là lộ | **Chưa đo (tài liệu)**: shape riêng theo người, cùng rủi ro |
| Hàng đợi ghi khi mất mạng | **Đo bằng máy** (ket-qua.md): giữ thứ tự, nạp lại còn đủ, áp đúng thứ tự, thao tác lỗi dừng phần sau của lô, không trùng; **thiết bị: giữ qua 15 phút, nối lại chưa đo** | **Chưa đo (tài liệu)**: có sẵn hàng đợi tải lên; ghi vẫn qua API của mình | **Chưa đo (tài liệu)**: không có hàng đợi ghi — tự làm như bộ mỏng |
| Kho trên máy | **Đo** (ket-qua.md): localStorage trong bài thử giữ hàng đợi qua tải lại; **Chưa đo (suy luận)**: bản thật cần IndexedDB | **Chưa đo (tài liệu)**: SQLite trên máy (WASM), truy vấn cục bộ mạnh | **Chưa đo (tài liệu)**: không có — tự làm |
| Vận hành | **Chưa đo (suy luận)**: không thêm dịch vụ; tự giữ kênh thời gian thực (Supabase) | **Chưa đo (tài liệu)**: thêm dịch vụ PowerSync + kho bucket, có phí | **Chưa đo (tài liệu)**: thêm dịch vụ Electric |

## Bốn việc cần chốt

### 1. Bộ đồng bộ

- **Khuyến nghị:** tự làm mỏng — kéo qua API dưới luật theo dòng, hàng đợi ghi có khoá chống trùng, kênh thời gian
  thực chỉ để báo «có thay đổi, kéo về». Căn cứ: cách ly sàn và số chủ chỉ đo được ở lối này (ket-qua.md, bằng chứng
  máy), và nó giữ bất biến 1–2 ở đúng một chỗ.
- **Lối khác:** PowerSync như Kiến trúc dòng 156. Giá: cách ly viết lại lần hai trong sync rules — một chỗ thứ hai phải
  giữ khớp với luật theo dòng, sai là lộ số chủ; thêm dịch vụ có phí. Nên đo trước khi chọn: dựng PowerSync bằng
  container với cùng bốn vai mẫu và chạy cùng bài kiểm `dong-bo.test.mjs`.
- **Giá của khuyến nghị:** tự viết và giữ phần truy vấn trên máy mà PowerSync cho sẵn; «nhanh tức thì» phụ thuộc kho
  IndexedDB tự làm.

### 2. Phát hiện «có mạng lại» trên iPhone

Số đo: iPhone không báo sự kiện «có mạng» cho trang khi người rời Safari để đổi chế độ máy bay (ket-qua.md).

- **Khuyến nghị:** không dựa riêng vào sự kiện của trình duyệt — kiểm thêm khi quay lại trang và thử đẩy định kỳ; coi
  một lần đẩy thành công là «có mạng». Trang thử đã làm vậy.
- **Lối khác:** chỉ dùng sự kiện trình duyệt. Giá: hàng đợi nằm im tới khi người tải lại trang.

### 3. Nơi lưu hàng đợi

Số đo: hàng đợi lưu theo địa chỉ trang, nên đổi địa chỉ (link mới) là mất đường lấy hàng đợi cũ (ket-qua.md).

- **Khuyến nghị:** sản phẩm dùng một tên miền cố định cho app; hàng đợi trong IndexedDB gắn với người dùng.
- **Lối khác:** hàng đợi trong localStorage như bài thử. Giá: dung lượng nhỏ, dễ bị hệ điều hành dọn trên iPhone.

### 4. Đo lại vế mất mạng

Vế «mất mạng năm phút rồi nối lại» chưa có số đo trên thiết bị. Các đường để chủ kho chọn:

- **(a) Đo ở hàng dựng phần đồng bộ** (chủ kho đã chọn): cùng bài kiểm, trên tên miền thật, điện thoại không làm điểm
  phát. Giá: quyết định bộ đồng bộ dựa trên bằng chứng máy cho vế này.
- **(b) Đo lại ngay trên Safari máy tính**, tắt Wi-Fi 5 phút với máy chủ chạy trên chính máy. Giá: khoảng 7 phút; không
  bắt được hành vi riêng của iPhone.
- **(c) Đo bằng máy thứ hai** làm máy thử, điện thoại giữ điểm phát. Giá: cần thêm thiết bị.

## Hệ quả

- Mã thử ở `_acceptance/bai-thu-dong-bo-mat-mang/thu/` không thành mã sản phẩm; bảng mẫu thành migration thật kèm ca
  trong bộ kiểm cách ly ở hàng dựng.
- Kiến trúc dòng 156 và §10 đổi khi chủ kho chốt ADR này.
- Giá của đường thử: mạng công ty chặn đường hầm; phiên thiết bị cần một mạng không chặn hoặc một bản dựng trên nơi chạy
  thật.
