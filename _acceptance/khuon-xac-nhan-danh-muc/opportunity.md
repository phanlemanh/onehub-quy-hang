---
schema_version: 1
slug: khuon-xac-nhan-danh-muc
feature: Sự kiện «xác nhận danh mục» chỉ dựng được từ lõi theo khuôn phiên bản 1 — khung toà, thuộc tính căn, báo sai, biểu mẫu đóng, kèm mã công ty và mã người mờ — và thoả thuận loại «xác nhận danh mục» chiều ra không mang được lớp nào ngoài danh mục
owner: phanlemanh@gmail.com
stage: discovery              # discovery | decided | archived
decision:         # build | iterate | park | kill — người ký Cổng 0 điền
decided_by: 
decided_at:     # ISO UTC
prototype:
  base_commit:     # điểm cắt nhánh proto khỏi nhánh chính — guard diffBase khi keep
  disposition:     # keep | archive
lo_trinh_ma: 95
lo_trinh_tep: docs/plan/lo-trinh.json
---

## Vấn đề & ai gặp

Mở từ hàng 95 của «Lộ trình onehub-quy-hang» (`docs/plan/lo-trinh.json`).
Nguồn: `wiki/dot/xac-nhan-danh-muc-0311.md#fb1540377172027dcbc7535b3c822e1c65f72e8b` — chưa có trang: trang nền, mã XN2

Sự kiện «xác nhận danh mục» chỉ dựng được từ lõi theo khuôn phiên bản 1 — khung toà, thuộc tính căn, báo sai, biểu mẫu đóng, kèm mã công ty và mã người mờ — và thoả thuận loại «xác nhận danh mục» chiều ra không mang được lớp nào ngoài danh mục

Vì sao: Issue #94 việc 2; ADR-0017 §6 sửa đổi 03/11. DN6 của Invest đợi khuôn này. Trần hiện tại chỉ chặn lớp nguồn; giá chốt vẫn mở được bằng điều khoản riêng nên loại kết nối này cần trần riêng

## Ngưỡng chết / ngưỡng UAT

- Câu hỏi phép đo trả lời: [đề xuất] đã đạt «Mỗi trường trong danh sách «không bao giờ có» (chủ nhà, số điện thoại, giá đáy, ảnh sổ, giá chốt, trạng thái hàng) và mọi chữ tự do làm luật ẩn từ chối; thoả thuận loại này mang lớp giao dịch hay lớp khác bị lõi và ràng buộc cơ sở dữ liệu cùng từ chối; mã công ty, mã người mờ ổn định theo từng bên nhận và không giải ngược được» chưa?
- Kết quả nào là SỐNG: [đề xuất] Mỗi trường trong danh sách «không bao giờ có» (chủ nhà, số điện thoại, giá đáy, ảnh sổ, giá chốt, trạng thái hàng) và mọi chữ tự do làm luật ẩn từ chối; thoả thuận loại này mang lớp giao dịch hay lớp khác bị lõi và ràng buộc cơ sở dữ liệu cùng từ chối; mã công ty, mã người mờ ổn định theo từng bên nhận và không giải ngược được
- Kết quả nào là CHẾT: [đề xuất] chưa đạt «Mỗi trường trong danh sách «không bao giờ có» (chủ nhà, số điện thoại, giá đáy, ảnh sổ, giá chốt, trạng thái hàng) và mọi chữ tự do làm luật ẩn từ chối; thoả thuận loại này mang lớp giao dịch hay lớp khác bị lõi và ràng buộc cơ sở dữ liệu cùng từ chối; mã công ty, mã người mờ ổn định theo từng bên nhận và không giải ngược được» khi hết timebox
- Timebox: …
