# Hình tại điểm quyết định — pooler-che-do-giao-dich

| Điểm | Đếm | Hình |
|---|---|---|
| Hỏi-1 — cài PgBouncer qua Homebrew cho bàn thử tại máy | dưới ngưỡng: 1 rẽ, 1 bước | — |
| Hỏi-2 — biến DATABASE_URL 6543 cho bản xem trước nhánh (máy đặt / chủ kho đặt) | 2 nhánh rẽ, 3 bước nối tiếp | `duong-ra-ban-that` |
| descope «không đổi DATABASE_URL bản thật trong vòng này» — đường gộp → đo → quyết → đổi → lùi | 5 bước nối tiếp, 1 nhánh lùi | `duong-ra-ban-that` |

## Đề bài `duong-ra-ban-that`

- Loại hình: luồng (flowchart) trái → phải, một làn «máy», một làn «chủ kho».
- Nút: Gộp PR (mã chạy cả hai chế độ, bản thật vẫn 5432) → Đặt biến 6543 cho bản xem trước nhánh (máy qua CLI; nhánh rẽ «rào chặn → chủ kho một bước») → Đo: bàn thử PgBouncer tại máy + 40 yêu cầu trên bản xem trước + chủ kho thử tay → Cổng Bằng chứng: chủ kho quyết đổi → Đổi DATABASE_URL Production sang 6543, triển khai lại, theo dõi 30 phút → nhánh lùi: đặt lại 5432, triển khai lại (mã không đổi).
- Nhãn bằng chữ tiếng Việt, không tên tệp hay lệnh.
- AC liên quan: AC-3, AC-4, AC-6, AC-7.
