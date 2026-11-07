---
slug: va-thuoc-ci-ho-so-moi-truong-that
at: 2026-11-07T03:10:00Z
verdict: findings
p0: 1
p1: 3
p2: 1
---

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P0 | decisions, contract | Câu trích chỉ chứng cú pháp con trỏ, không quyết hai đích; gỡ vế AC-7 đã ký là lựa chọn chỉ người có | Cổng Phạm vi duyệt ánh xạ máy tự chọn; điều đã ký mất đo âm thầm | Mỗi con trỏ một dòng có câu trích quyết; gỡ vế AC-7 thành Hỏi | fixed: Hỏi-1 (thay moi-truong-that/E3 bằng va-deploy-csdl-tam#AC-2) và Hỏi-2 (vế AC-7 ghi Notes) thành câu hỏi cho chủ kho; con trỏ bat-rang-buoc-ban-ma/E4 có câu trích AC-1 của hồ sơ thay |
| P1 | design, evals | AC-1/E1 bỏ vế «bí mật ở environment production»; E7 đã ký đếm «tám dòng ĐẠT» | Vế production rơi mất, hoặc số dòng ĐẠT đổi làm E7 chấm lệch | Giữ đủ tám vế, dòng đối chứng in khác chữ ĐẠT | fixed: AC-1 và E1 liệt đủ tám vế; dòng đối chứng in «ĐỐI CHỨNG» |
| P1 | contract | Thiết kế sửa design doc của hai hồ sơ thay mà lưới chỉ chạy hai slug cũ | Hai hồ sơ thay đỏ ở PR sau | Lưới cho bốn slug | fixed: AC-4 và E4 chạy lưới cho bốn slug |
| P1 | opportunity, contract | Ngưỡng đòi làn ghim lại xanh mà không eval nào đo; hồ sơ cũ cần môi trường thật để ghim | Ngưỡng không đo được | Đo đúng vế đo được, khai vì sao không cần ghim | fixed: Đường đo đổi sang lưới trước gộp (job gate) trên nhánh và trên main; hàng chỉ đổi tệp trong _acceptance và thiết kế nên hai hồ sơ cũ không hoá cũ |
| P2 | evals | Đối chứng của kiem-thay chỉ một điều kiện; vế thẻ đứng riêng có thể hằng đúng | E3 xanh còn lưới kit đỏ | Đối chứng cho thay-khong-nhan và ho-so-thay-chua-ky | fixed: E3 thêm hai đối chứng đỏ gọi đúng tên điều kiện; timebox để người khai ở Cổng Giá trị |
