---
slug: va-bang-hang-hydration
at: 2026-11-07T22:13:52Z
verdict: findings
p0: 1
p1: 2
p2: 2
---

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P0 | contract | Dòng sổ bỏ coverage-scan nói lối khác chết nhưng chính nó nêu đường vào góc nhìn đã lưu; Coverage, AC-1, E1 không có chiều đường vào | Góc nhìn đã lưu vẫn lỗi hydration mà E1 chỉ mở /inventory nên xanh | Thêm chiều đường vào và ca góc nhìn đã lưu vào lệnh đo | fixed: thêm chiều đường vào vào Coverage và AC-1; kiem-hydration.mjs mở góc nhìn đã lưu (đặt localStorage) ở khổ máy tính — bản cũ đỏ 1 lỗi, bản sửa 0; dòng sổ mới supersedes dòng cũ với lý do đúng |
| P1 | evals | E2 chỉ đòi tổng n ≥ 1; không chứng ca điện thoại đỏ được trên bản cũ | Bản sửa sai ở danh sách thẻ vẫn qua E1, E2 | In theo ca, đòi mỗi ca kể là đã sửa có lỗi trên bản cũ | fixed: E2 đòi bốn ca khổ máy tính mỗi ca ≥ 1 (đo 07/11: 1 mỗi ca); hai ca điện thoại 0 trên bản cũ — contract Context ghi rõ thước không phân biệt ở đó, chỗ sửa danh sách thẻ là phòng ngừa cùng gốc |
| P1 | contract | AC-3 hứa hàng hiện ngay nhưng không đo được chữ ngay; E3 không tách hàng từ kho trên máy hay từ máy chủ | Bản sửa làm bảng chờ đồng bộ xong mới hiện, mạng chậm thấy đang tải mãi | Chặn /api/v1 khi mở lại, đòi dòng đếm trong 2 giây | fixed: lệnh đo thêm ca máy tính · mở lại · mất mạng (Network.setBlockedURLs */api/v1/*) đòi dòng đếm trong 5 giây; E1b mang AC-3; bản sửa đạt |
| P2 | evals | Đối chứng dương khổ điện thoại chỉ dò chữ căn ở đâu cũng được | Danh sách thẻ rỗng mà ca vẫn ghi có hàng | Đếm thẻ căn | fixed: khổ điện thoại đòi có phần tử [data-the-can] |
| P2 | evals | Không bảo đảm mở đầu là kho trống | Bốn ca chỉ đo hai trạng thái kho | Xoá dữ liệu trang trước ca mở đầu | fixed: Storage.clearDataForOrigin (local_storage, indexeddb, cache_storage, service_workers; giữ cookie) trước mỗi ca mở đầu |
