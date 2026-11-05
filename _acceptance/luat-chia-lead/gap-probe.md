---
slug: luat-chia-lead
at: 2026-11-05T13:30:30Z
verdict: findings
p0: 0
p1: 4
p2: 1
---

# Phản biện context sạch — luat-chia-lead

Một tác tử tươi đọc đúng sáu tệp (thiết kế, hợp đồng, kế hoạch đo, sổ quyết định, bài học từ hồ sơ trước, ô cơ hội); không
đọc mã kho.

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P1 | evals | Đường 400 (AC-5) và báo dòng hỏng (AC-7b) đi qua máy chủ mà không gắn cross-layer; E5a, E7a dùng chuỗi lỗi viết tay; E2b không ghim lý do mở đầu bằng khoá; vế giữ giá trị sau 400 không đo | Máy chủ trả lý do khác khuôn, màn đẩy mọi lỗi lên báo chung hay xoá ô; ba eval vẫn xanh | Gắn cross-layer, E2b ghim khuôn lý do, fixture lấy từ bên viết thật, thêm ca ui 400 thật | fixed: AC-5, AC-7 gắn (cross-layer); E2b ghim reason khớp ^(lead_routing hay queue).khoá: cho cả 400 khoảng và cặp hạn; E5a lấy lý do từ chính kiemGiaTri của lõi (bên viết lý do của máy chủ); E5b thêm ca 400 thật (sửa thân PATCH qua CDP để máy chủ thật từ chối) đo lý do đúng dòng và ô giữ giá trị; E7b thêm ca (b) chèn dòng trái luật thật |
| P1 | contract | Hoàn lại là Core mà không AC hay eval; lỗi mạng và 403 lúc lưu đã hứa ở thiết kế mà không AC | Hoàn lại lỡ gửi PATCH, mạng hỏng xoá ô; mọi eval xanh | AC Hoàn lại, AC lỗi lưu mạng và 403 | fixed: AC-2 thêm vế Hoàn lại (E2a ca e2-hoan-lai: ô về items của GET, 0 PATCH); AC-5 gộp lưu hỏng 400 · 403 · mạng (E5b ca e5-403 gỡ vai thật trên Postgres, e5-mang failRequest rồi Thử lại) |
| P1 | contract | Ngưỡng «nhãn đã chốt ở Cổng 103» không lần về quyết định 103; dòng sổ giữ chữ «lead» trích ADR-0021 điểm 6 chỉ liên quan | Cổng 103 chốt khác CONTEXT, E8 vẫn xanh | Đường đo nêu mã quyết định 103; dòng sổ mới trích luật đợt 61 | fixed: Đường đo nêu Hỏi-2 của 103 (man-lien-he d-20261105T035542Z-6 — chỉ nhãn pha, màn 48 không có pha); dòng sổ mới thay d-20261105T132510Z-6, nguồn một-lối theo luật đợt 61 |
| P1 | contract | Dòng sổ bỏ «chọn người nhận lead» và bỏ queue.groups lấy câu giao làm trần (ADR-0022: câu giao là sàn) | Người ký tưởng câu giao đã loại năng lực luật đợt 69 nêu | Dòng sổ mới trích §12 01/11; tương tự cho queue.groups | fixed: thay d-20261105T132510Z-12 bằng dòng trích nguyên văn Tham chiếu §12 01/11; thay d-20261105T132510Z-3 bằng dòng một-lối theo trần cỡ hợp đồng (sổ #36 ghi màn 48 — tách thành hàng mới, yêu cầu giám sát D-18) |
| P2 | evals | Toast hai biến thể và dòng «Đã đổi» đo bằng chuỗi có mặt | Đổi riêng ngưỡng mà toast vẫn «áp cho lead mới», E2a xanh | Ca toast bằng đúng theo hiệu lực; E1 bằng đúng người và ngày | fixed: AC-2 ghi hai biến thể toast; E2a hai ca bằng đúng («Đã lưu · áp cho lead mới từ bây giờ» và «Đã lưu»); E1 so bằng đúng «Đã đổi · <tên> · <dd/mm>» |
