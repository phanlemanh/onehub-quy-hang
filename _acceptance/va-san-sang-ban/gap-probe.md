---
slug: va-san-sang-ban
at: 2026-11-01T22:24:00Z
verdict: findings
p0: 1
p1: 4
p2: 0
claims_input: ok
---

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P0 | contract | Dòng sổ -3 ghi căn cứ mục-tiêu nhưng câu trích (chú thích «một đường lệnh» của san-sang.ts) không quyết lời báo lỗi trên nút — đó là nghĩa sản phẩm | Chủ kho ký AC-4 tưởng nguồn đã chốt lời báo; đầu chủ đọc câu viết cho ô Bảng hàng ở nút | Trích nguồn đã ký, hoặc chuyển thành Hỏi ở Cổng 1, thay dòng -3 | human-gate1: thành Hỏi-1 (dòng sổ mới supersedes -3), khuyến nghị câu chung của trình sửa ô |
| P1 | design | Gắn theo mã căn trong khi AC-1 hứa cả đổi lần rao — hai lần rao cùng căn chung mã căn | Chuyển sang lần rao 2 cùng căn, danh sách lần rao 1 còn hiện; E1 vẫn xanh | Khoá theo mã lần rao; thêm ca cùng căn khác lần rao vào E1 | fixed: thiết kế khoá theo mã lần rao (can.id); E1 thêm ca A2 cùng mã căn khác lần rao |
| P1 | evals | Ma trận E3 thiếu mã căn, điều kiện phí, tình trạng sử dụng, và ca chưa có mã căn [d-20261101T155806Z-13] | Bấm khi chưa có mã căn, điền mã căn, danh sách biến mất hay báo nhầm ảnh; E3 vẫn xanh | Một ca mỗi điều + ca chưa có mã căn rồi điền | fixed: E3 thành ma trận 8 ca viết trước gồm hai ca mã căn (0 ảnh và 1 ảnh) |
| P1 | evals | E1, E2, E4 đo regex trên nguồn; không bài nào đo cột vẽ lại khi hàng đổi trên màn [san-sang-ban#F4] | Cột nhận hàng như ảnh chụp, điền pháp lý không đổi danh sách; regex vẫn qua | Thêm bước vào E6: A→B→A, điền pháp lý ở Bảng hàng | fixed: E6 thêm khung 3 (quay lại A) và khung 4 (điền pháp lý, dòng rời danh sách không bấm lại); lỗi kho giữ ở E4 hàm thuần — deferred: gây lỗi kho trên máy qua trình duyệt không có công cụ ổn định |
| P1 | contract | Dòng descope -4 ghi một-lối nhưng lối đếm lại ảnh khi mở lại cột vẫn sống — đánh đổi phạm vi của người | «Ảnh thật» thành dòng duy nhất đứng yên, đầu chủ tưởng chưa đủ | Ghi lối và giá, hoặc thành Hỏi | human-gate1: thành Hỏi-2 (dòng sổ mới supersedes -4), khuyến nghị làm mới ở lần bấm sau kèm dòng «Ảnh thật cập nhật khi bấm lại» |
