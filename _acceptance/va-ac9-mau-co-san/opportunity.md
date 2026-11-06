---
schema_version: 1
slug: va-ac9-mau-co-san
feature: Bài «AC-9 nạp và xoá một lần» của bộ dữ liệu mẫu thấp tầng chỉ đếm những dòng do chính bài nạp, nên chạy được trên cơ sở dữ liệu đã có sàn mẫu khác (như «[Mẫu] Sàn thử» trên bản thật); bước triển khai trên nhánh chính xanh lại và bản thật nhận bản mới sau mỗi lần gộp.
owner: phanlemanh@gmail.com
stage: decided                # discovery | decided | archived
decision: build       # build | iterate | park | kill — người ký Cổng 0 điền
decided_by: Manh Phan
decided_at: 2026-11-06T07:59:30Z   # ISO UTC
prototype:
  base_commit:     # điểm cắt nhánh proto khỏi nhánh chính — guard diffBase khi keep
  disposition:     # keep | archive
lo_trinh_ma: va-ac9-mau-co-san
lo_trinh_tep: docs/plan/lo-trinh.json
---

## Vấn đề & ai gặp

Mở từ hàng va-ac9-mau-co-san của «Lộ trình onehub-quy-hang» (`docs/plan/lo-trinh.json`).

Bài «AC-9 nạp và xoá một lần» của bộ dữ liệu mẫu thấp tầng chỉ đếm những dòng do chính bài nạp, nên chạy được trên cơ sở dữ liệu đã có sàn mẫu khác (như «[Mẫu] Sàn thử» trên bản thật); bước triển khai trên nhánh chính xanh lại và bản thật nhận bản mới sau mỗi lần gộp.

Vì sao: Sự cố 06/11: job deploy trên main đỏ liên tục từ 05/11 08:41Z vì AC-9 (packages/db/tests/du-lieu-mau-thap-tang.test.mjs) chạy trên CSDL bản thật và gặp sàn mẫu có sẵn — bản thật đứng 22 giờ, bản vá #155 không lên. Chủ kho cho triển khai tay 06/11 07:26Z và mở hàng vá này. Hàng không mã: đã quyết.

Cổng Đáng: chủ kho duyệt triển khai tay 06/11 07:26Z và mở hàng vá này (vi_sao của hàng trên `docs/plan/lo-trinh.json`, lộ trình qua PR #164); giám sát trả D-22 «duyet» 06/11 — build, T3 (chạm cơ sở dữ liệu), Cổng Phạm vi và Gate 1.5 trình chủ kho. Ngưỡng UAT: không — hàng vá bộ kiểm, không ra người dùng; thước sống là job deploy trên main xanh.

## Ngưỡng chết / ngưỡng UAT

- Câu hỏi phép đo trả lời: [đề xuất] đã đạt «Chạy bộ cách ly trên CSDL có sẵn sàn mẫu khác thì AC-9 xanh và không xoá dữ liệu không do bài nạp; job deploy trên main xanh ở lần gộp đầu tiên sau hàng này» chưa?
- Kết quả nào là SỐNG: [đề xuất] Chạy bộ cách ly trên CSDL có sẵn sàn mẫu khác thì AC-9 xanh và không xoá dữ liệu không do bài nạp; job deploy trên main xanh ở lần gộp đầu tiên sau hàng này
- Kết quả nào là CHẾT: [đề xuất] chưa đạt «Chạy bộ cách ly trên CSDL có sẵn sàn mẫu khác thì AC-9 xanh và không xoá dữ liệu không do bài nạp; job deploy trên main xanh ở lần gộp đầu tiên sau hàng này» khi hết timebox
- Timebox: …
