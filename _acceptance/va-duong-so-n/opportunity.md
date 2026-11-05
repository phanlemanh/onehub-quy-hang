---
schema_version: 1
slug: va-duong-so-n
feature: "Bộ đọc địa chỉ đọc đúng tên đường dạng «Đường số N»: chữ «số» trong tên đường không bị lấy làm số nhà, hai đường «Đường số 5» và «Đường số 7» không bao giờ ra cùng khoá, «Số 10 Đường số 5» ra số nhà 10. Phải xong trước khi hàng 76 lưu khoá."
owner: phanlemanh@gmail.com
stage: discovery              # discovery | decided | archived
decision:         # build | iterate | park | kill — người ký Cổng 0 điền
decided_by: 
decided_at:     # ISO UTC
prototype:
  base_commit:     # điểm cắt nhánh proto khỏi nhánh chính — guard diffBase khi keep
  disposition:     # keep | archive
lo_trinh_ma: va-duong-so-n
lo_trinh_tep: docs/plan/lo-trinh.json
---

## Vấn đề & ai gặp

Mở từ hàng va-duong-so-n của «Lộ trình onehub-quy-hang» (`docs/plan/lo-trinh.json`).

Bộ đọc địa chỉ đọc đúng tên đường dạng «Đường số N»: chữ «số» trong tên đường không bị lấy làm số nhà, hai đường «Đường số 5» và «Đường số 7» không bao giờ ra cùng khoá, «Số 10 Đường số 5» ra số nhà 10. Phải xong trước khi hàng 76 lưu khoá.

Vì sao: Ngoài-2 hàng 75 dia-chi-chuan: chủ kho chọn «mở hợp đồng mới» ở Cổng Bằng chứng (05/11). Hàng vá, không mã: đã quyết; chạy trước 76 để khoá địa chỉ đúng rồi mới được lưu.

## Ngưỡng chết / ngưỡng UAT

- Câu hỏi phép đo trả lời: …
- Kết quả nào là SỐNG: …
- Kết quả nào là CHẾT: …
- Timebox: …
