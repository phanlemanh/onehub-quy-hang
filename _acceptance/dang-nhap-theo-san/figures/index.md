# Hình tại điểm quyết định — dang-nhap-theo-san

| Điểm | Đếm | Hình |
|---|---|---|
| Hỏi-1 · cách đăng nhập | 3 bước nối tiếp (email → mã → phiên), 1 nhánh (mã sai/hết) | dưới ngưỡng gộp vào hình 1 |
| Hỏi-2 · danh tính ở better-auth, thành viên ở bảng của mình | 4 nhánh khi chọn sàn đang làm (0 · 1 · nhiều chưa chọn · cookie) | cần hình: `vao-san.html` |
| Hỏi-3 · màn tối giản hay auth-15 | 2 lối, không bước | dưới ngưỡng: 0 bước, 2 lối không rẽ tiếp |
| Sổ: schema auth tách khỏi public | 1 bước | dưới ngưỡng |

## Đề bài hình 1 — `vao-san`

- Loại: flowchart (luồng quyết định)
- Nút: Người mở app → Đăng nhập (email → mã 6 số) → Phiên → API đọc danh sách sàn của người (giao dịch có app.user_id) → rẽ 4 nhánh: 0 sàn → «403 chua-gan-san / màn Chưa gắn sàn» · 1 sàn → sàn đó · nhiều sàn + cookie qh_san là sàn mình → sàn đó · nhiều sàn chưa chọn → «409 chon-san / màn Chọn sàn» → mọi nhánh có sàn → withCompany: set role quy_hang_app + app.company_id → Postgres luật theo dòng
- Nhãn bằng chữ tiếng Việt; tô riêng hai hộp: «better-auth: danh tính (schema auth)» và «Quỹ hàng: company_members (luật theo dòng)» để thấy ranh Hỏi-2
- AC liên quan: AC-2, AC-3, AC-4, AC-5, AC-7
