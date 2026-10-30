# Kết quả bài thử Zalo — 30/10/2026

Lần chạy tính kết quả: `thu-2026-10-30T02-46-40-813Z` (cổng 3464, mã `A-6819`, `I-6819`, `K-6819`, trang chia sẻ dùng mã
`CS`), 39 sự kiện, 09:46–10:08 giờ Việt Nam. Đường hầm cloudflared qua điểm phát của điện thoại. Mạng công ty chặn đường
hầm: QUIC và TLS tới cổng 7844 bị cắt, ssh tới localhost.run cũng không lên. Các lần chạy 02-32 đến 02-45 không có đường
hầm sống, nên không dùng.

Thiết bị (đọc từ UA của lượt mở): Android 16 có Zalo android/260801903, iPhone iOS 18.7 có Zalo iOS/261002802 và Safari.
Phần máy tính đo trên Zalo Web (chat.zalo.me) do giám sát lái thay; app Zalo PC chưa đo.

Bảng dưới do `thu/tom-tat.mjs` tính từ `nhat-ky-zalo.jsonl` (bản sạch: đã bỏ băm IP), không chép tay. Bài kiểm
`thu/ket-qua.test.mjs` đỏ khi bảng lệch nhật ký.

## Kết luận theo bốn vế của ngưỡng sống

- Vế 1 — đạt: ảnh xem trước hiện trên Zalo Android và Zalo iPhone. Câu trả lời «có ảnh» bấm từ Android 1 lần, từ iPhone
  1 lần; ảnh của cả hai mã đã được máy Zalo tải (A-6819: 1 lượt, I-6819: 2 lượt). Chủ kho khai thêm về thẻ: «Card bao
  gồm: Link · Ảnh · Mô tả: Mẫu căn - Toà....Tên sàn».
- Vế 2 — đạt: lượt Zalo tự lấy không vào số mở. Link K-6819 chỉ dán, không bấm: tải trang 2, tải ảnh 2, mở 0. Link A,
  I sau khi bấm: mở 2 mỗi link (lần mở lại để bấm trả lời tính là phiên mới).
- Vế 3 — đạt: Safari trên iPhone mở được bảng chia sẻ và gửi ảnh + tin sang Zalo. Gửi kèm tệp trả «đã gửi» 2 lần
  (ảnh + tin, chỉ ảnh); câu trả lời «Zalo có trong bảng», «Zalo nhận ảnh», «Zalo nhận tin» đều «có», 2 lượt mỗi câu.
  Chủ kho khai: «Gửi ảnh + Tin qua iphone đúng. Gửi chỉ ảnh -> Đúng. Gửi link + tin -> Bên iphone chỉ là link», và «TÔi
  thấy có đầy đủ».
- Vế 4 — không đạt: chưa đo được. Trang thử kéo ảnh nhận 0 sự kiện. Trên Zalo Web, menu chuột phải của ảnh chỉ có Trả
  lời · Chia sẻ · Lưu về máy · Đánh dấu · Chọn nhiều · Xoá, không có «Sao chép ảnh». Giám sát không kéo được ảnh sang
  tab khác trong một khung trình duyệt. App Zalo PC chưa thử.

## Điều đo được ngoài bốn vế

- **Máy của Zalo không tự xưng là máy.** Lượt lấy trang để dựng thẻ mang UA `WhatsApp/2`, lượt lấy ảnh mang UA
  `znetwork/8.14.1`. Cả hai lọt bộ lọc UA dựng theo các máy lấy xem trước có tên. Thêm một lượt mang UA Safari iOS 26
  kèm `facebookexternalhit/1.1` (lần đầu của I-6819 và một lượt của K-6819). Không lượt nào trong số đó chạy JS của
  trang.
- **Hệ quả cho cách đếm.** Thước UA (lượt tải trang lớp người) đếm K-6819 là 1, tức một lần mở mà không có ai mở. Thước
  JS (lượt báo từ trang chạy trên máy người) đếm K-6819 là 0.
- **Zalo Web không dựng thẻ xem trước** cho link gửi từ web, với mọi tên miền (đối chứng: vnexpress.net cũng chỉ hiện
  chữ). Máy chủ thử ghi 0 lượt ghé trong hơn 2 phút sau khi gửi từ Zalo Web.
- **Gửi link + tin** từ Safari iPhone: bảng chia sẻ trả «đã gửi» 2 lần, nhưng chủ kho khai bên Zalo chỉ nhận link, mất
  phần tin.
