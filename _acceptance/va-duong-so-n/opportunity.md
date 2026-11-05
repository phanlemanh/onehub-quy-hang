---
schema_version: 1
slug: va-duong-so-n
feature: "Bộ đọc địa chỉ đọc đúng tên đường dạng «Đường số N»: chữ «số» trong tên đường không bị lấy làm số nhà, hai đường «Đường số 5» và «Đường số 7» không bao giờ ra cùng khoá, «Số 10 Đường số 5» ra số nhà 10. Phải xong trước khi hàng 76 lưu khoá."
owner: phanlemanh@gmail.com
stage: decided                # discovery | decided | archived
decision: build # build | iterate | park | kill — người ký Cổng 0 điền
decided_by: Manh Phan
decided_at: 2026-11-05T22:10:12Z    # ISO UTC
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

- Câu hỏi phép đo trả lời: [đề xuất] đã đạt ««Đường số 5» và «Đường số 7» cùng số nhà không bao giờ ra cùng khoá; «Số 10 Đường số 5» ra số nhà 10, tên đường «Đường số 5»; các địa chỉ hàng 75 đã đọc đúng vẫn ra đúng khoá cũ» chưa?
- Kết quả nào là SỐNG: [đề xuất] «Đường số 5» và «Đường số 7» cùng số nhà không bao giờ ra cùng khoá; «Số 10 Đường số 5» ra số nhà 10, tên đường «Đường số 5»; các địa chỉ hàng 75 đã đọc đúng vẫn ra đúng khoá cũ
- Kết quả nào là CHẾT: [đề xuất] còn một cặp «Đường số N» khác nhau ra chung khoá, hoặc một địa chỉ hàng 75 đổi khoá
- Timebox: [đề xuất] một vòng, xong trước khi hàng 76 mở
