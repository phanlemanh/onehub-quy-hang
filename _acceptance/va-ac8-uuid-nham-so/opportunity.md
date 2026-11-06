---
schema_version: 1
slug: va-ac8-uuid-nham-so
feature: "Bài kiểm «AC-8 không dữ liệu thật» của bộ dữ liệu mẫu thấp tầng không còn đỏ chập chờn: mẫu dò số điện thoại chỉ bắt chuỗi đứng riêng như số điện thoại, không bắt dãy chữ số nằm trong UUID ngẫu nhiên; một số điện thoại thật cài vào bộ mẫu vẫn bị bắt."
owner: phanlemanh@gmail.com
stage: decided                # discovery | decided | archived
decision: build       # build | iterate | park | kill — người ký Cổng 0 điền
decided_by: Manh Phan
decided_at: 2026-11-06T17:20:06Z   # ISO UTC
prototype:
  base_commit:     # điểm cắt nhánh proto khỏi nhánh chính — guard diffBase khi keep
  disposition:     # keep | archive
lo_trinh_ma: va-ac8-uuid-nham-so
lo_trinh_tep: docs/plan/lo-trinh.json
---

## Vấn đề & ai gặp

Mở từ hàng va-ac8-uuid-nham-so của «Lộ trình onehub-quy-hang» (`docs/plan/lo-trinh.json`).

Bài kiểm «AC-8 không dữ liệu thật» của bộ dữ liệu mẫu thấp tầng không còn đỏ chập chờn: mẫu dò số điện thoại chỉ bắt chuỗi đứng riêng như số điện thoại, không bắt dãy chữ số nằm trong UUID ngẫu nhiên; một số điện thoại thật cài vào bộ mẫu vẫn bị bắt.

Vì sao: Dãy D báo 06/11 (D-0511-8): CI isolation của PR #151 đỏ một lần vì bài AC-8 (packages/db/tests/du-lieu-mau-thap-tang.test.mjs, hàng 73) bắt nhầm UUID chứa dãy giống số điện thoại; chạy lại thì xanh. Bài chập chờn làm hỏng check bắt buộc của mọi PR. Hàng vá kỹ thuật, không mã: giám sát quyết (chủ kho giao giám sát tự quyết việc kỹ thuật).

Cổng Đáng: hàng vá kỹ thuật, chủ kho giao giám sát tự quyết (vi_sao của hàng trên `docs/plan/lo-trinh.json`); giám sát xếp làm trước (BÁO E11 + AC-8, 06/11) và trả D-24 «duyet» 17:20Z. Hạng T3 theo `risk_tiers.t3_paths` (`packages/db/**`) — lộ trình ghi T2; Cổng Phạm vi, Gate 1.5 và Cổng Bằng chứng trình chủ kho. Ngưỡng UAT: không — thước là CI isolation hết đỏ chập chờn.

## Ngưỡng chết / ngưỡng UAT

- Câu hỏi phép đo trả lời: [đề xuất] đã đạt «Chạy bài AC-8 nhiều lần với UUID ngẫu nhiên không lần nào đỏ oan; cài một số dạng 0900 000 0xx vào bộ mẫu thì bài đỏ; không đổi bộ dữ liệu mẫu» chưa?
- Kết quả nào là SỐNG: [đề xuất] Chạy bài AC-8 nhiều lần với UUID ngẫu nhiên không lần nào đỏ oan; cài một số dạng 0900 000 0xx vào bộ mẫu thì bài đỏ; không đổi bộ dữ liệu mẫu
- Kết quả nào là CHẾT: [đề xuất] chưa đạt «Chạy bài AC-8 nhiều lần với UUID ngẫu nhiên không lần nào đỏ oan; cài một số dạng 0900 000 0xx vào bộ mẫu thì bài đỏ; không đổi bộ dữ liệu mẫu» khi hết timebox
- Timebox: …
