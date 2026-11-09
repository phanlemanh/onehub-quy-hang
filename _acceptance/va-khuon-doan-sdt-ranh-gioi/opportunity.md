---
schema_version: 1
slug: va-khuon-doan-sdt-ranh-gioi
feature: Số điện thoại dính dấu gạch hoặc dấu chấm trong khoá toà hay UPI (ví dụ dạng bld-0900000071, toa-090-000-0071) bị hàm dựng và khuôn Xác nhận danh mục từ chối giống dạng bld_0900000071; khoá dạng thật của Invest vẫn qua.
owner: phanlemanh@gmail.com
stage: decided                # discovery | decided | archived
decision: build   # build | iterate | park | kill — người ký Cổng 0 điền
decided_by: Manh Phan
decided_at: 2026-11-08T22:28:56Z   # ISO UTC — lúc ghi lệnh signoff hàng vá, chủ kho gõ ở phiên dãy G
prototype:
  base_commit:     # điểm cắt nhánh proto khỏi nhánh chính — guard diffBase khi keep
  disposition:     # keep | archive
lo_trinh_ma: va-khuon-doan-sdt-ranh-gioi
lo_trinh_tep: docs/plan/lo-trinh.json
---

## Vấn đề & ai gặp

Mở từ hàng va-khuon-doan-sdt-ranh-gioi của «Lộ trình onehub-quy-hang» (`docs/plan/lo-trinh.json`).

Số điện thoại dính dấu gạch hoặc dấu chấm trong khoá toà hay UPI (ví dụ dạng bld-0900000071, toa-090-000-0071) bị hàm dựng và khuôn Xác nhận danh mục từ chối giống dạng bld_0900000071; khoá dạng thật của Invest vẫn qua.

Vì sao: Ngoài-1 của va-khuon-xac-nhan-bao-sai-quet-ro-ri (#214): chủ kho chọn «mở hợp đồng mới» ở Cổng Bằng chứng 09/11 (sổ d-20261108T222856Z-14). Hàng không mã — đã quyết. Nên xong trước khi báo Invest ghim khuôn (onehub-invest#296). Dãy G.

Căn cứ Cổng Đáng: chủ kho gõ tại phiên dãy G, lệnh signoff hàng `va-khuon-xac-nhan-bao-sai-quet-ro-ri` ngày 09/11, nguyên văn «Ngoài-1: mở hợp đồng mới» (sổ `_acceptance/va-khuon-xac-nhan-bao-sai-quet-ro-ri/decisions.jsonl` d-20261108T222856Z-14); giám sát dẫn căn cứ ở yêu cầu G-37, không quyết mới. Máy đọc «mở hợp đồng mới» là `build`; chủ kho vẫn ký Cổng Phạm vi và Cổng Bằng chứng (T3).

## Ngưỡng chết / ngưỡng UAT

- Câu hỏi phép đo trả lời: [đề xuất] đã đạt «Khoá toà hay UPI có dãy số dáng điện thoại dính dấu gạch, dấu chấm bị từ chối ở cả hàm dựng và khuôn; khoá dạng thật của Invest trong bộ mẫu vẫn qua» chưa?
- Kết quả nào là SỐNG: [đề xuất] Khoá toà hay UPI có dãy số dáng điện thoại dính dấu gạch, dấu chấm bị từ chối ở cả hàm dựng và khuôn; khoá dạng thật của Invest trong bộ mẫu vẫn qua
- Kết quả nào là CHẾT: [đề xuất] chưa đạt «Khoá toà hay UPI có dãy số dáng điện thoại dính dấu gạch, dấu chấm bị từ chối ở cả hàm dựng và khuôn; khoá dạng thật của Invest trong bộ mẫu vẫn qua» khi hết timebox
- Timebox: …
