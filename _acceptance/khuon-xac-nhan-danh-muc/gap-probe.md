---
slug: khuon-xac-nhan-danh-muc
at: 2026-11-08T07:14:00Z
verdict: findings
p0: 1
p1: 4
p2: 0
---

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P0 | design | Cách sinh mã mờ (HMAC theo bên nhận) ghi máy quyết «một lối», kho_dao false — lối khoá chung và lối bảng ánh xạ còn sống, chọn là chọn về riêng tư, và thuộc khuôn Invest ghim; d-10, d-13 ghi kho_dao false trái cost_if_wrong của chính chúng; d-3 «một lối» chỉ nói lối kia tốn hơn [va-nut-ci-ag-root#F1] | Chủ kho ký Cổng Phạm vi không thấy lựa chọn mã theo bên nhận; sau khi báo Invest, đổi cách sinh mã hay xoay khoá là lên v2, chuỗi «rút một công ty» đứt | Dòng sổ thay d-7 nguồn chỉ-người kho_dao true, thành Hỏi-5; sửa kho_dao d-10, d-13; d-3 dòng mới | human-gate1: Hỏi-5 (d-20261108T070929Z-18 thay d-20261108T070319Z-7, kho_dao true); d-20261108T070404Z-10 → d-20261108T070929Z-19, d-20261108T070404Z-13 → d-20261108T070929Z-20 kho_dao true; d-20261108T070319Z-3 → d-20261108T070929Z-21 nguồn mục tiêu trích câu bật khi; thiết kế §3.5 thêm hệ quả xoay khoá |
| P1 | evals | E2 đo cơ sở dữ liệu mới (040 trước 041–052), không đo thứ tự bản thật; tám loại viết tay; source, company_internal nhận cả ba tên ràng buộc | Migration sau 040 tạo lại agreements_kind_check: CI xanh, bản thật thiếu loại mới; lõi và ràng buộc lệch tên loại | Ca áp lại 040 sau 052; danh sách loại rút từ nguồn; ghim tên ràng buộc mới khi gỡ ràng buộc cũ | fixed: E2 thêm ca áp lại thân 040 trên cơ sở dữ liệu đủ migration, ca quét tĩnh migration > 040, ghim tên mới sau khi gỡ hai ràng buộc cũ; E14 mới ở lõi so danh sách loại của 040 với CONNECTION_KINDS; 040 viết lặp lại được; AC-2 sửa lời |
| P1 | evals | Danh mục mẫu tự dựng đúng khuôn bên đọc, không round-trip; «trùng danh mục» chỉ một phần tử, không đo khác dạng cùng nghĩa | Danh mục thật ghi hướng tiếng Việt, mã căn chưa chuẩn hoá: kiểm trùng không bật, báo sai giả sang Invest | danhMuc từ bộ dữ liệu mẫu qua khuôn chiều vào; ma trận trùng 8 phần tử | fixed: E12 dùng danhMuc của bộ dữ liệu mẫu hàng 5 (tệp khuôn chiều vào v1 đọc được), ma trận «trùng danh mục» 8 phần tử kể cả 'a-01.01' và 'Southeast'; thiết kế §3.3 so sau cùng một phép chuẩn hoá; AC-9 sửa lời |
| P1 | design | Bảng lớp riêng của khuôn cho ba khoá cấp toà trái lý do d-6 và tự chứng nhận | Thêm khoá vào bảng khuôn gắn catalog: E8 xanh mà luật ẩn không biết | Ba khoá vào LOP_TRUONG hoặc dòng sổ; E8 ghim danh sách khoá | fixed: d-20261108T070319Z-6 thay bằng d-20261108T070929Z-22 (một lối: LOP_TRUONG khoá theo CanNoiBo, đổi là sửa mọi cửa ra ngoài vùng); E8 ghim trước đủ khoá từng loại, đòi hai bảng rời nhau, đối chứng âm khoá hai nơi; AC-6 sửa lời |
| P1 | evals | E1 thử 3/6 lớp ngoài danh mục; E5 cấp lồng do người viết tự định | agreementErrors thiếu custom_field mà E1 xanh; đối tượng lồng không strict mà E5 xanh | E1 lặp DATA_CLASSES; E5 rút cấp bằng đi cây zod, mỗi ZodObject strict | fixed: E1 lặp DATA_CLASSES trừ catalog + chiều vào + specialTerms (8 lần so); E5 thêm ca «mọi đối tượng strict» và rút danh sách cấp từ hàm đi cây (6 × số cấp) |