- **Kết cục bảng chia sẻ ở trình duyệt UA máy tính** (Safari macOS 26.6): bấm «Gửi ảnh + tin» lần hai khi bảng còn mở
  ra `InvalidStateError`, rồi `AbortError`; «Gửi chỉ ảnh» và «Gửi link + tin» trả «đã gửi». Không rõ lượt này là máy
  Mac hay iPhone ở chế độ máy tính.
- **Giá của đường thử:** mạng công ty chặn cả cloudflared lẫn localhost.run; phiên phải chạy qua điểm phát điện thoại.

## Bảng máy tính

<!-- dem -->
### Kết luận theo bốn vế

| Vế | Điều | Kết quả | Số |
| --- | --- | --- | --- |
| 1 | Ảnh xem trước hiện trên Zalo Android và iPhone | đạt | «có ảnh» từ Android 1, từ iPhone 1 |
| 2 | Lượt Zalo tự lấy không vào số mở | đạt | K-6819: tải trang 2, tải ảnh 2, mở 0 · A-6819: tải trang 3, tải ảnh 1, mở 2; I-6819: tải trang 5, tải ảnh 2, mở 2 |
| 3 | iPhone chia sẻ ảnh + tin sang Zalo qua bảng chia sẻ | đạt | đã gửi kèm tệp 2, Zalo nhận ảnh có, Zalo nhận tin có |
| 4 | Kéo hoặc dán ảnh từ Zalo máy tính vào trình duyệt | không đạt | nhận được tệp ảnh 0 (—) |

### Đếm theo mã

| Mã | Tải trang | Tải trang (người) | Tải ảnh | Mở | Mở bị loại | UA lớp máy |
| --- | --- | --- | --- | --- | --- | --- |
| A-6819 | 3 | 3 | 1 | 2 | 0 | — |
| CS | 0 | 0 | 2 | 0 | 0 | — |
| I-6819 | 5 | 4 | 2 | 2 | 0 | Mozilla/5.0 (iPhone; CPU iPhone OS 26_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.0 Mobile/15E148 Safari/604.1 facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php) |
| K-6819 | 2 | 1 | 2 | 0 | 0 | Mozilla/5.0 (iPhone; CPU iPhone OS 26_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.0 Mobile/15E148 Safari/604.1 facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php) |

### UA của các lượt tải không kèm lượt mở

| UA | Lớp | Zalo | Lượt |
| --- | --- | --- | --- |
| Mozilla/5.0 (iPhone; CPU iPhone OS 26_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.0 Mobile/15E148 Safari/604.1 facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php) | may | không | 2 |
| Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.6.2 Safari/605.1.15 | nguoi | không | 1 |
| Mozilla/5.0 (Macintosh; Intel Mac OS X 14_7_2) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36 | nguoi | không | 1 |
| WhatsApp/2 | nguoi | không | 3 |
| znetwork/8.14.1 | nguoi | không | 5 |

### Chia sẻ

| Thiết bị | Nút | Cách | Kết cục | Lượt |
| --- | --- | --- | --- | --- |
| iPhone | anh-tin | tep | da-gui | 1 |
| iPhone | chi-anh | tep | da-gui | 1 |
| Máy tính | anh-tin | tep | huy (AbortError) | 1 |
| Máy tính | anh-tin | tep | loi (InvalidStateError) | 1 |
| Máy tính | chi-anh | tep | da-gui | 1 |
| Máy tính | link-tin | link | da-gui | 2 |

### Nhận ảnh

| Thiết bị | Cách | Có tệp ảnh | Kiểu | Kiểu dữ liệu kéo | Nguồn URI | Lượt |
| --- | --- | --- | --- | --- | --- | --- |

### Câu trả lời của người thử

| Thiết bị | Trang | Câu | Trả lời | Lượt |
| --- | --- | --- | --- | --- |
| Android | s | tieu-de | co | 2 |
| Android | s | xem-truoc | co-anh | 1 |
| iPhone | chia-se | zalo-nhan-anh | co | 2 |
| iPhone | chia-se | zalo-nhan-tin | co | 2 |
| iPhone | chia-se | zalo-trong-bang | co | 2 |
| iPhone | s | tieu-de | co | 1 |
| iPhone | s | xem-truoc | co-anh | 1 |
<!-- /dem -->
