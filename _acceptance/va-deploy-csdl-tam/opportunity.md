---
schema_version: 1
slug: va-deploy-csdl-tam
feature: "Bước triển khai trên nhánh chính không còn chạy bộ kiểm cách ly trên cơ sở dữ liệu bản thật: bộ kiểm chạy trên một cơ sở dữ liệu tạm dựng từ migration của đúng lần gộp ấy; trên bản thật bước triển khai chỉ cập nhật cấu trúc dữ liệu rồi kiểm nhanh, chỉ đọc, rằng mọi bảng của công ty còn bật luật theo dòng và vai của API không là chủ bảng; bản thật nhận bản mới trong vài phút sau mỗi lần gộp và bước triển khai không giữ quá hai kết nối của bản thật."
owner: phanlemanh@gmail.com
stage: decided              # discovery | decided | archived
decision: build        # build | iterate | park | kill — người ký Cổng 0 điền
decided_by: Manh Phan
decided_at: 2026-11-06T08:17:03Z     # ISO UTC — chủ kho duyệt hàng khẩn (câu h-20261106T081703Z-15); giám sát báo «đã quyết», thợ Q ghi Cổng Đáng theo quyết định ấy
prototype:
  base_commit:     # điểm cắt nhánh proto khỏi nhánh chính — guard diffBase khi keep
  disposition:     # keep | archive
lo_trinh_ma: va-deploy-csdl-tam
lo_trinh_tep: docs/plan/lo-trinh.json
---

## Vấn đề & ai gặp

Mở từ hàng va-deploy-csdl-tam của «Lộ trình onehub-quy-hang» (`docs/plan/lo-trinh.json`).

Bước triển khai trên nhánh chính không còn chạy bộ kiểm cách ly trên cơ sở dữ liệu bản thật: bộ kiểm chạy trên một cơ sở dữ liệu tạm dựng từ migration của đúng lần gộp ấy; trên bản thật bước triển khai chỉ cập nhật cấu trúc dữ liệu rồi kiểm nhanh, chỉ đọc, rằng mọi bảng của công ty còn bật luật theo dòng và vai của API không là chủ bảng; bản thật nhận bản mới trong vài phút sau mỗi lần gộp và bước triển khai không giữ quá hai kết nối của bản thật.

Vì sao: Sự cố 06/11: job deploy trên main chạy db:migrate + bộ cách ly ~25 phút trên CSDL bản thật ở mỗi lần gộp; lượt 07:43Z tự làm cạn kết nối bản thật (3 bài đỏ EMAXCONNSESSION 08:03Z), cộng AC-9 đỏ từ 05/11 08:41Z làm bản thật đứng 22 giờ. Chủ kho duyệt hàng khẩn 06/11 ~08:20Z (câu h-20261106T081703Z-15). Hàng không mã: đã quyết.

## Ngưỡng chết / ngưỡng UAT

- Câu hỏi phép đo trả lời: [đề xuất] đã đạt «Job deploy trên main xanh ở lần gộp đầu tiên sau hàng này, xong dưới 5 phút, không bài nào chạy ghi trên CSDL bản thật; bảng thiếu luật theo dòng trên bản thật làm job đỏ trước khi gọi Vercel; bộ cách ly vẫn chạy đủ trên CSDL tạm và vẫn chặn triển khai khi đỏ» chưa?
- Kết quả nào là SỐNG: [đề xuất] Job deploy trên main xanh ở lần gộp đầu tiên sau hàng này, xong dưới 5 phút, không bài nào chạy ghi trên CSDL bản thật; bảng thiếu luật theo dòng trên bản thật làm job đỏ trước khi gọi Vercel; bộ cách ly vẫn chạy đủ trên CSDL tạm và vẫn chặn triển khai khi đỏ
- Kết quả nào là CHẾT: [đề xuất] chưa đạt «Job deploy trên main xanh ở lần gộp đầu tiên sau hàng này, xong dưới 5 phút, không bài nào chạy ghi trên CSDL bản thật; bảng thiếu luật theo dòng trên bản thật làm job đỏ trước khi gọi Vercel; bộ cách ly vẫn chạy đủ trên CSDL tạm và vẫn chặn triển khai khi đỏ» khi hết timebox
- Timebox: …
