---
schema_version: 1
slug: doc-vung-danh-muc
feature: Đầu chủ gõ mã căn, mở Bảng hàng hay hồ sơ căn và thấy thuộc tính căn đọc từ vùng danh mục dùng chung — danh mục đã nhận từ nguồn danh mục — thay cho gói mẫu cố định; căn chưa có vẫn đi đường mã ngoài danh mục
owner: phanlemanh@gmail.com
stage: decided                # discovery | decided | archived
decision: build # build | iterate | park | kill — người ký Cổng 0 điền
decided_by: Manh Phan
decided_at: 2026-11-05T12:56:24Z    # ISO UTC
prototype:
  base_commit:     # điểm cắt nhánh proto khỏi nhánh chính — guard diffBase khi keep
  disposition:     # keep | archive
lo_trinh_ma: 99
lo_trinh_tep: docs/plan/lo-trinh.json
---

## Vấn đề & ai gặp

Mở từ hàng 99 của «Lộ trình onehub-quy-hang» (`docs/plan/lo-trinh.json`).
Nguồn: `wiki/dot/xac-nhan-danh-muc-0311.md#fb1540377172027dcbc7535b3c822e1c65f72e8b` — chưa có trang: trang nền, mã XN9

Đầu chủ gõ mã căn, mở Bảng hàng hay hồ sơ căn và thấy thuộc tính căn đọc từ vùng danh mục dùng chung — danh mục đã nhận từ nguồn danh mục — thay cho gói mẫu cố định; căn chưa có vẫn đi đường mã ngoài danh mục

Vì sao: ADR-0015 Hỏi-3 để «hàng kế»: mọi chỗ đọc danh mục vẫn đọc gói mẫu. Không có hàng này thì danh mục Invest vào mà không ai thấy

## Ngưỡng chết / ngưỡng UAT

- Câu hỏi phép đo trả lời: [đề xuất] đã đạt «Nạp một gói danh mục qua cửa nhận rồi gõ mã căn trong gói thì thấy đúng thuộc tính của gói; Bảng hàng ghép đúng loại căn, diện tích theo toà + mã; không còn chỗ đọc SAMPLE_CATALOG ngoài dữ liệu mẫu» chưa?
- Kết quả nào là SỐNG: [đề xuất] Nạp một gói danh mục qua cửa nhận rồi gõ mã căn trong gói thì thấy đúng thuộc tính của gói; Bảng hàng ghép đúng loại căn, diện tích theo toà + mã; không còn chỗ đọc SAMPLE_CATALOG ngoài dữ liệu mẫu
- Kết quả nào là CHẾT: [đề xuất] chưa đạt «Nạp một gói danh mục qua cửa nhận rồi gõ mã căn trong gói thì thấy đúng thuộc tính của gói; Bảng hàng ghép đúng loại căn, diện tích theo toà + mã; không còn chỗ đọc SAMPLE_CATALOG ngoài dữ liệu mẫu» khi hết timebox
- Timebox: …
