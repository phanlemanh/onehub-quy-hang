---
slug: khuon-nguon-danh-muc-v2
at: 2026-11-09T14:20:30Z
verdict: findings
p0: 3
p1: 2
p2: 0
---

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P0 | design | Hai dòng sổ ghi một-lối và không khó đảo, dù lối khác còn sống và chạm khuôn Invest ghim: bỏ mặt bằng theo trục, gói phải tự đủ. | Cổng Phạm vi duyệt mà không biết đây là hai lựa chọn khó đảo; cần mặt bằng thì phải lên v3. | Thêm hai Hỏi, sổ đổi sang chỉ-người, khó đảo. | human-gate1: Hỏi-11, Hỏi-12 |
| P0 | design | Ba dòng sổ nguồn mục-tiêu có câu trích chỉ quyết một phần: tập trường nhãn và tính bắt buộc, lưới từ chối cả gói, tin rao thay theo khu; Hỏi-7 ghi không khó đảo. | Invest thiếu nhãn một trường thì mọi gói bị từ chối; gói thiếu tin làm mất tin cũ. | Thêm ba Hỏi, sửa khó đảo. | human-gate1: Hỏi-7 sửa khó đảo, Hỏi-8, Hỏi-9, Hỏi-10 |
| P0 | design | Khuôn chưa chốt đoạn thấp tầng: toà có được trống không, số phòng trống khi nào. | Thấp tầng không có số thị trường hoặc bị từ chối oan, mười hai ô vẫn xanh. | Chốt ở thiết kế, thêm ô null hợp lệ, null sai loại hình, trùng khoá có null. | fixed: thấp tầng dùng khoá dãy như danh mục, số phòng theo bảng loại hình, thêm cặp loại hình vào khoá đoạn; AC-4, E5 thêm ba ô sai và một ô đúng |
| P1 | evals | E10 chỉ đếm dòng trong khi ghi đè không đổi số dòng; E11 thiếu đường sửa và ca đổi thoả thuận; E11 không nêu bộ cách ly. | Thoả thuận tắt mà gói vẫn ghi đè ảnh, E10 và E11 vẫn xanh. | So toàn nội dung; thêm sửa với thoả thuận tắt; chốt ca đổi thoả thuận. | fixed: E10 so toàn nội dung trên khu đã có ảnh; E11 thêm sửa và ghi đè bằng thoả thuận mới; lệnh chạy cả bộ packages/db |
| P1 | evals | Ma trận AC-7 không toàn phần: tám ô viết tay, ba cấp; vế phiên bản lạ chỉ đo ở khuôn. | listingKey dáng số điện thoại lọt vào vùng dùng chung; khoá lạ ở cấp bọc bị bỏ qua; phiên bản lạ trả 500. | Duyệt đệ quy mọi lá chuỗi; bảy khoá × tám cấp; ô mã tin dáng số; phiên bản lạ qua API. | fixed: E8 duyệt đệ quy và tám cấp, thêm ô mã tin, thiết kế chặn đoạn dáng số; E2 thêm ma trận phiên bản qua cửa nhận |
