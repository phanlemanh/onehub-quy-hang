# Hình tại điểm quyết định — moi-nguoi-vai-khu

| Điểm | Đếm | Hình |
|---|---|---|
| Hỏi-1 + Hỏi-4 · mời vào ngay, được tạo tài khoản | 3 nhánh (email mới · đã có tài khoản ở sàn khác · đã là thành viên) + 3 bước nối tiếp | cần hình: `luong-moi.html` |
| Hỏi-2 · khu là tên sàn tự đặt | 2 lối, không bước | dưới ngưỡng |
| Hỏi-3 · chỉ quản trị xem danh sách | 2 lối | dưới ngưỡng |
| Hỏi-5 · ghép hay khối Pro | 2 lối | dưới ngưỡng |

## Đề bài hình 1 — `luong-moi`

- Loại: flowchart
- Nút: Quản trị sàn A nhập email + vai + khu → «Email đã là thành viên của A?» có → «409 da-la-thanh-vien, không đổi gì»; không → «Email đã có tài khoản?» không → tạo tài khoản (danh tính) ; có → dùng tài khoản cũ → hai nhánh hợp: gắn thành viên A với vai, khu → trả cùng một câu 201 (quản trị không biết nhánh nào) → người được mời xin mã, nhập mã → vào sàn A (một sàn) hoặc màn Chọn sàn (đang ở sàn khác)
- Tô riêng hộp «trả cùng một câu 201» (chống dò) và nhãn Hỏi-1 (vào ngay, không bước nhận lời), Hỏi-4 (được tạo tài khoản, gắn người sàn khác)
- AC liên quan: AC-1, AC-2, AC-5
