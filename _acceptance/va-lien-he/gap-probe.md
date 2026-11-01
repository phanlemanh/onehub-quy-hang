---
slug: va-lien-he
at: 2026-11-01T13:50:00Z
verdict: findings
p0: 3
p1: 2
p2: 0
---

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P0 | design | Dòng sổ «một lối» bỏ sót lối điền tên chủ nhà từ liên hệ của lead | Cổng Phạm vi duyệt một lựa chọn sản phẩm mà người chưa được hỏi | Ghi thành câu hỏi cho chủ kho | human-gate1: thành Hỏi-1 (sổ mới supersedes dòng cũ); lead không mang tên nên lối ấy chỉ sống ở ca số trùng chủ nhà đã có tên |
| P0 | design | Câu trích ADR-0021 quyết định 6 không quyết việc giữ dòng chủ nhà chưa tên | Lỗi tên trống còn sống ở lối đọc khác mà E2 không đo | Trích câu thật sự quyết, kê mọi lối đọc | fixed: dòng sổ mới trích AC-7 đã ký của lien-he («chủ nhà là liên hệ của lead»); grep owner_name cho thấy docChuNha là lối đọc tên duy nhất |
| P0 | contract | Chặn «Mở số» bằng 404 không có dòng sổ | Đầu chủ không gọi được chủ nhà mà không biết đó là lựa chọn | Thêm dòng sổ | fixed: dòng sổ mới trích ADR-0021 Hệ quả — hệ quả đã ghi ở hàng 85, hàng vá không đổi lối mở số |
| P1 | evals | E2 thiếu ô trưởng nhóm × «Mở số» | Nhánh quyền riêng của trưởng nhóm lọt | Bảng bốn dòng, đếm bốn lần | fixed: E2 bốn dòng |
| P1 | evals | E1 không đo chèn dòng sàn B trỏ lead, hàng của sàn A | Sàn B gắn lead của sàn A vào hàng mình | Thêm hai dòng, ghim thông điệp | fixed: E1 sáu dòng + đối chứng (bảy lần so); khoá ngoại ghép (company_id, lead_id) và (company_id, listing_id) của 016 chặn sẵn — thông điệp ghim tên khoá ngoại |
