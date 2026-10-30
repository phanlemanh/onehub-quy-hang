---
schema_version: 1
slug: nhan-danh-muc-invest
feature: Gói danh mục Invest đẩy sang theo khuôn phiên bản 1 được nhận vào vùng danh mục dùng chung khi thoả thuận đang bật; gói sai khuôn hay thoả thuận tắt bị từ chối
owner: phanlemanh@gmail.com
stage: discovery              # discovery | decided | archived
decision:         # build | iterate | park | kill — người ký Cổng 0 điền
decided_by: 
decided_at:     # ISO UTC
prototype:
  base_commit:     # điểm cắt nhánh proto khỏi nhánh chính — guard diffBase khi keep
  disposition:     # keep | archive
lo_trinh_ma: 10
lo_trinh_tep: docs/plan/lo-trinh.json
---

## Vấn đề & ai gặp

Mở từ hàng 10 của «Lộ trình onehub-quy-hang» (`docs/plan/lo-trinh.json`).
Nguồn: `wiki/dot/ban-dau-2910.md#867b6192ae2581fd453691e740592f736dda4cbc` — chưa có trang: trang nền, mã N6

Gói danh mục Invest đẩy sang theo khuôn phiên bản 1 được nhận vào vùng danh mục dùng chung khi thoả thuận đang bật; gói sai khuôn hay thoả thuận tắt bị từ chối

Vì sao: ADR-0017 §5; khuôn đang ở phiên bản 0

## Ngưỡng chết / ngưỡng UAT

- Câu hỏi phép đo trả lời: [đề xuất] đã đạt «Gói đúng khuôn nạp được và chạy lại không nhân đôi; khoá lạ bị từ chối; tắt thoả thuận thì dừng nhận ngay» chưa?
- Kết quả nào là SỐNG: [đề xuất] Gói đúng khuôn nạp được và chạy lại không nhân đôi; khoá lạ bị từ chối; tắt thoả thuận thì dừng nhận ngay
- Kết quả nào là CHẾT: [đề xuất] chưa đạt «Gói đúng khuôn nạp được và chạy lại không nhân đôi; khoá lạ bị từ chối; tắt thoả thuận thì dừng nhận ngay» khi hết timebox
- Timebox: …
