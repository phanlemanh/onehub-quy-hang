---
slug: go-ma-lo
at: 2026-11-05T14:03:00Z
verdict: findings
p0: 2
p1: 2
p2: 1
---

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
| --- | --- | --- | --- | --- | --- |
| P0 | design | Dòng sổ «đường lô mặc định phục vụ khu [Mẫu] ở mọi môi trường» ghi nguồn mục-tiêu; câu trích sample.ts chỉ là tiền lệ căn hộ, đây là việc người dùng thật thấy [dia-chi-chuan#F2] | Chủ kho ký vì tưởng đã có nếp; người dùng thật tự điền thuộc tính của lô không tồn tại | Thành câu hỏi cho chủ kho, kho_dao true; E9 truyền danh mục tường minh và kiểm mặc định | human-gate1: Hỏi-1 (sổ dòng 9, thay dòng 5), máy khuyên không phục vụ lô mẫu; E9 dùng registerLotRoutes với danh mục truyền vào và kiểm createApi mặc định |
| P0 | design | Dòng sổ «bộ tra riêng» ghi nguồn một-lối nhưng lối «một đường tra chung mới» vẫn sống [hom-nay-dau-chu-dien-thoai#F1] | Hàng 77 phải đoán gõ căn hay lô để chọn đường | Sửa căn cứ, ghi điều kiện xét lại ở hàng 77 | fixed: dòng sổ 8 thay dòng 2, nguồn mục-tiêu ADR-0016 quyết định 7 (loại hình chọn một chạm trước khi gõ mã), revisit ở Cổng Phạm vi hàng 77 |
| P1 | contract/evals | AC-6, E6 chỉ đo trùng mã với dạng chuẩn; khu không có cách đọc chỉ khớp đúng mã nên «lk1 02» ra found khu 1 | Máy chọn hộ khi hai khu cùng có LK1-02 | E6 chạy đủ 12 kiểu × hai cấu hình | fixed: design §Khu chưa có cách đọc (khớp cả mã chuẩn do cách đọc khu khác đọc ra); AC-6 và E6 chạy mọi kiểu viết trên hai cấu hình |
| P1 | evals | Không có ma trận mã gần trúng của lô không có trong danh mục | Mẫu đọc không neo cắt «LK1-02A» thành LK1-02 | Ma trận gần trúng viết trước, không dòng nào found | fixed: AC-5 và E5 thêm ma trận sáu dòng gần trúng, phá thử ghim «mã khác ra lô có sẵn» |
| P2 | evals | E7 chỉ soi bốn trường của DN1-01 thay vì quan hệ với bảng loại hình [va-ho-so-lien-he#F3] | Lô Townhouse trả giá trị ở trường không dùng mà E7 vẫn xanh | Ma trận mọi lô × trường loại hình rút từ PROPERTY_SUBTYPE_FIELDS | fixed: AC-7 và E7 đo ma trận lô × trường, phá thử ghim «trường không dùng có giá trị» |
