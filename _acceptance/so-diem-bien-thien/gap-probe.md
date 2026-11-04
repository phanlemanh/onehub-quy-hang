---
slug: so-diem-bien-thien
at: 2026-11-04T01:40:00Z
verdict: findings
p0: 1
p1: 3
p2: 1
---

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
| --- | --- | --- | --- | --- | --- |
| P0 | design (sổ d-7) | Căn cứ hỏng: dòng sổ ghi máy quyết cách mã hoá khoảng chữ tự do (#10, #11, #15, #20, #24) bằng câu trích chỉ hoãn việc chốt; cột Khoảng không có lưới đo (AC-2 loại cột, E4 sinh từ chính sổ mã) — cùng kiểu [lien-he-khach#F2] | Máy đọc #24 là không trần, kiemGiaTri nhận mọi số; hàng 82 mở ghi theo khoảng ấy, E4 vẫn xanh | Thay d-7 bằng một Hỏi; bảng khoảng viết trước so với sổ mã | human-gate1: thành Hỏi-1 (dòng sổ mới supersedes d-7) với khuyến nghị và lối khác; AC-2 và E2 thêm so cột khoảng khi ô mở đầu `a–b`, bốn điểm chữ theo câu trả lời Hỏi-1 |
| P1 | evals (E2) | Bốn trong bảy cột được so (số thứ tự, kiểu, tình trạng, hiệu lực) không có ca đỏ | soKhop chỉ so khoá, lớp, mặc định; cột hiệu lực lệch vẫn xanh | Mỗi cột được so một ca đỏ trên chữ tài liệu | fixed: E2 viết trước mười ca đỏ — hai ca khoá một bên, tám ca cột (số, kiểu, lớp, tình trạng, hiệu lực, vai, mặc định, khoảng) |
| P1 | evals (E9, E9b) | Bộ kiểm kết nối và kiểm kiểu toàn kho không có eval; chiều đỏ E9 chỉ nằm ở phá-thử của task | Hằng dựng từ sổ `as const` đổi kiểu, web hay connect gãy, gate vẫn xanh | Thêm eval connect, typecheck; chiều đỏ E9 vào cùng ca | fixed: thêm E9c (connect), E9d (typecheck toàn kho); E9 đo bằng hàm soHangSo(sổ), chiều đỏ trên bản sao sổ trong cùng ca |
| P1 | design, contract (cột vai) | Dịch «Ai đổi» sang mã vai là lựa chọn quyền máy tự làm, không dòng sổ, không lưới đo | Máy cho listing_agent đổi fee.brokerage_pct, mọi eval xanh, hàng 82 cho ghi sai vai | Một dòng sổ ánh xạ; so cột vai với sổ tài liệu | fixed: dòng sổ mới (căn cứ nhãn vai ở CONTEXT.md — dịch chữ đã chốt, không chọn quyền); AC-2 và E2 so cột vai, ca đỏ (h) |
| P2 | contract (AC-7, AC-8, Đường đo) | Hạn lead chỉ đo đọc cấu hình, không đo luật xét hạn; AC-7 không nêu khoảng của price.change_confirm_pct | Luật hạn vẫn 15/30 cứng, E8 xanh; «hai biên» E7 không phải biên | E8 đo unroutedDue/dueAlerts ở 1 và 1440; E7 lấy N từ sổ | fixed: AC-8, E8 thêm ca xét hạn ở hai biên; AC-7 nêu khoảng 5–50, E7 lấy biên từ SO_DIEM |
