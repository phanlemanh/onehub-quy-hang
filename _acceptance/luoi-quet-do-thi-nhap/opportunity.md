---
schema_version: 1
slug: luoi-quet-do-thi-nhap
feature: Bài quét khuôn giao diện đọc cả đồ thị nhập của màn chứ không chỉ page.tsx, và cấm Toaster ngoài vỏ; sáu chỗ đang có ghi ngoại lệ có hạn ở bản đồ khuôn theo ADR-0024 quyết định 9, mức nợ giữ trần 0.
owner: phanlemanh@gmail.com
stage: discovery              # discovery | decided | archived
decision:         # build | iterate | park | kill — người ký Cổng 0 điền
decided_by: 
decided_at:     # ISO UTC
prototype:
  base_commit:     # điểm cắt nhánh proto khỏi nhánh chính — guard diffBase khi keep
  disposition:     # keep | archive
lo_trinh_ma: luoi-quet-do-thi-nhap
lo_trinh_tep: docs/plan/lo-trinh.json
---

## Vấn đề & ai gặp

Mở từ hàng luoi-quet-do-thi-nhap của «Lộ trình onehub-quy-hang» (`docs/plan/lo-trinh.json`).

Bài quét khuôn giao diện đọc cả đồ thị nhập của màn chứ không chỉ page.tsx, và cấm Toaster ngoài vỏ; sáu chỗ đang có ghi ngoại lệ có hạn ở bản đồ khuôn theo ADR-0024 quyết định 9, mức nợ giữ trần 0.

Vì sao: Việc 1, mục 5 của docs/plan/tang-dieu-khien-ui.md (PR #233); tách phần không phụ thuộc của luoi-mau-hanh-vi để chặn lỗi tái phát trong lúc các hàng Cài đặt đang làm. Chủ kho 09/11 «Mở PR, chuyển giám sát». Dãy X.

## Ngưỡng chết / ngưỡng UAT

- Câu hỏi phép đo trả lời: [đề xuất] đã đạt «Một màn đặt khung thừa ở tệp thân ngoài page.tsx thì bài quét đỏ; thêm một Toaster ngoài vỏ thì lint đỏ; sáu chỗ cũ có ngoại lệ có hạn, mức nợ vẫn 0» chưa?
- Kết quả nào là SỐNG: [đề xuất] Một màn đặt khung thừa ở tệp thân ngoài page.tsx thì bài quét đỏ; thêm một Toaster ngoài vỏ thì lint đỏ; sáu chỗ cũ có ngoại lệ có hạn, mức nợ vẫn 0
- Kết quả nào là CHẾT: [đề xuất] chưa đạt «Một màn đặt khung thừa ở tệp thân ngoài page.tsx thì bài quét đỏ; thêm một Toaster ngoài vỏ thì lint đỏ; sáu chỗ cũ có ngoại lệ có hạn, mức nợ vẫn 0» khi hết timebox
- Timebox: …
