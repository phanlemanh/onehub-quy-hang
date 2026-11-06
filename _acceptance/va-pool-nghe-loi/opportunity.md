---
schema_version: 1
slug: va-pool-nghe-loi
feature: "Máy chủ web không sập khi cơ sở dữ liệu cắt một kết nối đang rảnh: mọi bể kết nối gắn trình nghe lỗi, ghi nhật ký rồi bỏ kết nối hỏng; người đang dùng không gặp trang lỗi vì việc này."
owner: phanlemanh@gmail.com
stage: decided              # discovery | decided | archived
decision: build        # build | iterate | park | kill — người ký Cổng 0 điền
decided_by: Manh Phan
decided_at: 2026-11-06T03:29:57Z     # ISO UTC — chủ kho chọn «mở hợp đồng mới» cho Ngoài-3 ở Cổng Bằng chứng va-pool-ket-noi (d-20261106T032957Z-23); giám sát ghi Cổng Đáng theo quyết định ấy (yêu cầu V-1)
prototype:
  base_commit:     # điểm cắt nhánh proto khỏi nhánh chính — guard diffBase khi keep
  disposition:     # keep | archive
lo_trinh_ma: va-pool-nghe-loi
lo_trinh_tep: docs/plan/lo-trinh.json
---

## Vấn đề & ai gặp

Mở từ hàng va-pool-nghe-loi của «Lộ trình onehub-quy-hang» (`docs/plan/lo-trinh.json`).

Máy chủ web không sập khi cơ sở dữ liệu cắt một kết nối đang rảnh: mọi bể kết nối gắn trình nghe lỗi, ghi nhật ký rồi bỏ kết nối hỏng; người đang dùng không gặp trang lỗi vì việc này.

Vì sao: Ngoài-3 của va-pool-ket-noi (PR #155, sự cố bản thật 06/11 EMAXCONNSESSION): pg.Pool mới không gắn trình nghe error, pooler cắt kết nối rảnh thì tiến trình hàm có thể sập. Chủ kho chọn «mở hợp đồng mới» ở Cổng Bằng chứng 06/11. Hàng không mã: đã quyết.

## Ngưỡng chết / ngưỡng UAT

- Câu hỏi phép đo trả lời: [đề xuất] đã đạt «Giả lập cơ sở dữ liệu cắt kết nối rảnh thì tiến trình không sập, nhật ký có một dòng lỗi, lời gọi sau vẫn chạy; bài kiểm phủ cả hai bể» chưa?
- Kết quả nào là SỐNG: [đề xuất] Giả lập cơ sở dữ liệu cắt kết nối rảnh thì tiến trình không sập, nhật ký có một dòng lỗi, lời gọi sau vẫn chạy; bài kiểm phủ cả hai bể
- Kết quả nào là CHẾT: [đề xuất] chưa đạt «Giả lập cơ sở dữ liệu cắt kết nối rảnh thì tiến trình không sập, nhật ký có một dòng lỗi, lời gọi sau vẫn chạy; bài kiểm phủ cả hai bể» khi hết timebox
- Timebox: …
