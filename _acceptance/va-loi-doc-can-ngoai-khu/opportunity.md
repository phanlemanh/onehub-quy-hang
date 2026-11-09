---
schema_version: 1
slug: va-loi-doc-can-ngoai-khu
feature: Khi đọc danh sách căn ngoài khu bị lỗi mà máy chưa có bản giữ, Bảng hàng báo lỗi và có nút Thử lại, không âm thầm hiện các căn ngoài khu là «Chưa rõ».
owner: phanlemanh@gmail.com
stage: decided              # discovery | decided | archived
decision: build   # build | iterate | park | kill — người ký Cổng 0 điền
decided_by: Manh Phan
decided_at: 2026-11-08T08:13:30Z   # ISO UTC
prototype:
  base_commit:     # điểm cắt nhánh proto khỏi nhánh chính — guard diffBase khi keep
  disposition:     # keep | archive
lo_trinh_ma: va-loi-doc-can-ngoai-khu
lo_trinh_tep: docs/plan/lo-trinh.json
---

## Vấn đề & ai gặp

Mở từ hàng va-loi-doc-can-ngoai-khu của «Lộ trình onehub-quy-hang» (`docs/plan/lo-trinh.json`).

Khi đọc danh sách căn ngoài khu bị lỗi mà máy chưa có bản giữ, Bảng hàng báo lỗi và có nút Thử lại, không âm thầm hiện các căn ngoài khu là «Chưa rõ».

Vì sao: Ngoài của bang-hang-theo-loai-hinh (hàng 79, #208): chủ kho chọn «mở hợp đồng mới» ở Cổng Bằng chứng 08/11 (Ngoài-7, sổ d-20261108T081330Z-34). Hàng không mã — đã quyết. Dãy X.

Căn cứ quyết: chủ kho gõ ở phiên dãy X, lệnh ký Cổng Bằng chứng hàng 79, 08/11, nguyên văn «Ngoài-7: mở hợp đồng mới» (sổ `_acceptance/bang-hang-theo-loai-hinh/decisions.jsonl` d-20261108T081330Z-34).

## Ngưỡng chết / ngưỡng UAT

- Câu hỏi phép đo trả lời: [đề xuất] đã đạt «Giả lỗi mạng hay 5xx ở lần đầu trên máy mới: hiện câu báo và nút Thử lại; bấm khi mạng về thì căn ngoài khu hiện đúng» chưa?
- Kết quả nào là SỐNG: [đề xuất] Giả lỗi mạng hay 5xx ở lần đầu trên máy mới: hiện câu báo và nút Thử lại; bấm khi mạng về thì căn ngoài khu hiện đúng
- Kết quả nào là CHẾT: [đề xuất] chưa đạt «Giả lỗi mạng hay 5xx ở lần đầu trên máy mới: hiện câu báo và nút Thử lại; bấm khi mạng về thì căn ngoài khu hiện đúng» khi hết timebox
- Timebox: …
