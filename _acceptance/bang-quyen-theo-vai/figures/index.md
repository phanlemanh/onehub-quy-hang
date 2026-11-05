# Điểm quyết định cần hình — bang-quyen-theo-vai

| Điểm | Đếm | Hình |
| --- | --- | --- |
| Một bảng, bốn lớp đọc (lõi → API → luật theo dòng → ô Trạng thái), ca người đi qua từng lớp | 4 bước nối tiếp | `mot-bang-bon-lop` |
| Ai đưa được lên Đang bán (Trưởng nhóm · Đầu chủ giữ căn · Đầu chủ căn chưa ai giữ · còn lại 403) | 3 nhánh rẽ | `dua-len-dang-ban` |
| Hỏi-1 bỏ frame ô Trạng thái | dưới ngưỡng: 1 bước, 2 lối | — |
| Hỏi-2 giữ cứng bảng quyền | dưới ngưỡng: 1 bước, 2 lối | — |
| Sửa bài kiểm có sẵn (người mở sàn thêm vai Bảng hàng) | dưới ngưỡng: 1 bước | — |

## Đề bài `mot-bang-bon-lop`

Loại: luồng ngang (flowchart). Nút: «bang-quyen-hang.json (48 ô)» ở giữa trên; bốn nút đọc nó: «Lõi: duocLamVoiHang · cờ
Sẵn sàng bán» (AC-1), «API: 404 / 403» (AC-2..5), «Luật theo dòng 046» (AC-7), «Ô Trạng thái» (AC-6). Dưới cùng: «Bộ kiểm
đếm khớp 48 ô ở API và luật theo dòng» (AC-8) nối về bảng. Nhãn bằng chữ Việt, không mã.

## Đề bài `dua-len-dang-ban`

Loại: cây quyết định. Gốc «Ai gửi lệnh đưa lên Đang bán?». Nhánh: «Không có vai Bảng hàng → 404 không có hàng này»;
«Trưởng nhóm → ghi»; «Đầu chủ — căn mình giữ hoặc chưa ai giữ → ghi»; «Đầu chủ — người khác giữ → 403»; «Đầu khách →
403, ô Trạng thái không có nấc». AC-5, AC-6.
