---
schema_version: 1
slug: va-ho-so-lan-rao-hang-lo-ngoai-khu
feature: Trong hồ sơ của căn lô hoặc căn ngoài khu, bấm vào một lần rao ở mục «Các lần rao» mở đúng lần rao ấy, không báo «không thấy căn».
owner: phanlemanh@gmail.com
stage: decided              # discovery | decided | archived
decision: build # build | iterate | park | kill — người ký Cổng 0 điền
decided_by: Manh Phan
decided_at: 2026-11-08T08:13:30Z # ISO UTC
prototype:
  base_commit:     # điểm cắt nhánh proto khỏi nhánh chính — guard diffBase khi keep
  disposition:     # keep | archive
lo_trinh_ma: va-ho-so-lan-rao-hang-lo-ngoai-khu
lo_trinh_tep: docs/plan/lo-trinh.json
---

## Vấn đề & ai gặp

Căn cứ quyết: chủ kho gõ ở phiên dãy X, lệnh ký Cổng Bằng chứng hàng 79, 08/11, nguyên văn «Ngoài-5: mở hợp đồng mới» (sổ `_acceptance/bang-hang-theo-loai-hinh/decisions.jsonl` d-20261108T081330Z-32).

Mở từ hàng va-ho-so-lan-rao-hang-lo-ngoai-khu của «Lộ trình onehub-quy-hang» (`docs/plan/lo-trinh.json`).

Trong hồ sơ của căn lô hoặc căn ngoài khu, bấm vào một lần rao ở mục «Các lần rao» mở đúng lần rao ấy, không báo «không thấy căn».

Vì sao: Ngoài của bang-hang-theo-loai-hinh (hàng 79, #208): chủ kho chọn «mở hợp đồng mới» ở Cổng Bằng chứng 08/11 (Ngoài-5, sổ d-20261108T081330Z-32). Hàng không mã — đã quyết. Dãy X.

## Ngưỡng chết / ngưỡng UAT

- Câu hỏi phép đo trả lời: [đề xuất] đã đạt «Mở hồ sơ một căn lô và một căn ngoài khu, bấm từng lần rao: hồ sơ mở đúng căn, không có «không thấy căn»» chưa?
- Kết quả nào là SỐNG: [đề xuất] Mở hồ sơ một căn lô và một căn ngoài khu, bấm từng lần rao: hồ sơ mở đúng căn, không có «không thấy căn»
- Kết quả nào là CHẾT: [đề xuất] chưa đạt «Mở hồ sơ một căn lô và một căn ngoài khu, bấm từng lần rao: hồ sơ mở đúng căn, không có «không thấy căn»» khi hết timebox
- Timebox: …
