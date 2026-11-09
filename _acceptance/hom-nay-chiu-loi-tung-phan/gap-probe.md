---
slug: hom-nay-chiu-loi-tung-phan
at: 2026-11-09T08:11:03Z
verdict: findings
p0: 3
p1: 2
p2: 0
---

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P0 | contract | Căn cứ sai ở dòng sổ nhận AC-8 và AC-3 vào hàng và dòng thu phạm vi: câu trích không quyết việc gộp hay bỏ; lý do thật là đánh đổi chỉ chủ kho cân được. Cùng lớp [logo-onehub#F2] | Chủ kho ký mà không biết có lựa chọn gộp hay tách; E8 đỏ thì cả hàng ra CHẾT vì việc chưa giao | Dòng nhận thành câu hỏi một chạm; dòng thu phạm vi dẫn đúng đoạn quyết | human-gate1: AC-1 và AC-8 thành câu hỏi chỉ chủ kho quyết ở Cổng Phạm vi, khuyến nghị gộp, lối tách kèm giá; AC-3 dẫn đúng điều kiện bật «mỗi nguồn đúng một câu»; dòng thu phạm vi dẫn câu giám sát giao đo lại trong ô; ghi dòng mới mang supersedes |
| P0 | design | Căn cứ sai ở dòng bỏ design-pass; vị trí nút là gu nhìn; bảng trạng thái không tả vị trí; bài nhìn màn chỉ đo 1440. Cùng lớp [logo-onehub#F2] [d-20261108T230830Z-7] | Chủ kho thấy vị trí nút mới lần đầu ở Cổng Bằng chứng; ở 375 nút tràn mà không eval nào đỏ | Hỏi kèm hình trước và sau; E4b, E10d đo vị trí nút và tràn ở 1440, 375 | fixed: căn cứ mới là câu của thành phần gốc quyết chỗ nút (khe hành động, lỗi thì Thử lại) và ADR một khối; hai hình chưa sửa của khối lỗi đi kèm thẻ; design và AC-4 nêu vị trí; E4b, E10d đo ở 1440 và 375. rejected phần đưa thành câu hỏi: đổi một khe, đảo rẻ, chủ kho veto được ở cổng này |
| P0 | design | Căn cứ sai ở dòng Đội mất mạng theo trình duyệt: lối giữ cờ và gỡ khi đọc thành công chưa chết; không ca nào có trình duyệt còn mạng mà lời gọi không tới. Cùng lớp [va-ci-secrets-quet-dung-lich-su#F2] | Wi-Fi không ra mạng ngoài: chủ kho ký mà tưởng máy chỉ có một lối | Nêu ràng buộc giết lối gỡ cờ; E5b thêm ca onLine true cắt mạng | fixed: dòng mới nêu ràng buộc thật (trạng thái mất mạng không có Thử lại, sự kiện có mạng không bắn khi trình duyệt chưa báo mất; thêm nút thì chỉ còn khác câu chữ; Hôm nay cùng luật); AC-5 thêm vế; E5b bước 3 đo đúng ca này |
| P1 | evals | Ô mạng trở lại không đo thật ở AC-9, AC-3; đọc lại bộ nhóm và lead giao không có eval | Thiếu nhánh danh sách đầu chủ trong nguồn đọc lại mà E7b vẫn xanh; vùng tin không tự đọc mà AC-9 PASS | E9b thêm bước online; E7b đọc nút; bảng viết trước mỗi nguồn một dòng | fixed: AC-3 thêm vế mạng trở lại; E3 thêm bảng sáu nguồn trên luật thuần trangNguonCanDoc; E3b bước 4, E7b bước 2, E9b bước 4 |
| P1 | evals | «Tự thử lại trước khi báo» là quan hệ thứ tự mà AC-2 chỉ đo kết cục | Câu đỏ nháy 2 giây ở mọi lỗi thoáng qua mà E2, E2b vẫn xanh | Then thêm vế; MutationObserver; đối chứng dương | fixed: Then của AC-2 thêm vế; E2b gắn bộ đếm từ lúc mở trang, đối chứng dương đo alert sau ít nhất 2 giây |
