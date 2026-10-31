---
loai: dot
ma: [H13-N3, H13-N4, H13-N6, H13-N13, H13-N16, H13-N25, H11-H1, H9-N4]
nguon: [raw/2026-10-31-ton-nen-2/quyet-dinh-nhanh-tuc-thi.jsonl, raw/2026-10-31-ton-nen-2/quyet-dinh-lop-truong-nguon.jsonl, raw/2026-10-31-ton-nen-2/quyet-dinh-danh-muc-go-ma-can.jsonl, raw/2026-10-31-ton-nen-2/nhat-ky-dot-nen-2.md]
cap_nhat: 2026-10-31
---
# Đợt ton-nen-2 — việc tồn của đợt nen-2

Ba hàng của đợt nen-2 ký Cổng Bằng chứng kèm các mục chủ kho chọn «mở hợp đồng mới»: lỗi có thật, không mất dữ liệu ngầm,
nhưng cần định nghĩa hành vi mới nên tách thành việc riêng có tiêu chí của nó. Lượt cắt này đưa chúng vào lộ trình để
không mục nào chỉ nằm trong sổ quyết định của một hồ sơ đã đóng.

## Điều rút ra

- Đồng bộ trên máy (hàng 13) có ba chỗ cùng gốc: lỗi tạm thời của máy chủ (trục trặc ngắn, hết phiên) đang bị xếp chung với
  «máy chủ từ chối», nên thao tác rời hàng đợi sang Cần xem thay vì tự gửi lại; chỉ báo khi kéo về luôn nói «Mất mạng» dù
  nguyên nhân khác; và căn đang ở Cần xem mà sửa thêm thì thao tác mới kẹt hoặc «Giữ của tôi» đảo thứ tự hai lần sửa. Ba
  mục cùng vùng mã, cùng một lời hứa với người dùng — đồng bộ tự lành và nói thật — nên cắt thành một hàng.
- Sáu dòng quyết định của hàng 13 gom lại ba hành vi: cùng lỗi phân loại 5xx/401 xuất hiện ở ba vòng chấm khác nhau.
- Ba hành vi phải xong trước hai tuần thử: người dùng thử sẽ gặp chúng trong lúc triển khai hay hết phiên.
- Số chủ nhà hiện nằm sau một cửa duy nhất nhưng chưa mã hoá ở mức trường. Hàng 11 tách việc này vì nó cần chủ kho sinh
  khoá và cất vào nơi giữ bí mật của môi trường thật; điều kiện chủ kho đặt là phải xong trước khi có dữ liệu thật.
- Tra mã căn (hàng 9) chưa phân biệt hai toà cùng dự án có căn trùng mã: chỉ mục ghi đè, trả về căn của toà nạp sau mà
  không báo. Danh mục mẫu không có ca này; danh mục thật thì có thể có — nên phải xong trước khi nạp danh mục thật, cùng
  lúc với hàng nhận danh mục Invest.

## Mã

- H13-N3, H13-N13, H13-N25 — lỗi tạm thời của máy chủ không đẩy thao tác sang Cần xem
- H13-N4 — chỉ báo kéo về nói đúng nguyên nhân
- H13-N6, H13-N16 — căn đang Cần xem sửa tiếp không kẹt, không đảo thứ tự
- H11-H1 — mã hoá số chủ nhà ở mức trường
- H9-N4 — căn trùng mã giữa hai toà cùng dự án
