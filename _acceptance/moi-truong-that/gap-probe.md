---
slug: moi-truong-that
at: 2026-11-07T11:00:00Z
verdict: findings
p0: 1
p1: 3
p2: 1
---

## Findings

Phản biện context sạch chạy 07/11 (hàng va-thuoc-ci-moi-truong-that-ban-that) trên ADR-0009 (đóng vai thiết kế), hợp đồng, phép thử và sổ của hồ sơ đã ký 31/10, sau khi E7 và E3 được sửa theo ADR-0009 «Sửa đổi 06/11».

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P0 | contract | Lời AC-7 (chờ bốn job, chạy bộ kiểm cách ly trên bản thật) và AC-3 (bộ kiểm cách ly trên cơ sở dữ liệu thật) vẫn theo §7 cũ, trái ADR-0009 «Sửa đổi 06/11»; Notes không trỏ mục sửa đổi | Người chấm đọc GWT nguyên văn chấm AC-7 FAIL dù E7 xanh, hoặc chữ ký 31/10 bị gán cho lời hứa khác | Lời AC-7, AC-3 khớp mục sửa đổi hoặc Notes trỏ tới nó; mỗi vế lời AC-7 có một dòng ĐẠT của E7 | human-gate1: sửa chữ một hợp đồng đã ký là quyết định của chủ kho |
| P1 | evals | Sổ của hồ sơ không có dòng nào cho lần đổi E3 (not-run, thay bởi) và E7 ngày 07/11 | Người chấm thấy thước đã ký đổi mà không có căn cứ trong sổ của chính hồ sơ | Mỗi eval not-run hay đổi nội dung sau approved_at có một dòng sổ cùng ngày nêu tên eval | human-gate1: dòng sổ của hồ sơ đã ký ghi theo lời chủ kho (căn cứ: «mở hợp đồng mới» cho Ngoài-3 ở Cổng Bằng chứng va-deploy-csdl-tam 06/11) |
| P1 | evals | E8 đo /api/v1/health trên bản xem trước, mà ADR-0009 «Sửa đổi 06/11 — chế độ giao dịch» điểm 6 ghi bản xem trước không dựng được API vì thiếu OWNER_PHONE_KEY | Lần ghim lại sau khi sửa thước chạy E8 trên bản xem trước, health không trả 200, E8 đỏ, ghim lại thất bại | Đo AC-8 trên bản thật sau gộp, hoặc E8 khai not-run có con trỏ thay và dòng sổ | human-gate1: đổi đường đo AC-8 là quyết định của chủ kho |
| P1 | evals | Expected của E7 chỉ đếm tám dòng ĐẠT, không ghim tám vế; vế âm không có đối chứng | Thước mất phép kiểm sin1 hay deploymentEnabled mà vẫn in đủ tám dòng ĐẠT | Liệt kê nguyên văn tám dòng ĐẠT; phá thử chèn lại bước cách ly trên bản thật thì đỏ có thông điệp | fixed: expected của E7 ghim nguyên văn tám dòng ĐẠT; chiều đỏ là ma trận phá thử năm ca của hàng va-thuoc-ci-moi-truong-that-ban-that (E2), mỗi ca đỏ đúng vế ghim |
| P2 | evals | Con trỏ thay của E3 không trích lời AC đích, không rõ AC-2 có đo quan hệ isolation đỏ thì không triển khai | Lời hứa chặn triển khai của AC-3 cũ không còn chỗ đo | Trích GWT của va-deploy-csdl-tam#AC-2 | rejected: va-deploy-csdl-tam#AC-2 (đã ký) nêu nguyên văn «deploy có isolation trong needs, nên isolation đỏ thì không triển khai» — vế quan hệ có đo; bộ đọc của kit chứng con trỏ ở mỗi lượt |
