---
slug: ghim-lai-ban-that-qua-ci
at: 2026-11-07T13:05:00Z
verdict: findings
p0: 0
p1: 3
p2: 1
---

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P1 | design, contract | Bộ chặn và config nó đọc lấy từ nhánh PR, không từ main; hai trong bốn gác của Hỏi-2 nằm ở nhánh chạy mã lạ | Nhánh PR sửa bộ chặn cho luôn thoát 0 hay gỡ khoá để trống, luồng vẫn đạt, bộ kiểm cách ly chạy trên bản thật | Vế gác lấy từ main, ca phá bộ chặn đọc từ cây nhánh | fixed: hai bản checkout (goc là main, nhanh là nhánh PR); bộ chặn và bộ quét chạy từ goc, đọc cây nhanh; AC-1 thêm vế «gác lấy từ main» và «bộ chặn đọc cây nhánh PR», AC-2 có ca phá cho từng vế; Hỏi-2 ghi lại gác nào chạy từ main |
| P1 | contract, evals | Ngưỡng «không bí mật nào rời GitHub» không có đường đo; tệp đính kèm có thể mang chuỗi kết nối từ thông báo lỗi | Eval đỏ in nguyên chuỗi kết nối, dòng repin-do mang nó vào tệp đính kèm, máy commit vào git | Bước quét trước khi tải, hai chiều có ghim chữ | fixed: bước quet-bi-mat.mjs (từ main, if always) tìm chuỗi kết nối và mật khẩu của nó trong hai tệp, gặp thì dừng không tải; AC-5 và E5 đo ba ca (sạch, nguyên chuỗi, chỉ mật khẩu), không in giá trị; vế «chỉ tải khi quét sạch» trong AC-1 |
| P1 | design | Thiết kế mục 5 không nói E3 trên nhánh #192 đã khai not-run | Bấm nút, bộ chặn thoát 1 «CHẶN E3», #192 vẫn kẹt | Ghi trạng thái E3 trên #192 và bước kiểm bộ chặn tại máy trước khi bấm | fixed: thiết kế mục 5 ghi E3 trên #192 đã khai not-run thay bởi va-deploy-csdl-tam#AC-2 (commit ffa51298) và bước kiểm trước khi bấm; đo 07/11 bộ chặn trên cây #192 ra «CHO CHẠY moi-truong-that» |
| P2 | evals | E4 chạy kit trên máy, không ghim bản theo KIT_TAG mà luồng lấy | Kit máy đọc khoá còn kit v2.37.0 thì không, E4 xanh mà CI lộ chuỗi kết nối cho bộ kiểm chung | E4 lấy kit theo KIT_TAG của ci.yml, in tag | fixed: --trong lấy kit từ kho kit theo KIT_TAG đọc từ ci.yml (cùng cách luồng lấy), dòng ĐẠT in tag; cả ca đối chứng chạy trên bản ấy |
