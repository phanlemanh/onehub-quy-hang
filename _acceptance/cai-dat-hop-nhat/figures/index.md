# Hình tại điểm quyết định — cai-dat-hop-nhat

| Điểm | Đếm | Hình |
|---|---|---|
| Hỏi-1 · người không quản trị mở mục sàn | 3 nhánh rẽ (chuyển lặng · chuyển kèm câu báo · màn không có quyền) | cần hình: `duong-vao-cai-dat` |
| Hai đường vào theo vai (design §3) | 4 đường vào × 2 nhóm vai → nhánh rẽ theo quyền | cần hình: `duong-vao-cai-dat` (chung) |
| Đọc hẹp cho mọi màn Đọc (dòng sổ supersedes -6) | 1 bước, không rẽ | dưới ngưỡng: 1 bước |
| Tab điện thoại người chỉ quản trị (supersedes -8) | 2 tab, tab sáng theo đường | dưới ngưỡng: 2 trạng thái, không chuỗi |
| Menu tài khoản thêm «Cài đặt sàn» cho quản trị | 1 bước | dưới ngưỡng: 1 bước |

## Đề bài `duong-vao-cai-dat`

- Loại: sơ đồ luồng (flowchart) trái → phải.
- Nút trái (đường vào): «Biểu tượng Cài đặt (cột nhà)», «Menu tài khoản · Cá nhân», «Menu tài khoản · Cài đặt sàn (quản trị)», «Tab Tôi (điện thoại)», «Địa chỉ cũ /me», «Gõ địa chỉ mục sàn».
- Nút rẽ: «Có vai Quản trị sàn?» → có: «Người dùng (/settings/users)»; không: «Cá nhân (/settings/personal)».
- Nhánh Hỏi-1 từ «Gõ địa chỉ mục sàn» khi không quản trị: ba lối — «Chuyển lặng về Cá nhân», «Chuyển về Cá nhân + câu báo “Mục này chỉ quản trị sàn mở được” (khuyên)», «Màn không có quyền».
- AC liên quan: AC-3, AC-5, AC-8.
