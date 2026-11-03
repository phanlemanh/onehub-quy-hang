---
slug: so-do-hai-tuan-thu
at: 2026-11-03T11:10:00Z
verdict: findings
p0: 1
p1: 4
p2: 0
---

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
| --- | --- | --- | --- | --- | --- |
| P0 | contract | «Đường đo» coi AC-1, AC-8, AC-9 là bảo đảm cho câu SỐNG «mỗi số đo §11 ra từ một truy vấn trên sự kiện» trong khi 6/13 mã ra «chưa có sự kiện»; việc nhận đóng hàng với 7/13 và giao sự kiện thiết bị, mất mạng là của người mà sổ không có dòng hỏi. | Cổng Phạm vi duyệt vì tưởng thước đã có đường đo; Cổng Giá trị đọc câu SỐNG nguyên văn thì hàng CHẾT, hoặc hai tuần thử bắt đầu mà không ai ghi sự kiện thiết bị và mất mạng. | Dòng Hỏi chỉ-người ba ý; «Đường đo» ghi 7/13 và trỏ Hỏi. | human-gate1: sổ thêm Hỏi-1 (d-20261103T111147Z-14, chỉ-người, khuyến nghị nhận + sửa câu SỐNG + mở hàng nhỏ cho thiết bị và mất mạng); «Đường đo» của contract và design §6 ghi 7/13 và trỏ Hỏi-1; yêu cầu can-nguoi D-1 đã gửi. |
| P1 | evals | Bộ chuyển chép tay chuỗi lệnh của bộ nạp, không gì nối hai bên; chiều đỏ của E9 chỉ sửa bộ chuyển. | Bộ nạp đổi lệnh, E9 vẫn xanh với số ghim của bộ dữ liệu không còn khớp sàn thử. | Ca gác so thứ tự lệnh của bộ chuyển với bộ nạp; chiều đỏ ở phía bộ nạp. | fixed: E9 thêm ca «bộ chuyển theo bộ nạp» rút thứ tự loại lệnh từ nap-ban-that.ts, chiều đỏ thêm một lệnh ở bản sao nguồn bộ nạp; d-…-10 thay bằng d-20261103T111147Z-17 nêu giới hạn còn lại (đổi payload mà giữ loại lệnh). |
| P1 | design | §3 không nêu chỗ lưu kết quả kiểm trùng của lead mà AC-5, AC-6 cần. | Hàng đường đọc thấy không có chỗ lưu, số lead trùng ra 0 dưới nhãn «đo được». | §3 nêu chỗ lưu thật; không có thì chuyển mã sang chưa có sự kiện. | fixed: §3 nêu cột `leads.outcome` (migration 007, ghi một lần lúc nhập, mọi lead kể cả lead trùng đều thành dòng); bộ chuyển dùng decideOutcome vì bộ nạp ghi lead qua createLead cũng gọi đúng luật ấy. |
| P1 | design | d-…-5 trích do-ti-le.ts cho việc tra không kèm toà, câu trích chỉ quyết cách đếm nhiều căn. | Mã trùng hai toà mà người gõ đã chọn toà bị đếm hụt giả. | Dòng sổ trích đúng chỗ quyết. | fixed: d-20261103T111147Z-15 thay d-…-5, trích ô nhận lead (nguon-that.tsx) — cửa gõ mã tra không kèm toà rồi mới bảo «chọn toà»; số đo đếm thêm mã của lead (cửa thứ hai), AC-4, E4, AC-9 cập nhật. |
| P1 | design | d-…-9 ghi một-lối nhưng lối chết là lập luận giá trị; một số «chưa» khoá nghĩa. | «chưa» gộp lead chưa chia làm vượt ngưỡng vì nhịp chia, không tách lại được. | Tách «chưa» ba phần. | fixed: d-20261103T111147Z-16 thay d-…-9; đầu ra thời lượng mang chiTiet {chuaChia, daChia, traLai}; AC-5, E5, AC-9 assert từng phần. |

Ghi chú dưới ngưỡng: d-…-8 (mẫu số hàng mở) đã bù bằng bảng theo trạng thái — giữ. Chiều đỏ của E7 phụ thuộc thứ tự sự
kiện — ca kiểm dựng sự kiện theo seq tường minh, ghim thứ tự.
