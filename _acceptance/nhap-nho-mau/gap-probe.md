---
slug: nhap-nho-mau
at: 2026-11-04T10:45:00Z
verdict: findings
p0: 2
p1: 3
p2: 0
---

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
| --- | --- | --- | --- | --- | --- |
| P0 | design | Dòng sổ -4 ghi máy quyết việc sửa một ô thì mọi ô cùng nguyên văn trong tệp đang nhập đổi theo, nhưng câu trích ADR-0011 không quyết điều ấy | Sửa một ô «đã cọc rồi», 30 ô cùng chữ đổi theo không báo, có ô nghĩa khác, người bấm ghi | Hỏi ở Cổng Phạm vi; giữ lan ô thì màn nêu số ô đã đổi theo, có ca assert số ấy | human-gate1: dòng -9 thay -4 (phần ADR quyết), Hỏi-2 (dòng -10) khuyên lan ô kèm «Đã đổi theo K ô cùng chữ»; AC-6 và E6 thêm số K |
| P0 | design | Dòng sổ -8 bỏ đường đo theo nguồn một-lối, nhưng ngưỡng trống không làm lối khác chết | Cổng Giá trị chỉ thấy ô CHƯA ĐO, không có số để quyết | Đổi sang câu chỉ-người kèm ngưỡng đề xuất và đường đo đọc từ imports | human-gate1: Hỏi-3 (dòng -11) thay -8, thêm AC-11 lệnh đo ba số từ kế hoạch đã lưu, mục «Đường đo» của hợp đồng ghi ngưỡng đề xuất |
| P1 | evals | E7 chạy trên chỗ thử dùng chung, sàn có thể đã có lần nhập ghi từ lúc chấm Màn Nhập Excel | Dải báo ra M/M nhờ dữ liệu cũ hay N<M đỏ oan | Mỗi lần chạy dựng sàn mới, in và assert số lần đã ghi trước bước 1 bằng 0 | fixed: E7 dựng sàn mới, Đầu chủ mới mỗi lần, dòng JSON mang soLanDaGhiTruoc = 0 |
| P1 | evals | AC-3 đi qua máy chủ nhưng ca cột tên người chỉ có ở lớp lõi (E3) | Đường đọc API không qua taoMau, trả «[Tên chủ mẫu]» trong valueMap mà E3, E4 vẫn xanh | Thêm vào E4 cột tên chủ có valueMap ghi thẳng vào bảng, assert không có valueMap, thân không chứa chuỗi mồi; tag cross-layer | fixed: E4 thêm ca tên chủ ghi thẳng vào bảng và đối chứng dương cột trạng thái; AC-3 mang (cross-layer) |
| P1 | contract | Cột chữ tự do không có AC đo; Context nói chỉ cột danh mục, AC-6 nói mọi cột không phải nguồn / tên người | Sửa ô ở cột ghi chú gấp chữ tự do vào bộ nhớ của sàn | Thống nhất một câu, thêm ô chữ tự do vào ma trận E6 | fixed: Context, AC-6, thiết kế cùng nói chỉ học ở cột lớp danh mục hay hàng chia sẻ được; E6 ma trận bốn lớp không học (nguồn, tên người, chữ tự do, chưa rõ), đếm 13 |
