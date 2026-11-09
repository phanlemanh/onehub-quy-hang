---
slug: va-khuon-doan-sdt-ranh-gioi
at: 2026-11-09T02:14:14Z
verdict: findings
p0: 3
p1: 2
p2: 0
---

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P0 | design | Sổ -4 (khớp dãy con) ghi một lối ra, không khó đảo, dù thuộc khuôn Invest sẽ ghim. | Chủ kho ký mà không biết khoá toàn số có đoạn con 9–11 số bị từ chối; Invest ghim rồi nới phải phối hợp hai kho. | Dòng chỉ-người, kho_dao true, thêm Hỏi. | human-gate1: dòng supersedes -4, Hỏi-3. |
| P0 | design | Sổ -2 (ranh giới) trích câu không quyết tập ranh giới, ghi không khó đảo. | Máy tự mở sang mọi ký tự mà Cổng Phạm vi không được hỏi. | kho_dao true, thêm Hỏi. | human-gate1: dòng supersedes -2, Hỏi-2. |
| P0 | design | Sổ -3 trích quyết định cũ chỉ về số liền; số có dấu tách dính chữ là phần dư chưa ai chọn và không đo. | toa090-000-0071 qua mà mọi eval xanh, người ký tưởng phần dư chỉ là số liền. | Thêm Hỏi, ghim bằng ma trận. | human-gate1: dòng supersedes -3, Hỏi-4; luật khuyến chặn; AC-6, E6. |
| P1 | evals | Khớp dãy con và dấu / không có phép đo giết được; AC-4 ghi 12 chữ số qua trái thực tế. | Bản đột biến xét cả dãy xanh hết trong khi 12-0900000071 lọt. | Sửa AC-4 thành quan hệ, thêm khoá tiền tố số; / thêm vào trục hoặc gỡ. | fixed: AC-4, E4 thành quan hệ đoạn đứng riêng, thêm 12-0900000071, toa-123-456789012; gỡ / khỏi biểu thức vì khoá vốn không nhận. |
| P1 | evals | Ca âm không gắn nguyên nhân; E3 đếm thiếu đường hàm dựng; E4 không nói đường. | Đổi dấu lặp thành một dấu mà E1, E2 vẫn xanh; dungBaoSai từ chối oan mà E3 xanh. | Đối chứng ghép cặp, ghim thông điệp, E3 21 lần so. | fixed: ma trận đối chứng 8 chữ số ghép cặp, ghim thông điệp dáng số điện thoại, E3 21 lần so, E4 ghi rõ dungKhungToa, chiều đỏ dấu lặp. |
