---
schema_version: 1
slug: va-cdp-tat-chrome
feature: "Công cụ chụp màn dùng chung của các lượt chấm (cdp.mjs) luôn tắt Chrome do chính nó mở, kể cả khi tác tử chấm hết giờ hay bị ngắt: ghi PID, bắt tín hiệu thoát, dọn hồ sơ tạm; không còn Chrome chạy ẩn mồ côi sau lượt chấm."
owner: phanlemanh@gmail.com
stage: decided                # discovery | decided | archived
decision: build       # build | iterate | park | kill — người ký Cổng 0 điền
decided_by: Manh Phan
decided_at: 2026-11-06T04:19:40Z# ISO UTC
prototype:
  base_commit:     # điểm cắt nhánh proto khỏi nhánh chính — guard diffBase khi keep
  disposition:     # keep | archive
lo_trinh_ma: va-cdp-tat-chrome
lo_trinh_tep: docs/plan/lo-trinh.json
---

## Vấn đề & ai gặp

Mở từ hàng va-cdp-tat-chrome của «Lộ trình onehub-quy-hang» (`docs/plan/lo-trinh.json`).

Công cụ chụp màn dùng chung của các lượt chấm (cdp.mjs) luôn tắt Chrome do chính nó mở, kể cả khi tác tử chấm hết giờ hay bị ngắt: ghi PID, bắt tín hiệu thoát, dọn hồ sơ tạm; không còn Chrome chạy ẩn mồ côi sau lượt chấm.

Vì sao: Dãy B báo 05/11 (B-0511-?): _acceptance/bang-hang-kieu-sheet/thu/cdp.mjs chỉ p.kill() ở nhánh đóng thường nên Chrome chạy ẩn sót lại khi tác tử chấm hết giờ — bốn cái mồ côi giữ ~850 MB lúc máy báo áp lực bộ nhớ mức 2. Theo khuôn sửa chỗ thử của dãy D (a82b6f0b). Hàng vá kỹ thuật, không mã: giám sát quyết (chủ kho giao giám sát tự quyết việc kỹ thuật).

Cổng Đáng: hàng vá kỹ thuật, chủ kho giao giám sát tự quyết việc kỹ thuật (vi_sao của hàng trên `docs/plan/lo-trinh.json`, lộ trình qua PR #145); giám sát trả D-21 «duyet» 06/11 — build, T2 đường máy. Ngưỡng UAT: không — hàng vá công cụ chấm, không ra người dùng.

## Ngưỡng chết / ngưỡng UAT

- Câu hỏi phép đo trả lời: …
- Kết quả nào là SỐNG: …
- Kết quả nào là CHẾT: …
- Timebox: …
