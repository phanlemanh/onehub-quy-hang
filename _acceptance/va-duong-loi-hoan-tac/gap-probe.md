---
slug: va-duong-loi-hoan-tac
at: 2026-11-04T02:36:22Z
verdict: findings
p0: 2
p1: 2
p2: 1
---
## Findings
| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P0 | design | Dòng sổ d-20261104T023553Z-2 trích câu giao nhưng câu ấy không quyết loại thông báo khi lô hỏng một phần — nghĩa người dùng thấy mà sổ ghi máy quyết | Chủ kho ký vì tưởng thông báo lỗi đỏ là bắt buộc; Đầu chủ thấy đỏ dù 3/5 căn đã về và tưởng cả lô hỏng | Dòng sổ chỉ-người hoặc căn cứ trỏ câu đã duyệt | fixed: theo nếp đã duyệt ở AC-6 của sua-hang-loat (thông báo trung tính cho ghi lô một phần) — dòng S1 mới supersedes -2, AC-1, AC-6, E1, E7 sửa theo |
| P0 | design | Dòng sổ d-20261104T023553Z-5 (trần năm mã) ghi một-lối mà lối khác còn sống | Lô 30 căn hỏng 12: thông báo kể 5 mã rồi «và 7 căn khác», Đầu chủ không biết 7 căn nào | Dòng sổ chỉ-người hoặc căn cứ trỏ câu đã duyệt | fixed: căn chưa về tích lại trên lưới theo nếp «căn không đổi được vẫn tích» (AC-6 sua-hang-loat) nên mọi căn đều nhìn thấy; trần năm mã chỉ giới hạn chữ — dòng S1 mới supersedes -5, AC-1, E1 sửa theo |
| P1 | evals | AC-4 chỉ có E4 đo hàm điều phối, không đo bốn chỗ gọi trên màn đi qua hàm bọc | thanh.tsx vẫn gọi sua trần ở ghi lô, E4 xanh mà lỗi bất ngờ vẫn im | Bài kiểm tĩnh bốn chỗ gọi qua hàm bọc hoặc ui-check bốn ô | fixed: E4 thêm ca đọc mã nguồn tren-o.tsx và thanh.tsx — đúng một `ghiAnToan(useSuaHang())`, không `useSuaHang()` trần, kèm đối chứng chèn bản trần thì đỏ; thiết kế bọc ngay chỗ lấy hàm ghi |
| P1 | evals | AC-3 hứa thử lại bằng nút HAY Ctrl/Cmd+Z; E6 chỉ thử bằng nút, vế «Đã hoàn tác rồi» không ghim | Ctrl+Z sau lần hỏng ra «Đã hoàn tác rồi» mà E3, E6 vẫn xanh | Tách E6 hai lượt nút và phím, ghim «Đã hoàn tác rồi» | fixed: E6 tách lượt (a) nút và (b) Ctrl+Z, mỗi lượt bấm thêm một lần ra đúng «Đã hoàn tác rồi» |
| P2 | contract | Lỗi luật của lõi khi hoàn tác lô không có AC nói có vào bản ghi bấm lại không | Căn bị xoá ra not-found, bấm lại mãi vẫn hỏng | Vế AC + ma trận năm loại lỗi trong E2 | fixed: AC-2 thêm vế chỉ kho và lỗi bất ngờ được bấm lại; E2 thêm ca bảng năm loại lỗi |
