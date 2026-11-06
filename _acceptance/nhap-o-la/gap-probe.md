---
slug: nhap-o-la
at: 2026-11-06T03:35:00Z
verdict: findings
p0: 2
p1: 3
p2: 0
---

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
| --- | --- | --- | --- | --- | --- |
| P0 | contract | Dòng sổ d-4, d-5 để máy tự quyết số mô phỏng của tác tử chạy Haiku là đủ để hạ mô hình theo ADR-0011 qđ 3; Notes trống dù d-5 hứa ghi giới hạn [nhap-tac-tu-ke-hoach#F2] | Bộ Haiku mô phỏng đạt ngưỡng, MO_HINH_O_LA thành Haiku; qua API thật Haiku đề xuất sai, người ký không biết số chọn mô hình là mô phỏng | Câu Hỏi chỉ người ở Cổng Phạm vi + Notes ghi giới hạn và điều kiện đo qua API ở phiên nghiệm thu | human-gate1: Hỏi-1 (dòng sổ mới thay d-4, khuyến nghị giữ Opus); AC-8, E8 viết theo khuyến nghị; Notes ghi giới hạn |
| P0 | design | Dòng d-9 bỏ design-pass ghi muc-tieu với câu trích không quyết việc bỏ khoảnh khắc nhìn; khối mới dưới mỗi ô ở 375 là gu nhìn [cach-goi-rieng#F1] | Cổng Phạm vi ký trên chữ, ảnh E4b ở Cổng Bằng chứng mới cho thấy lưới khó đọc ở 375, phải mở lại thiết kế | design-pass trước Gate 1 hoặc câu Hỏi chỉ người | human-gate1: Hỏi-2 (dòng sổ mới thay d-9, khuyến nghị ảnh ở Cổng Bằng chứng) |
| P1 | design | Không định cách đưa một đề xuất của ô gói (cùng cột, cùng chữ) về nhiều ô lưới ở cột giá, nơi không có luật đổi theo | Mười dòng cùng dải giá: đề xuất chỉ hiện ở dòng đầu, hoặc bấm một dòng thì chín dòng kia mập mờ | Luật gán ngược ghi rõ + ca ba dòng giá cùng chữ | fixed: dòng sổ mới (đề xuất hiện ở mọi ô cùng chữ, «Dùng» áp đúng ô bấm, đổi theo chỉ ở trường giá trị đóng như hàng 67); AC-4, design §5, E4 thêm ca ba dòng dải và đối chứng |
| P1 | design | d-6 (tự gửi) ghi mot-loi mà lối nút hỏi vẫn sống; không đo cỡ gói, không giới hạn gửi lại | Qua lại Ghép cột – Xem trước năm lần tiêu trần tháng chung | Căn cứ trích quyết + assert số lần gọi theo số gói khác nhau, cỡ gói | fixed: dòng sổ mới thay d-6 trích Tham chiếu §12 hàng 68 (nếp tự gửi một lần), nhớ theo băm gói; E4 assert K1→K2→K1→K2 gọi 2 lần; E1 assert gói 300 ô ≤ 96 KB |
| P1 | evals | E4c viết tay thân xem thử theo khuôn bên đọc, không đi vòng qua bên ghi thật; E4 mơ hồ chỗ điều kiện phí | Web gửi giá trị khác thứ máy chủ chờ; hai eval cùng xanh mà lần nhập thật bỏ dòng | E4c dựng thân từ goiDong của trạng thái web sau dungDeXuat rồi POST thật | fixed: E4c chuyển sang apps/web/src/lib/nhap/test-db/o-la.db-test.mts (test.web_db) dựng thân bằng hàm của màn, cùng fixture E4; E4 ghim row.extra.feeInclusion |
