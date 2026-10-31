---
loai: dot
ma: [CH1, CH2, CH3, CH4, CH5, CH6, CH7, CH8, CH9, CH10, CH11, CH12, CH13]
nguon: [raw/2026-11-01-cau-hinh-theo-san/phien-01-11.md]
cap_nhat: 2026-11-01
---
# Đợt cau-hinh-theo-san-0111 — cấu hình theo sàn

Chủ kho 31/10–1/11: thiếu linh hoạt hay dẫn tới thất bại, Quỹ hàng phục vụ nhiều sàn với cách làm khác nhau, nên
thiết kế như một công ty SaaS (metadata, nhiều công ty, trường riêng, luật, API). Thiết kế đề xuất ở ADR-0018: khai báo
có rào — linh hoạt nằm ở cấu hình có khuôn, không ở mã sàn tự viết.

## Điều rút ra

- Phần lớn nền SaaS đã có: cách ly theo dòng, API một cửa, thoả thuận có trần lớp. Chỗ hở là không có một chỗ khai các
  điểm sàn chỉnh được — mỗi hàng tự viết hằng số.
- Kiểm kê được 27 điểm mở hay đề xuất, đa số là con số và có / không; chỉ 6 là đối tượng có nhiều dòng (từ điển, nhãn
  trạng thái, trường riêng, mẫu file, mẫu bảng hàng, mẫu bài).
- Lõi đã quen kiểu «bảng dữ liệu, hàm không đổi»: cách đọc mã căn, bộ trường theo loại hình, bảng ai thấy nguồn. Sổ điểm
  biến thiên đi cùng kiểu ấy.
- Luật chia lead là phán xét của sàn (chuyện thu nhập của đầu chủ), không phải tham số máy tự chọn — bản đầu chọn một
  trong luật dựng sẵn; bảng quyết định chờ sàn thứ hai khác hình luật.
- Bất biến phải đứng ở cấu hình xấu nhất: bộ kiểm rò rỉ chạy với mọi tuỳ chọn trang khách bật về phía hiện nhiều nhất.
- Cấu hình làm AI nhập dữ liệu rẻ đi (bộ nhớ của sàn áp trước); định nghĩa trường riêng không gửi ra AI vì là dữ liệu
  nội bộ của sàn.

## Mã

- CH1 — sổ điểm biến thiên ở lõi, khớp với sổ ở tài liệu
- CH2 — luật của lõi nhận cấu hình làm tham số; hằng số đã có đọc từ sổ
- CH3 — bảng cấu hình theo sàn: sự kiện chỉ thêm, bản hiện hành, luật theo dòng
- CH4 — lệnh API đọc và đổi cấu hình theo sổ
- CH5 — điểm chỉ áp cho mới: đối tượng mang số lúc tạo
- CH6 — bảng quyết định ở điểm đã biết (chờ)
- CH7 — sàn thêm điều kiện Sẵn sàng bán (chờ)
- CH8 — ngưỡng ép giá theo loại căn, mức giá (chờ)
- CH9 — trường riêng chữ, số, ngày (chờ)
- CH10 — nhật ký cấu hình và trả về giá trị cũ (chờ)
- CH11 — sao cấu hình từ sàn mẫu cho sàn mới (chờ)
- CH12 — đối tượng tự tạo, công thức, luồng tự vẽ, kịch bản (chờ)
- CH13 — gửi định nghĩa trường riêng, nhãn riêng cho tác tử AI nhập (chờ)
