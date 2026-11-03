---
slug: bang-hang-dang-the
at: 2026-11-03T11:10:30Z
verdict: findings
p0: 1
p1: 3
p2: 1
---

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P0 | design | Dòng sổ chốt năm mục lọc ghi nguồn mục-tiêu nhưng câu trích ở vo-va-ia chỉ tả thẻ, không nói mục lọc; dòng descope bốn mục còn lại không có căn cứ — lựa chọn chỉ người có mà máy tự quyết [goi-tu-may-tinh#F1] | Chủ kho ký AC-3, AC-4 tưởng tập mục đã được tài liệu chốt; ship xong đầu khách không lọc được pháp lý, nội thất | Dòng sổ Hỏi nguồn chỉ-người supersedes dòng cũ; AC-3 ghi «theo Hỏi-n» | human-gate1: dòng sổ Hỏi-1 (chỉ-người, khuyến nghị năm mục, lối khác chín mục) supersedes d-20261103T110950Z-4; AC-3 và design ghi «tập mục theo Hỏi-1» |
| P1 | evals | Giữ lâu chỉ đo bằng sự kiện tổng hợp; không đo hành vi giữ lâu của máy (menu ngữ cảnh, xem trước link, bôi chữ, lưu ảnh) | E10 xanh nhưng trên điện thoại thật giữ lâu bật menu lưu ảnh hay bôi chữ, đè chế độ chọn | Bước chạm thật CDP trên ảnh và chữ; ghi contextmenu, selection, menu | fixed: AC-5 thêm vế không bật menu/xem trước/bôi chữ; E10 thêm bước chạm thật CDP 800 ms trên ảnh và chữ mã căn; design ghi chặn contextmenu, touch-callout, select-none, ảnh không kéo, thẻ không là thẻ a |
| P1 | evals | E13 đếm theo [data-the-can] không ghim, không đối chứng dương; ô lỗi dùng offline trên máy dev ra trang lỗi của trình duyệt | Thẻ thiếu thuộc tính đếm ra 0 thoả ≤ 40 dù không cuộn ảo; người chấm thấy trang khủng long | Ghim thuộc tính, khoảng 1–40, đối chứng tổng dòng nhóm; chặn riêng API thay offline | fixed: design và AC-8 ghim data-the-can, khoảng 1–40 kèm đối chứng tổng các dòng nhóm; ô lỗi chặn riêng /api/v1/listings và /api/v1/catalog bằng Network.setBlockedURLs |
| P1 | contract | Mở hồ sơ toàn màn đang có cho đầu khách trước hàng 33 mà không nói hồ sơ trình gì cho vai ấy | Hồ sơ lộ phần chủ nhà cho đầu khách trước hàng 33 | E11 ghi trên phiên đầu khách có tên, số chủ, giá đáy, ảnh sổ không; AC-6 nói rõ | fixed: AC-6 thêm vế hồ sơ không chở lớp source; E11 thêm bước ghi trên phiên đầu khách; sổ thêm dòng căn cứ (cot.ts: hàng từ API không chở lớp source) |
| P2 | evals | AC-3 không định nghĩa căn thiếu giá trị; E1 không có ca rỗng; đáp án của E8 không ghim là đếm độc lập | Đầu khách lọc 50–80 m² mất các căn chưa có diện tích mà không eval nào đỏ; E8 so số với chính hàm đang đo | Luật rỗng ở AC-3; bốn assert rỗng ở E1; E8 đáp án tính riêng từ API | fixed: AC-3 nêu căn thiếu giá trị không khớp mục đang lọc, Phòng ngủ có «Chưa rõ»; E1 thêm bốn assert rỗng; E8 ghi dung-b.mjs đếm bằng vòng lặp riêng trên thân API, không import mã cards/ |
