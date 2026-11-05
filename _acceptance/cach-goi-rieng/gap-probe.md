---
slug: cach-goi-rieng
at: 2026-11-05T13:46:00Z
verdict: findings
p0: 1
p1: 2
p2: 2
---
## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P0 | contract | Dòng sổ bỏ ui-observed cho bản phát hàng là lựa chọn chỉ người có, máy tự ghi descope; Ngoài phạm vi không nêu [va-dang-nhap-mat-khau#F2] | Người ký mặt «đội khác» ở Cổng Bằng chứng chỉ có tên ca máy, không biết đã bỏ phép nhìn | Thêm Hỏi hoặc eval ui-check chụp khung xem trước | fixed: thêm E14 ui-check chụp khung xem trước hộp thoại phát hàng; dòng sổ mới supersedes dòng bỏ ảnh; Ngoài phạm vi nói rõ tệp xuất đo bằng bài kiểm |
| P1 | evals | Chưa eval nào đo chỗ nối từ vựng vào trang phát hàng (phat-hang, exports/new) | Trang gọi xuatBang không truyền từ vựng; E6, E6b, E7b vẫn xanh | Bài kiểm web với đầu vào round-trip từ GET /company/labels | fixed: thêm E6c — đầu vào dựng bằng bangNhan (hàm bên ghi của API), qua tuVungTuBang và hàm dựng của hộp thoại; đọc mã exports/new |
| P1 | evals | Nửa giao diện của AC-2 (nút Trả về mặc định) không có eval | Nút điền chữ mặc định vào ô, PUT gửi label = mặc định, dòng còn custom:true | E3c thêm ca nút trả về; trùng mặc định = mặc định; E11 thêm bước | fixed: E3c thêm hai ca (nút về rỗng; gõ đúng chữ mặc định không gửi); E11 thêm bước trả về, Lưu, tải lại |
| P2 | evals | Nhật ký: E1 chỉ đếm khoá vừa đổi; xoá dòng không sinh sự kiện; PUT có thể ghi lại mọi khoá | Số sự kiện thổi phồng, hoặc trả về mặc định không để vết | E2 đếm sự kiện từng khoá; xoá có một sự kiện | fixed: AC-2 và design đổi sang ghi null (trigger 026 bắt update), PUT chỉ ghi khoá đổi; E2 đếm đúng một sự kiện cho khoá trả về và 0 cho khoá giữ nguyên |
| P2 | evals | E7 chưa viết tay tập khoá kỳ vọng từng người nhận | Khoá ra lỡ chứa closePrice vẫn xanh vì kỳ vọng dựng từ truongRa | Ma trận viết tay + đối chứng dương chèn closePrice | fixed: E7 liệt nguyên văn mười một khoá cho khach_rieng và nhom_moi_gioi, thêm đối chứng chèn closePrice |
