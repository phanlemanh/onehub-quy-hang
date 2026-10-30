# ADR-0003: Trang khách và luồng Gửi trên hành vi thật của Zalo — kết quả bài thử

Ngày: 2026-10-30 · Trạng thái: **đề xuất — chờ chủ kho chốt** · Liên quan: ADR-0001 mục «Chưa chốt» (trang khách),
Kiến trúc §1, §7, §9 bước 1 (c) · Số đo: `_acceptance/bai-thu-zalo/ket-qua.md`

## Bối cảnh

Kiến trúc §9 bước 1 (c) đòi trang khách và luồng Gửi đứng trên hành vi thật của Zalo trước khi dựng. Bài thử dựng một
máy chủ thử ngoài mã sản phẩm, mở ra mạng qua đường hầm, và để chủ kho thử với Zalo trên Android, iPhone và Zalo Web
ngày 30/10. Bốn vế của ngưỡng sống: ba vế đạt, một vế chưa đo được (`ket-qua.md` mục «Kết luận theo bốn vế»).

ADR này chỉ **đề xuất**. Mỗi việc nêu khuyến nghị, lối khác và giá; chủ kho chốt. Bất biến «người luôn là người bấm gửi»
(`AGENTS.md` mục 3) giữ nguyên ở mọi lối: không lối nào gửi tin qua Zalo hộ người.

## Bốn việc cần chốt

### 1. Cách đếm lượt mở

Số đo: máy của Zalo lấy trang với UA `WhatsApp/2`, lấy ảnh với UA `znetwork/8.14.1`, có lượt kèm
`facebookexternalhit/1.1`. Không lượt nào chạy JS. Với link K-6819 chỉ dán, không bấm: thước JS đếm 0, thước UA đếm 1.

- **Khuyến nghị:** một lượt mở = một lượt báo từ JS của trang khách khi trang chạy trên máy người, đếm một lần mỗi phiên.
  Danh sách UA máy là lưới thứ hai, chặn cả lượt báo từ trình duyệt không đầu; thêm `WhatsApp/` và `znetwork/` vào danh
  sách.
- **Lối khác:** đếm lượt tải trang ở máy chủ, lọc theo UA. Giá: mỗi link vừa gửi vào Zalo bị tính một lần mở mà không có
  khách nào mở (K-6819: 1). Danh sách UA phải đuổi theo Zalo mỗi khi Zalo đổi máy lấy xem trước.
- **Giá của khuyến nghị:** khách tắt JS hay mất mạng ngay sau khi tải thì không được đếm. Đổi lại, số mở là số người thật.

### 2. Thẻ và ảnh xem trước

Số đo: trang dựng ở máy chủ có đủ `og:title`, `og:description`, `og:image` (URL tuyệt đối), `og:url`, `og:type`,
`twitter:card`, ảnh PNG 1200×630 dưới 300 KB. Zalo Android và Zalo iPhone đều hiện thẻ đủ link · ảnh · mô tả. Chủ kho
khai: «Card bao gồm: Link · Ảnh · Mô tả: Mẫu căn - Toà....Tên sàn». Zalo Web không dựng thẻ cho link gửi từ web, với mọi
tên miền.

- **Khuyến nghị:** trang khách thật giữ đúng bộ thẻ và cỡ ảnh này, ảnh sinh theo bộ căn ở máy chủ. Hàng dựng trang khách
  trên Next.js chạy lại một phiên điện thoại ngắn (một link, hai máy) để xác nhận thẻ ra giống máy chủ thử.
- **Lối khác:** ảnh vuông hay nhỏ hơn để tải nhanh. Giá: chưa đo ở bài thử này — có thể Zalo hiện thẻ nhỏ hay không có
  ảnh.
- **Giới hạn đã biết:** người gửi link từ Zalo Web sẽ không thấy thẻ. Luồng Gửi trên máy tính nên kèm ảnh, không chỉ
  link (xem việc 3).

### 3. Chia sẻ trên iPhone

Số đo: Safari iPhone mở được bảng chia sẻ; «Gửi ảnh + tin» và «Gửi chỉ ảnh» trả «đã gửi», Zalo có trong bảng, nhận ảnh
và nhận tin. Chủ kho khai: «Gửi ảnh + Tin qua iphone đúng. Gửi chỉ ảnh -> Đúng. Gửi link + tin -> Bên iphone chỉ là
link». Bấm lần hai khi bảng còn mở thì trình duyệt báo lỗi.

- **Khuyến nghị:** luồng Gửi trên điện thoại chia sẻ **ảnh căn + tin**, đặt link trang khách trong phần tin. Khoá nút
  Gửi tới khi bảng chia sẻ đóng.
- **Lối khác:** chia sẻ link + tin như lệnh chia sẻ thường. Giá: Zalo iPhone chỉ nhận link, mất phần tin.
- **Còn mở:** ghi «Đã gửi» theo kết quả bảng chia sẻ trả về hay theo lúc người bấm. Bài thử có lượt trả «người huỷ» ở
  trình duyệt UA máy tính mà không rõ người có gửi hay không — chủ kho chọn; khuyến nghị theo kết quả trả về, kèm nút
  «Đã gửi» để người tự đánh dấu khi bảng báo huỷ.

### 4. Nhận ảnh từ Zalo trên máy tính

Số đo: chưa đo được. Trang thử kéo ảnh nhận 0 sự kiện. Zalo Web không có «Sao chép ảnh» trong menu ảnh. Kéo ảnh sang
tab khác chưa làm được trong một khung trình duyệt. App Zalo PC chưa thử.

Vế này **không đạt** ở bài thử. Các đường đi vòng để chủ kho chọn:

- **(a) Đo thêm một phiên ngắn** trên máy tính: kéo ảnh từ cửa sổ Zalo Web hay app Zalo PC sang một cửa sổ trình duyệt
  khác đang mở trang thử. Giá: khoảng 10 phút của chủ kho; trang thử đã sẵn (`/keo-anh`).
- **(b) «Lưu về máy» rồi thêm tệp** (chọn tệp hay kéo từ thư mục vào hồ sơ căn). Chắc chắn chạy trên mọi trình duyệt.
  Giá: thêm một bước so với kéo thẳng; Tham chiếu ghi «kéo hoặc dán» là đường chính, nên đổi sang đường này là đổi điều
  đang đúng.
- **(c) Chờ vỏ app gốc** (Kiến trúc §7). Giá: đầu chủ ngồi máy tính không có đường nhận ảnh nhanh tới khi có vỏ.

Khuyến nghị: làm (a) trước khi dựng hồ sơ căn. Hồ sơ căn luôn có (b) làm đường dự phòng, vì nó không phụ thuộc Zalo.

## Hệ quả

- Hàng dựng trang khách và luồng Gửi đọc ADR này sau khi chủ kho chốt; tới lúc đó Tham chiếu không đổi.
- Mã thử ở `_acceptance/bai-thu-zalo/thu/` không thành mã sản phẩm; danh sách UA máy và cách đếm chép sang lõi khi dựng.
- Giá của đường thử: mạng công ty chặn cả cloudflared lẫn localhost.run. Phiên thử với Zalo thật về sau cần điểm phát
  điện thoại, hoặc một bản dựng trên nơi chạy thật.
