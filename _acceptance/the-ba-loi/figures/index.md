# Hình tại điểm quyết định — the-ba-loi

| Điểm | Đếm | Hình |
|---|---|---|
| Hỏi-1 — bài «bỏ bước phân kỳ thì đỏ» chạy ở đâu | hai nhánh rẽ (bước chấm của vòng · CI mỗi PR) + năm bước nối tiếp của vòng | cho-chay-bai-ba-loi |
| Ba điều nhận «ô chưa có khuôn» (lệch spec gốc: không) | dưới ngưỡng: một bước, ba điều song song | — |

## Đề bài: cho-chay-bai-ba-loi

- Loại hình: luồng (flowchart) trái → phải.
- Nút: «Vòng giao diện mở» → «Có ô chưa có khuôn? (nhóm mới · đổi khối đích · chỗ hở mới)» → nhánh Không: «Đi khuôn sẵn — không cần trang» ; nhánh Có: «Dựng trang ba lối (--ba-loi → chụp 6 ảnh → điền chữ → --dung-ba-loi)» → «Gửi kèm thẻ Cổng Phạm vi» → «Bước chấm: --kiem-ba-loi».
- Hai nhánh của Hỏi-1 ở cuối: «Khuyên: bước chấm của vòng + lint bắt trang đã mở mà thiếu/sai» và «Lối khác: thêm bước CI so nhánh gốc mỗi PR (chậm hơn, sửa ci.yml)».
- AC liên quan: AC-5, AC-6, AC-7, AC-9.
