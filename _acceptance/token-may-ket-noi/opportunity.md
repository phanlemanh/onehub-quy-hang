---
schema_version: 1
slug: token-may-ket-noi
feature: Bên kia của một thoả thuận gọi API bằng token máy gắn đúng thoả thuận ấy — đẩy gói danh mục không cần phiên của quản trị sàn — và lời gọi kế bị từ chối ngay khi thoả thuận tắt hay token bị thu hồi
owner: phanlemanh@gmail.com
stage: decided                # discovery | decided | archived
decision: build # build | iterate | park | kill — người ký Cổng 0 điền
decided_by: Manh Phan
decided_at: 2026-11-05T12:56:24Z    # ISO UTC
prototype:
  base_commit:     # điểm cắt nhánh proto khỏi nhánh chính — guard diffBase khi keep
  disposition:     # keep | archive
lo_trinh_ma: 96
lo_trinh_tep: docs/plan/lo-trinh.json
---

## Vấn đề & ai gặp

Mở từ hàng 96 của «Lộ trình onehub-quy-hang» (`docs/plan/lo-trinh.json`).
Nguồn: `wiki/dot/xac-nhan-danh-muc-0311.md#fb1540377172027dcbc7535b3c822e1c65f72e8b` — chưa có trang: trang nền, mã XN4

Bên kia của một thoả thuận gọi API bằng token máy gắn đúng thoả thuận ấy — đẩy gói danh mục không cần phiên của quản trị sàn — và lời gọi kế bị từ chối ngay khi thoả thuận tắt hay token bị thu hồi

Vì sao: Issue #94 việc 3 (máy thu kéo bằng token máy); ADR-0015 để sau «khoá máy cho Invest tự đẩy». Lớp đăng nhập tách khỏi hộp thư theo luật 3

## Ngưỡng chết / ngưỡng UAT

- Câu hỏi phép đo trả lời: [đề xuất] đã đạt «Token hiện một lần, lưu dạng băm; token của thoả thuận này không gọi được loại kết nối hay chiều khác, không chạm dữ liệu sàn khác; thu hồi hay tắt thoả thuận thì lời gọi kế nhận 401/403; mỗi lời gọi một dòng nhật ký» chưa?
- Kết quả nào là SỐNG: [đề xuất] Token hiện một lần, lưu dạng băm; token của thoả thuận này không gọi được loại kết nối hay chiều khác, không chạm dữ liệu sàn khác; thu hồi hay tắt thoả thuận thì lời gọi kế nhận 401/403; mỗi lời gọi một dòng nhật ký
- Kết quả nào là CHẾT: [đề xuất] chưa đạt «Token hiện một lần, lưu dạng băm; token của thoả thuận này không gọi được loại kết nối hay chiều khác, không chạm dữ liệu sàn khác; thu hồi hay tắt thoả thuận thì lời gọi kế nhận 401/403; mỗi lời gọi một dòng nhật ký» khi hết timebox
- Timebox: …
