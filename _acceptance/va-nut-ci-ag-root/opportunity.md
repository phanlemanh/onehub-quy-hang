---
schema_version: 1
slug: va-nut-ci-ag-root
feature: Nút «Ghim lại hồ sơ cần bản thật» truyền --ag-root trỏ kit lấy theo tag cho làn ghim lại, để làn chạy được trên máy chủ GitHub không cài kit; kèm một phép đo chạy làn ghim lại giống CI (không có kit cài sẵn) để lỗi kiểu này không lọt nữa.
owner: phanlemanh@gmail.com
stage: decided                # discovery | decided | archived
decision: build   # build | iterate | park | kill — người ký Cổng 0 điền
decided_by: giám sát đợt dau-khach-nhap (Q-12)
decided_at: 2026-11-07T22:49:10Z     # ISO UTC — giám sát quyết build theo tiền lệ luật 64: vá lỗi của tính năng chủ kho đã chọn và ký (#194); chủ kho giữ quyền kéo lại, mọi cổng T3 do chủ kho ký ở phiên Q
prototype:
  base_commit:     # điểm cắt nhánh proto khỏi nhánh chính — guard diffBase khi keep
  disposition:     # keep | archive
lo_trinh_ma: va-nut-ci-ag-root
lo_trinh_tep: docs/plan/lo-trinh.json
---

## Vấn đề & ai gặp

Mở từ hàng va-nut-ci-ag-root của «Lộ trình onehub-quy-hang» (`docs/plan/lo-trinh.json`).

Nút «Ghim lại hồ sơ cần bản thật» truyền --ag-root trỏ kit lấy theo tag cho làn ghim lại, để làn chạy được trên máy chủ GitHub không cài kit; kèm một phép đo chạy làn ghim lại giống CI (không có kit cài sẵn) để lỗi kiểu này không lọt nữa.

Vì sao: lượt bấm đầu tiên của nút (run 42421859175, 08/11) đỏ ở bước «Ghim lại»: làn ghim lại tìm kit trong thư mục plugin của máy, máy chủ GitHub không cài kit nên làn dừng trước khi chạy eval nào. Phép đo cũ của hàng ghim-lai-ban-that-qua-ci chạy trên máy có kit cài sẵn nên không thấy. PR #192 chờ hàng này.

## Ngưỡng chết / ngưỡng UAT

- Câu hỏi phép đo trả lời: lượt bấm nút kế tiếp cho moi-truong-that có qua bước «Ghim lại» không?
- Kết quả nào là SỐNG: tệp đính kèm có dòng `kind: repin`, PR #192 hết «bằng chứng cũ».
- Kết quả nào là CHẾT: bước «Ghim lại» vẫn dừng vì không tìm thấy kit.
- Timebox: 1 ngày sau gộp.
