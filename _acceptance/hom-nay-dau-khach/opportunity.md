---
schema_version: 1
slug: hom-nay-dau-khach
feature: Đầu khách mở Hôm nay trên điện thoại và thấy khách vừa phản ứng, căn đã gửi vừa đổi, căn mới lên bảng khớp các bộ đã gửi
owner: phanlemanh@gmail.com
stage: decided              # discovery | decided | archived
decision: build   # build | iterate | park | kill — người ký Cổng 0 điền
decided_by: Manh Phan
decided_at: 2026-11-02T09:55:25Z   # ISO UTC
prototype:
  base_commit:     # điểm cắt nhánh proto khỏi nhánh chính — guard diffBase khi keep
  disposition:     # keep | archive
lo_trinh_ma: 37
lo_trinh_tep: docs/plan/lo-trinh.json
---

## Vấn đề & ai gặp

Mở từ hàng 37 của «Lộ trình onehub-quy-hang» (`docs/plan/lo-trinh.json`).
Nguồn: `wiki/dot/ban-dau-2910.md#867b6192ae2581fd453691e740592f736dda4cbc` — chưa có trang: trang nền, mã K7

Đầu khách mở Hôm nay trên điện thoại và thấy khách vừa phản ứng, căn đã gửi vừa đổi, căn mới lên bảng khớp các bộ đã gửi

Vì sao: Màn P0 (M6, phác 29/10); mục lịch xem chờ điều kiện
Số đo hai tuần thử gần nhất (Tham chiếu §11): Thời gian khách hỏi → gửi được căn — ngưỡng số đặt trước khi thử.

## Ngưỡng chết / ngưỡng UAT

- Câu hỏi phép đo trả lời: [đề xuất] đã đạt «Đầu khách mở Hôm nay trên điện thoại và thấy khách vừa phản ứng, căn đã gửi vừa đổi, căn mới lên bảng khớp các bộ đã gửi» chưa?
- Kết quả nào là SỐNG: [đề xuất] Đầu khách mở Hôm nay trên điện thoại và thấy khách vừa phản ứng, căn đã gửi vừa đổi, căn mới lên bảng khớp các bộ đã gửi
- Kết quả nào là CHẾT: [đề xuất] chưa đạt «Đầu khách mở Hôm nay trên điện thoại và thấy khách vừa phản ứng, căn đã gửi vừa đổi, căn mới lên bảng khớp các bộ đã gửi» khi hết timebox
- Timebox: …
