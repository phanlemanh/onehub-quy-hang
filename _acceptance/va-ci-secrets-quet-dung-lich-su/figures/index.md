# Điểm quyết định của Cổng Phạm vi

| Điểm | Đếm | Hình |
|---|---|---|
| Hỏi-1 — phần CI thôi quét | 5 vị trí giá trị, hai nhánh rẽ quét/không quét | `pham-vi-quet.html` |
| Hỏi-2 — cách thu phạm vi | dưới ngưỡng: 2 lối, mỗi lối 1 bước | — |
| Hỏi-3 — đo chiều đỏ trên GitHub | dưới ngưỡng: 2 lối, mỗi lối 1 bước | — |

## Đề bài `pham-vi-quet`

Loại hình: so sánh trước/sau (hai cột cùng một sơ đồ nhánh commit).
Nút: main (cũ → đỉnh), nhánh PR rẽ từ main, commit gộp `refs/pull/N/merge` (HEAD), nhánh khác đã đẩy, nhánh bỏ hoang chưa mở PR, tag ngoài main.
Nhãn bằng chữ: cột «Hôm nay: quét mọi nhánh và tag» tô tất cả; cột «Sau bản vá: chỉ quét lịch sử của HEAD» tô main + nhánh PR + commit gộp, để xám ba phần còn lại, ghi «không quét ở lượt này».
AC liên quan: AC-1, AC-2, AC-3.
