# Kết quả bài thử đồng bộ — 30/10/2026

Lần chạy: `thu-2026-10-30T07-55-14-429Z` (giám sát khởi chạy, cổng 3464, đường hầm cloudflared qua điểm phát của
iPhone). Thiết bị thử: iPhone iOS 18.7, Safari. Bảng dưới do `thu/tom-tat.mjs` tính từ `nhat-ky-dong-bo.jsonl` (bản
sạch, không băm IP), không chép tay.

Bằng chứng máy (bài kiểm `thu/dong-bo.test.mjs`, Postgres dãy T có luật theo dòng): 28 ca xanh — bốn vai mẫu kéo về chỉ
dòng sàn mình; tập số chủ bằng đúng ma trận vai, quét toàn văn; truy vấn chạy bằng vai `quy_hang_app` không vượt luật
theo dòng; tắt luật theo dòng thì lộ dòng sàn khác (phá thử đỏ); hàng đợi giữ 5 thao tác khi mất mạng, nạp lại còn đủ,
nối lại thì áp đúng thứ tự; gửi lại không trùng; ghi sai sàn bị từ chối.

## Kết luận phiên thật theo luật viết trước

- Vế 1 — không đạt: phiên thật chỉ có một lần kéo về (Đầu chủ A1), chưa đủ ba vai. Lần kéo đó sạch: 4 căn sàn A, đúng
  2 số chủ của căn A1 giữ, chạy bằng vai `quy_hang_app`.
- Vế 2 — không đạt: chưa đo được. Không có thao tác nào lên máy chủ; không có sự kiện «bật mạng».

## Chuyện gì đã xảy ra ở phiên thật

- Đầu chủ A1 kéo về lúc 14:56:55 (giờ Việt Nam), rồi bật chế độ máy bay và bấm đổi giá 5 lần. Trang giữ 5 thay đổi trên
  máy suốt hơn 15 phút mất mạng.
- iPhone vừa là máy thử vừa là điểm phát của Mac. Bật chế độ máy bay làm Mac mất mạng và rơi về mạng công ty — nơi chặn
  đường hầm — nên đường hầm không nối lại được (0 kết nối), link công khai mất.
- Khi tắt chế độ máy bay, trang vẫn báo «mất mạng» dù điện thoại đã có 4G: iPhone không phát sự kiện «có mạng» cho trang
  khi người rời Safari để đổi chế độ máy bay. Trang đã sửa để kiểm thêm khi quay lại trang và định kỳ.
- Hàng đợi lưu theo địa chỉ trang, nên 5 thay đổi còn trên iPhone không lên được qua link mới.
- Chủ kho quyết không làm lại ở bài thử này; vế mất mạng đo lại khi dựng tính năng đồng bộ thật (sổ quyết định).

## Bảng máy tính

<!-- dem -->
### Kết luận

| Vế | Điều | Kết quả | Số |
| --- | --- | --- | --- |
| 1 | Mỗi người chỉ nhận đúng phần của mình (sàn và số chủ) | không đạt | 1 lần kéo, vai đã kéo: a1 · chưa đủ ba vai (đầu chủ A, trưởng nhóm A, đầu chủ B) kéo về |
| 2 | Mất mạng ≥ 5 phút rồi nối lại: mọi thay đổi lên đúng thứ tự | không đạt | không có khoảng mất mạng |

### Các lần kéo về

| Người | Vai CSDL | Số căn | Sàn nhận | Số chủ nhận | Sạch |
| --- | --- | --- | --- | --- | --- |
| a1 | quy_hang_app | 4 | A | 0900 000 001, 0900 000 002 | có |

### Khoảng mất mạng

| Người | Từ | Đến | Giây | Thao tác trong khoảng | Đúng thứ tự |
| --- | --- | --- | --- | --- | --- |

### Các lô đẩy lên

| Người | client_seq | Kết cục | seq máy chủ | Tạo lúc |
| --- | --- | --- | --- | --- |
<!-- /dem -->
