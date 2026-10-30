# Thẻ Cổng Đáng — năm hàng đợt nen-2

Một lần ngồi, năm quyết định: mỗi hàng có đáng dựng không. Ô quyết để `___` — máy không điền. Mỗi hàng nhận một trong
bốn chữ: `build` (dựng) · `iterate` (làm lại ý trước khi dựng) · `park` (gác, chưa làm) · `kill` (bỏ).

Cả năm là hàng T3 (chạm cơ sở dữ liệu, trần lớp dữ liệu, thoả thuận hoặc khuôn cấp vào), nên Cổng Phạm vi và Cổng
Bằng chứng vẫn cần chữ ký riêng từng hàng về sau. Máy ước mỗi hàng 7–10 giờ máy; chưa có ngày đích.

Hàng không `build` thì không vào đợt; hàng đứng sau nó cũng không chạy được (cột «Đứng trên»).

| # | Hàng | Người dùng được gì | Đứng trên | Dãy | Quyết |
|---|---|---|---|---|---|
| 11 | Lớp trường nguồn | Đầu chủ giữ căn thấy chủ nhà, số điện thoại, giá đáy của căn mình; người khác cùng sàn mở hồ sơ thì không thấy; mỗi lần mở số chủ được ghi lại | 8 | N | `___` |
| 12 | Trục ai thấy hàng | Lead và hàng chưa khoá nguồn để «Chỉ tôi»; lên «Toàn sàn» thì cả sàn mới thấy | 8 | A | `___` |
| 9 | Gõ mã căn | Đầu chủ gõ mã căn, thuộc tính căn tự điền theo cách đọc mã của dự án; mã chưa có thì báo rõ | 5, 8 | D | `___` |
| 13 | Nhanh tức thì | Bảng hàng và hồ sơ mở, lọc, cuộn không chờ mạng; sửa ghi trên máy trước, rớt mạng vài phút không mất thay đổi | 2, 11, 12 | N | `___` |
| 10 | Nhận danh mục Invest | Danh mục dự án từ OneHub Invest tự vào khi thoả thuận đang bật; gói sai khuôn hay thoả thuận tắt thì bị từ chối | 9 | D | `___` |

Thứ tự trong bảng là thứ tự ưu tiên khi các dãy tranh lượt chấm (đường găng).

## Điều cần biết trước khi quyết

- **Hàng 11 và 12 mở khoá phần lớn các màn sau.** Hàng 13 cần cả hai; nhiều màn ở các đợt kế (ví dụ hàng 18, 23, 31)
  đứng trên 11 hoặc 12. Gác một trong hai là gác hàng 13.
- **Hàng 9 hỏi lại danh mục và dự án thử** (Mạnh 29/10). Quyết `build` nghĩa là chấp nhận dựng trên dự án mẫu của
  hàng 5; dự án thử thật chọn trong vòng của hàng này.
- **Hàng 10 nhận theo khuôn phiên bản 1, mà khuôn đang ở phiên bản 0** (ADR-0017 §5). Phiên bản 1 chưa chốt với phía
  Invest thì hàng tự đặt khuôn nhận, phía Invest đẩy theo sau.
- **Hàng 13 đứng trên kết luận bài thử đồng bộ (hàng 2).** Bài thử chưa xong thì hàng 13 chỉ chờ, không tốn gì; quyết
  `build` bây giờ không ràng buộc bộ đồng bộ nào.
- Ngưỡng sống / chết đề xuất của từng hàng ghi trong ô cơ hội (`_acceptance/<slug>/opportunity.md`), dòng `[đề xuất]`;
  ô timebox còn trống — có thể điền cùng lúc quyết, hoặc để vòng của hàng hỏi.

## Trả lời

Một dòng, chép rồi thay `___`:

```text
11 ___ · 12 ___ · 9 ___ · 13 ___ · 10 ___
```

Máy chép đúng chữ người gõ vào ô cơ hội của từng hàng (`decision`, `decided_by`, `decided_at`, `stage: decided`),
như đã làm với chín hàng đợt nen-dau.
