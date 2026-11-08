---
schema_version: 1
slug: va-nut-ci-gitleaks
feature: Nút «Ghim lại hồ sơ cần bản thật» trên GitHub cài gitleaks trước khi chạy làn ghim lại, để bài tự kiểm của rào trong làn chạy được trên máy chủ GitHub; lượt bấm lại không còn đỏ vì thiếu gitleaks.
owner: phanlemanh@gmail.com
stage: decided                # discovery | decided | archived
decision: build   # build | iterate | park | kill — người ký Cổng 0 điền
decided_by: giám sát đợt dau-khach-nhap (Q-13)
decided_at: 2026-11-08T06:55:25Z     # ISO UTC — giám sát quyết build theo tiền lệ Q-12 (va-nut-ci-ag-root): vá lỗi của tính năng chủ kho đã chọn và ký (#194); chủ kho giữ quyền kéo lại, mọi cổng T3 do chủ kho ký ở phiên Q
prototype:
  base_commit:     # điểm cắt nhánh proto khỏi nhánh chính — guard diffBase khi keep
  disposition:     # keep | archive
lo_trinh_ma: va-nut-ci-gitleaks
lo_trinh_tep: docs/plan/lo-trinh.json
---

## Vấn đề & ai gặp

Mở từ hàng va-nut-ci-gitleaks của «Lộ trình onehub-quy-hang» (`docs/plan/lo-trinh.json`).

Nút «Ghim lại hồ sơ cần bản thật» trên GitHub cài gitleaks trước khi chạy làn ghim lại, để bài tự kiểm của rào trong làn chạy được trên máy chủ GitHub; lượt bấm lại không còn đỏ vì thiếu gitleaks.

Vì sao: Giám sát thêm 08/11 trước đổi tài khoản: lượt bấm lại nút (run 42440631323) đỏ vì máy chủ GitHub không có gitleaks mà bài tự kiểm của rào cần; #192 va-thuoc-ci-moi-truong-that-ban-that chờ hàng này. Hàng vá kỹ thuật, dãy Q.

Chi tiết: run 42440631323 (hồ sơ moi-truong-that, nhánh của PR #192) qua được bước tìm kit, nhưng `npm run test:hooks`
(suite 4/7 và eval E9 của moi-truong-that) đỏ ở «gitleaks phải có trên CI»: máy chủ GitHub đặt `CI=true` mà luồng của
nút không cài gitleaks như job `check` của `ci.yml`.

## Ngưỡng chết / ngưỡng UAT

- Câu hỏi phép đo trả lời: lượt bấm nút kế tiếp cho moi-truong-that có qua bài tự kiểm của rào không?
- Kết quả nào là SỐNG: nhật ký bước «Ghim lại» có `npm run test:hooks → exit 0` ở suite và ở eval E9; bỏ bước cài thì
  phép đo của hàng đỏ.
- Kết quả nào là CHẾT: bài tự kiểm vẫn đỏ «gitleaks phải có trên CI».
- Timebox: 1 ngày sau gộp.
