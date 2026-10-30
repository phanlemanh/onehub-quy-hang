---
slug: dang-nhap-theo-san
at: 2026-10-30T02:16:00Z
verdict: findings
p0: 2
p1: 3
p2: 0
---

# Phản biện ngữ cảnh sạch — dang-nhap-theo-san

Một tác tử tươi đọc đúng năm tệp (thiết kế, hợp đồng, evals, sổ quyết định, ô cơ hội); không hội thoại, không mã.
Kho chưa có bài học xuyên tính năng (claim-scan rỗng) nên không có đầu vào thứ năm.

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P0 | design | Dòng sổ «người lạ tự tạo tài khoản» ghi máy quyết theo câu giao, nhưng câu giao chỉ liên quan, không quyết; đây là chính sách ai được vào | Khi gắn bộ gửi email thật, bất kỳ ai cũng bắt Quỹ hàng gửi thư tới địa chỉ tuỳ ý; cổng không ai chọn điều này | Hỏi-4 lên thẻ; AC-1 thêm chiều email lạ không nhận mã, đối chứng email có tài khoản nhận 1 mã | human-gate1: Hỏi-4 (khuyến nghị tắt tự đăng ký), dòng sổ mới thay dòng cũ; AC-1 và E1 sửa theo khuyến nghị |
| P0 | evals | Chín eval dùng chung một lệnh mà chỉ đòi exit 0; lệnh đã xanh ở main nên exit 0 không chứng ca đăng nhập nào chạy | Chưa nối db:test sang bộ test của API hay ca bị skip vẫn cho exit 0, chín eval cùng đạt | Đòi `output` liệt tên ca, đối chiếu từng tên ca có mặt và ok, không skip; số ca > 0 | fixed: mọi eval của lệnh chung đòi `output`, `expected` nêu tên ca; bộ *.db.test.ts ném lỗi khi thiếu DATABASE_URL thay vì bỏ qua (thiết kế mục Đường chạy test) |
| P1 | contract | AC-8 hứa quan hệ (vai đang chạy) nhưng E8 chỉ đo vị trí lời gọi; ngoại lệ công cụ vận hành chưa ghi; bước đọc danh sách sàn khi chưa có sàn không rõ đi cửa nào | Hàm thứ hai trong db.ts chạy trên kết nối chủ (siêu người dùng bỏ qua luật theo dòng) mà E8 vẫn xanh | Test thời chạy ghi mọi truy vấn public cùng current_user, 100% quy_hang_app, có đối chứng đỏ; db.ts chỉ xuất một hàm | fixed: AC-8 viết lại hai lớp, thêm E8b thời chạy; hàm một cửa nhận sàn trống; công cụ vận hành dời sang packages/db, ngoài packages/api |
| P1 | contract | Màn chọn sàn, trạng thái mã hết hạn + gửi lại, và đã đăng nhập mở /dang-nhap không có eval UI | Người hai sàn nhận 409 rơi vào trang trắng; sau ba lần sai không có nút gửi lại; E10 vẫn xanh | Thêm bước người hai sàn, ba lần sai rồi gửi lại, mở /dang-nhap khi đã đăng nhập | fixed: AC-10 và E10 thêm ba nhánh, mười một khung khớp mã trạng thái; công cụ mở sàn hỗ trợ một email hai sàn (AC-9) |
| P1 | contract | Production thiếu bộ gửi và vét mã bằng xin mã lặp không có AC | Triển khai thiếu bộ gửi làm mã của mọi người nằm trong nhật ký; xin mã rồi đoán ba lần lặp không bị chặn | AC chặn production thiếu bộ gửi; giới hạn xin mã theo email, hằng N và cửa sổ | fixed: AC-11 + E12 (cặp hai chiều); AC-1 thêm 5 lần / 15 phút → 429, đếm ở bảng auth.otp_requests; giữ cỡ 11 tiêu chí ghi ở sổ |
