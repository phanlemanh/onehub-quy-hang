---
schema_version: 1
slug: va-bang-hang-cot-thap-tang-khi-loc-rong
feature: Khi bộ lọc ở cột của hàng thấp tầng làm Bảng hàng ra rỗng, cột và ô lọc đang gõ vẫn ở nguyên để người dùng sửa, không phải xoá hết mọi bộ lọc.
owner: phanlemanh@gmail.com
stage: decided              # discovery | decided | archived
decision: build # build | iterate | park | kill — người ký Cổng 0 điền
decided_by: Manh Phan
decided_at: 2026-11-08T08:13:30Z # ISO UTC
prototype:
  base_commit:     # điểm cắt nhánh proto khỏi nhánh chính — guard diffBase khi keep
  disposition:     # keep | archive
lo_trinh_ma: va-bang-hang-cot-thap-tang-khi-loc-rong
lo_trinh_tep: docs/plan/lo-trinh.json
---

## Vấn đề & ai gặp

Căn cứ quyết: chủ kho gõ ở phiên dãy X, lệnh ký Cổng Bằng chứng hàng 79, 08/11, nguyên văn «Ngoài-4: mở hợp đồng mới» (sổ `_acceptance/bang-hang-theo-loai-hinh/decisions.jsonl` d-20261108T081330Z-31).

Mở từ hàng va-bang-hang-cot-thap-tang-khi-loc-rong của «Lộ trình onehub-quy-hang» (`docs/plan/lo-trinh.json`).

Khi bộ lọc ở cột của hàng thấp tầng làm Bảng hàng ra rỗng, cột và ô lọc đang gõ vẫn ở nguyên để người dùng sửa, không phải xoá hết mọi bộ lọc.

Vì sao: Ngoài của bang-hang-theo-loai-hinh (hàng 79, #208): chủ kho chọn «mở hợp đồng mới» ở Cổng Bằng chứng 08/11 (Ngoài-4, sổ d-20261108T081330Z-31). Hàng không mã — đã quyết. Dãy X.

## Ngưỡng chết / ngưỡng UAT

- Câu hỏi phép đo trả lời: [đề xuất] đã đạt «Gõ một giá trị không khớp vào ô lọc cột đất: bảng rỗng, cột và ô lọc còn nguyên, xoá ký tự trong ô thì hàng hiện lại» chưa?
- Kết quả nào là SỐNG: [đề xuất] Gõ một giá trị không khớp vào ô lọc cột đất: bảng rỗng, cột và ô lọc còn nguyên, xoá ký tự trong ô thì hàng hiện lại
- Kết quả nào là CHẾT: [đề xuất] chưa đạt «Gõ một giá trị không khớp vào ô lọc cột đất: bảng rỗng, cột và ô lọc còn nguyên, xoá ký tự trong ô thì hàng hiện lại» khi hết timebox
- Timebox: …
