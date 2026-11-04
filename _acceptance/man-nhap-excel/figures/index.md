# Hình tại điểm quyết định — man-nhap-excel

| Điểm | Đếm | Hình |
| --- | --- | --- |
| Hỏi-1 — tệp .xls | dưới ngưỡng: 1 bước, 2 lối không rẽ luồng | — |
| Hỏi-2 — Trưởng nhóm nhập hộ | cần hình: 4 bước nối tiếp (chọn đầu chủ → gói mang agentUserId → máy chủ kiểm đầu chủ → dòng thuộc đầu chủ) và 2 nhánh rẽ theo vai | `truong-nhom-nhap-ho.html` |
| Hỏi-3 — lối giao diện | dưới ngưỡng: trang ba lối là hình | `../ba-loi/index.html` |
| Hỏi-4 — dòng trùng hàng đã có | dưới ngưỡng: luật đã chốt ở hàng 65a, màn chỉ trình | — |
| Hỏi-5 — cỡ một lần nhập | dưới ngưỡng: một con số | — |

## Đề bài: truong-nhom-nhap-ho

- Loại: sơ đồ luồng có hai làn (Đầu chủ · Trưởng nhóm), MỘT nhánh rẽ theo vai ở đầu.
- Nút: «Mở Nhập Excel» → rẽ: [Đầu chủ] «dòng thuộc chính mình» · [Trưởng nhóm] «chọn một đầu chủ của sàn (danh sách từ máy
  chủ: mã người, tên)» → «mọi dòng gửi agentUserId của người được chọn» → «máy chủ kiểm người ấy là Đầu chủ của sàn» →
  «hàng mới thuộc đầu chủ được chọn; người tạo là Trưởng nhóm».
- Nhánh phụ: đầu chủ không hợp lệ → dòng bỏ «chưa có đầu chủ giữ căn».
- AC liên quan: AC-8.
