---
slug: va-nap-mau
at: 2026-11-01T08:48:00Z
verdict: findings
p0: 1
p1: 2
p2: 2
---

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P0 | design | Hai dòng sổ ghi «chỉ một lối» trong khi lối kia còn sống (npm ci --include=dev; trỏ hồ sơ hàng 5 sang lệnh khác); dòng sau đổi lệnh chấm của một hồ sơ người đã ký | Chủ kho đọc «một lối» nên không cân nhắc lối khác; lệnh chấm hàng 5 đổi nghĩa mà người chưa chọn | Đổi sang câu hỏi có khuyến nghị và giá từng lối | fixed: thành Hỏi-1 và Hỏi-2 (dòng sổ thay d-2, d-4) |
| P1 | evals | Ma trận email chỉ chạy viec=nap; không ca gỡ với email rỗng | Bước kiểm quên điều kiện viec, nút gỡ chết khi ô email trống, E2 vẫn xanh | Ca viec=go email rỗng và rác phải thoát 0; chiều đỏ bỏ điều kiện viec | fixed: E2 và AC-2 thêm ca gỡ cùng chiều đỏ |
| P1 | evals | Đường đỏ của kiểm kiểu chỉ đo tsc -p packages/db, không đo lệnh npm run typecheck của CI | Lệnh gốc không phủ gói db, Ngoài-2 chưa đóng mà E6 vẫn xanh | Tệp tạm có lỗi kiểu làm đúng npm run typecheck ở gốc đỏ | fixed: E6 và AC-6 đo trên npm run typecheck ở gốc |
| P2 | design | Mẫu email cho phép % mà runner giải mã %0A, %25 trong lệnh workflow nên mặt nạ lệch email thật | Email có %0A qua kiểm, mặt nạ không khớp, email lộ ở log | Bỏ % khỏi mẫu, thêm ca %0A | fixed: mẫu bỏ %, ma trận E2 có ca %0A |
| P2 | evals | E4 thiếu \r, \x00, \x7f, U+2028 và không đo «trước mọi câu ghi» | Bộ lọc bỏ lọt \x7f, hay kiểm sau khi đã ghi; E4 vẫn xanh | Ma trận ký tự điều khiển đủ, ca CLI so ảnh chụp | fixed: E4 và AC-4 thêm ma trận và ca CLI so ảnh chụp |
