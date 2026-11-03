---
slug: va-doi-gia-can-da-ban
at: 2026-11-03T13:20:00Z
verdict: findings
p0: 0
p1: 3
p2: 1
---

# Phản biện context sạch — va-doi-gia-can-da-ban

Kiểm chéo không ra lỗ: mỗi AC có eval; AC-2, AC-3 gắn xuyên lớp với eval `backend-effect`; ma trận E1 đủ sáu trạng thái,
đếm và phủ đúng tập; assertion âm tính có đối chứng dương; không đường gốc viết cứng.

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
| --- | --- | --- | --- | --- | --- |
| P1 | decisions · design | Lối «mã lỗi mới» không chết, chỉ tốn; mã lỗi là hợp đồng API khó đảo | Ký AC-2 tưởng chỉ một lối; sau cần tách «khoá giá» khỏi «chuyển sai» phải đổi mã đã phát hành | Dòng sổ mới nêu hai lối và căn cứ | fixed: đổi sang mã riêng price-locked-closed 422 theo nếp ADR-0026 (cham-tep G-3 đã duyệt), dòng sổ mới supersedes dòng cũ |
| P1 | contract AC-1 · E1 | Câu lý do không ghim, E1 chỉ kiểm có chữ «đã bán» | Mã ra câu khác thiết kế mà E1 vẫn xanh | Ghi nguyên câu vào AC-1, E1 assert bằng | fixed: AC-1 ghim nguyên câu, E1 assert.equal với câu viết tay, thêm dòng sổ cho câu chữ |
| P1 | evals E3 | Chỉ đo máy đã biết Đã bán; ca thật là máy giữ bản Đang bán cũ | Máy cũ không về bản máy chủ mà E3 vẫn xanh | Thêm ca khoiDong trước, người khác chốt bán sau | fixed: AC-3 và E3 thêm ca (b) máy cũ, người khác chốt bán → «Cần xem» loại «đã bán», hàng về bản máy chủ |
| P2 | evals E2 | Không chứng máy chủ đọc luật từ lõi | applyCommand tự viết điều kiện Closed mà E2 vẫn xanh | Chiều đỏ ở lõi | fixed: E2 thêm chiều đỏ — lõi từ chối thêm Withdrawn thì ca năm trạng thái đỏ nêu Withdrawn |
