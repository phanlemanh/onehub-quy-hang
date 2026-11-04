# Hình tại điểm quyết định — tab-toi

| Điểm | Đếm | Hình |
|---|---|---|
| Hỏi-1 — báo mất máy một nút hay chọn từng máy | 2 nhánh, 1 bước | dưới ngưỡng: hai lối, mỗi lối một bước |
| Hỏi-2 — máy bị báo xoá kho thế nào | 5 bước nối tiếp, 2 nhánh (bị báo · hết phiên thường) | `bao-mat-may.html` / `.png` |

## Đề bài `bao-mat-may`

- Loại hình: sơ đồ luồng hai làn (máy A đang bấm · máy chủ · máy B bị báo).
- Nút: A bấm «Báo mất máy» → máy chủ thu phiên B, gỡ thông báo B, ghi dấu (băm mã phiên) → B mở trang hay đồng bộ → máy
  chủ trả 401 kèm `device_reported_lost` → B xoá mọi kho Quỹ hàng, huỷ thông báo → màn đăng nhập «Máy này đã bị báo mất».
- Nhánh so: phiên hết thường → 401 không mã → thay đổi chờ ở lại, «Hết phiên» (dong-bo-tu-lanh AC-2 giữ nguyên).
- AC liên quan: AC-6, AC-7, AC-8, AC-9.
