# Hình tại điểm quyết định — ho-so-can-dien-thoai

| Điểm | Đếm | Hình |
|---|---|---|
| Hỏi-1 — chạm nút hỏi đầu chủ làm gì | 4 bước nối tiếp (chạm → bảng chia sẻ → người chọn ứng dụng, người nhận → người bấm gửi) + 2 nhánh (không bảng chia sẻ · căn chưa giữ) | `hoi-dau-chu.html` |
| Hỏi-2 — nhãn nút | dưới ngưỡng: 1 bước, 2 lựa chọn chữ | — |
| Hỏi-3 — lớp phủ trên màn đang có hay dựng lại | 2 nhánh, mỗi nhánh 3 bước | `lop-phu-hay-dung-lai.html` |
| Cờ hiển thị theo người xem | dưới ngưỡng: bảng 4 cờ × 4 người, không luồng | — |

## Đề bài

**hoi-dau-chu** — loại: luồng (flowchart) khổ dọc điện thoại. Nút: «Hồ sơ căn (Đầu khách)» → «Chạm «Hỏi đầu chủ · <tên>»» →
rẽ ba: (a) máy có bảng chia sẻ → «Bảng chia sẻ của máy — tin «Hỏi về căn A-04.06 · Toà A» + đường hồ sơ» → «Người chọn Zalo,
chọn đầu chủ» → «Người bấm Gửi»; (b) không có bảng chia sẻ → «Chép tin — báo «Đã chép tin hỏi»» → «Người dán vào ứng dụng
nhắn tin»; (c) căn chưa ai giữ → «Nút mờ «Căn chưa có đầu chủ giữ»». Nhãn phụ: «không gửi gì tự động», «không chở tên, số
chủ nhà». AC-4, AC-5.

**lop-phu-hay-dung-lai** — loại: hai cột so sánh (quyết định). Cột trái «Lớp phủ trên màn đang có (khuyến nghị)»: một màn
cho mọi vai · Đầu khách: ẩn ngăn Nội bộ, Sẵn sàng bán, sửa ảnh; thêm nút hỏi dính đáy · product-detail-5 thành hàng riêng
cho 33, 40–41. Cột phải «Dựng lại theo product-detail-5 ngay»: trang ba lối trước Cổng Phạm vi · nhóm khuôn mới · đổi cả
màn Đầu chủ trên điện thoại · hàng lớn gấp đôi. AC-1, AC-7.
