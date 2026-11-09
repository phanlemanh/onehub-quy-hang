---
slug: va-ci-secrets-quet-dung-lich-su
at: 2026-11-09T06:30:00Z
verdict: findings
p0: 3
p1: 2
p2: 0
---

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P0 | contract | Hỏi-1 chỉ nói nhánh chưa mở PR; tag ngoài HEAD và nhánh không bao giờ mở PR là mất hẳn nhưng không được khai [va-khuon-xac-nhan-bao-sai-quet-ro-ri#F1]. | Người ký tin độ phủ chỉ đến muộn hơn, trong khi tag mang khoá không bao giờ được quét. | Mở rộng Hỏi-1 ở sổ, design, Out of scope. | human-gate1: dòng sổ -8 thay -4 thành Hỏi-1 mở rộng; design và Out of scope đã nêu, kèm số tag thật của kho. |
| P0 | design | Sổ ghi một-lối cho --log-opts, design lại viết lối thu hẹp làm được. | Người ký không cân nhắc lối còn sống, không thấy giá lệnh gắn mặc định gitleaks 8.30.1. | Bỏ một-lối, trình thành khuyến nghị kèm đánh đổi. | human-gate1: dòng sổ -9 thay -3 thành Hỏi-2; Notes hợp đồng ghi giá nâng bản. |
| P0 | contract | Sổ ghi một-lối cho cách đo; kho GitHub tạm không bị lý do đó loại; bộ đo tự đặt HEAD nên thêm ref: ở checkout lọt. | Bước checkout bị thêm ref: đỉnh nhánh PR, khoá ở phần main mới hơn điểm rẽ lọt qua trên pull_request mà M3 và E7 vẫn xanh. | Sửa căn cứ; vế tĩnh cấm ref:, bản phá thứ mười một, đối chứng HEAD lệch. | human-gate1 + fixed: dòng sổ -10 thay -5 thành Hỏi-3; AC-7 vế V2 và bản phá thêm ref:; ca M11; M3 đặt khoá mới hơn điểm rẽ. |
| P1 | evals | AC-6 ghim 9 ở mốc một mà Given chỉ tạo ref 66b6521d; bản sao chung không ghim tập ref. | E6 phụ thuộc ref thừa của máy chấm, đổi máy là hỏng dù bản vá đúng. | Xoá ref ngoài khai, in phát hiện theo commit. | fixed: mỗi mốc là kho tạm mượn đối tượng chỉ có đúng ref đã khai; đo lại ra {66b6521d: 6} và {f848f717: 3}; AC-6, E6, design đã sửa. |
| P1 | evals | Lời hứa quan hệ nhưng E5 chỉ đo 9 dòng có mặt, E7 so một commit; số vế không ghi; chú thích trên job có thể bị coi ngoài job. | Thêm dòng thứ mười vào tệp bỏ qua để xanh mà E5 và E7 không thấy; hai commit sửa ci.yml đo nhầm. | Đo theo commit của hàng; ghi danh sách vế cố định. | fixed: AC-5 thêm vế không commit nào của hàng chạm .gitleaksignore; AC-7 ghi V1–V7 cố định, đo từng commit của hàng (trước gộp theo nhánh, sau gộp theo slug — khác đề xuất merge-base vì merge-base sẽ đỏ oan khi hồ sơ được ghim lại trên nhánh sau đổi ci.yml hợp lệ), đối chứng khối chú thích. |
