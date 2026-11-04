# Hình tại điểm quyết định — cau-hinh-theo-san

| Điểm | Đếm | Hình |
| --- | --- | --- |
| Nhật ký sinh bằng trigger (ba lối ghi hội vào một bảng) | hai bước nối tiếp (ghi bản hiện hành → trigger thêm sự kiện), không rẽ — dưới ngưỡng | — |
| Lớp dữ liệu chặn source ở cơ sở dữ liệu | một bước — dưới ngưỡng | — |
| PATCH nhiều khoá, nguyên khối | hai bước (kiểm cả lệnh → ghi từng khoá) — dưới ngưỡng | — |
| Cặp hạn không áp im lặng | hai nhánh rẽ (lối ghi: từ chối · lối đọc: báo và về mặc định / dừng chia lead) — cần hình | cap-han.html |
| Không chép bù sự kiện khởi đầu | một bước — dưới ngưỡng | — |

## Đề bài: cap-han

- Loại hình: luồng rẽ nhánh (flowchart), dọc.
- Nút: «Sàn gửi hạn nhận 60 (hạn gọi đang 30)» → rẽ hai lối: (1) «Lối đổi chung PATCH» → «400 nêu hai khoá, không ghi»;
  (2) «Dòng có từ trước trong bảng» → «Bộ giải chung: báo lỗi nêu hai khoá, cặp về 15/30» và «Bộ đọc chia lead: dừng,
  lỗi nêu hai khoá». Nút kết chung: «Không lối nào áp 60 với 30». Nhánh phụ: «Gửi cả cặp 45 / 60 cùng lệnh» → «Nhận».
- AC liên quan: AC-5 (luật đợt 46, Ngoài-5 hàng 81).
