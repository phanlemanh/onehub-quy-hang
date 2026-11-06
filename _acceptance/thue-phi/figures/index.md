# Hình tại Cổng Phạm vi — thue-phi

| Điểm | Đếm | Hình |
|---|---|---|
| Dấu định nghĩa đóng ở cơ sở dữ liệu (dòng sổ S1, lối ghi giá → dấu → người xem) | 4 bước nối tiếp, 5 lối vào | `luong-dau.html` |
| Hỏi-3 — giá cũ điền dấu mặc định hay «không ghi định nghĩa» | 2 nhánh | `luong-dau.html` (nhánh ở bước giá cũ) |
| Hỏi-1, Hỏi-2, Hỏi-4, Hỏi-5 — giữ cứng / để sau hay mở | mỗi câu 2 nhánh | `nam-cau-hoi.html` |
| Phản biện P0, P1 đã sửa | dưới ngưỡng: 1 bước mỗi điểm | — |

## Đề bài

**luong-dau** — sơ đồ luồng trái → phải. Năm lối ghi giá bên trái (Sửa trên ô ở Bảng hàng · Màn cuộc gọi · Nhập file ·
Hoàn tác lần nhập · Đồng bộ khi có mạng lại) cùng đổ vào một hộp «Sự kiện giá vào máy chủ». Từ đó một mũi tên «giá bao phí»
tới hộp «Đóng dấu định nghĩa của sàn lúc ấy (khoản nào, tỉ lệ, ngày)» đọc thêm từ hộp «Cài đặt › Thuế phí (quản trị sàn)»;
mũi tên «không bao phí» đi thẳng «Không dấu». Dấu tới hai chỗ xem: «Hồ sơ căn: Tính theo định nghĩa ngày …» và «Lối đọc dấu».
Nhánh riêng phía dưới: «Giá ghi trước 06/11» → rẽ hai (Hỏi-3): a «Điền dấu mặc định (khuyến nghị)» · b «Dấu "không ghi định
nghĩa"». Ghi chú nhỏ: «Máy tính cuộc gọi sửa môi giới cho một lần tính — không vào dấu». AC: AC-4, AC-5, AC-7.

**nam-cau-hoi** — bảng quyết định năm hàng × ba cột (Câu hỏi · a: máy khuyên · b: lối khác và giá):
- Hỏi-1 Thuế TNCN 2%, trước bạ 0,5% · a: giữ đúng số luật, màn ghi «theo luật» · b: mở khoảng cho sàn — sàn có thể đặt sai luật.
- Hỏi-2 Khoản trong bao phí · a: ba khoản cố định, sàn bật tắt · b: sàn thêm khoản riêng — thêm bảng và màn, vượt cỡ.
- Hỏi-3 Giá cũ · a: điền dấu mặc định · b: dấu «không ghi định nghĩa» — giá cũ không có về tay theo dấu.
- Hỏi-4 Bảng hàng · a: làm sau khi hàng 46 vào · b: chạm Bảng hàng ngay — xếp chờ hàng 46.
- Hỏi-5 So giá toà · a: dùng định nghĩa hiện hành · b: dấu riêng từng căn — vượt cỡ hợp đồng.
