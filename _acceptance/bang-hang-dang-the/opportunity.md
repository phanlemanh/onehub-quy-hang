---
schema_version: 1
slug: bang-hang-dang-the
feature: Đầu khách mở Bảng hàng trên điện thoại, lọc theo nhu cầu khách thành thẻ, giữ lâu một thẻ để chọn nhiều căn
owner: phanlemanh@gmail.com
stage: decided              # discovery | decided | archived
decision: build   # build | iterate | park | kill — người ký Cổng 0 điền
decided_by: Manh Phan
decided_at: 2026-11-02T09:55:25Z   # ISO UTC
prototype:
  base_commit:     # điểm cắt nhánh proto khỏi nhánh chính — guard diffBase khi keep
  disposition:     # keep | archive
lo_trinh_ma: 32
lo_trinh_tep: docs/plan/lo-trinh.json
---

## Vấn đề & ai gặp

Mở từ hàng 32 của «Lộ trình onehub-quy-hang» (`docs/plan/lo-trinh.json`).
Nguồn: `wiki/dot/ban-dau-2910.md#867b6192ae2581fd453691e740592f736dda4cbc` — chưa có trang: trang nền, mã K2

Đầu khách mở Bảng hàng trên điện thoại, lọc theo nhu cầu khách thành thẻ, giữ lâu một thẻ để chọn nhiều căn

Vì sao: Màn P0 (M4)
Số đo hai tuần thử gần nhất (Tham chiếu §11): Thời gian khách hỏi → gửi được căn — ngưỡng số đặt trước khi thử.

## Ngưỡng chết / ngưỡng UAT

- Câu hỏi phép đo trả lời: [đề xuất] đã đạt «Đầu khách mở Bảng hàng trên điện thoại, lọc theo nhu cầu khách thành thẻ, giữ lâu một thẻ để chọn nhiều căn» chưa?
- Kết quả nào là SỐNG: [đề xuất] Đầu khách mở Bảng hàng trên điện thoại, lọc theo nhu cầu khách thành thẻ, giữ lâu một thẻ để chọn nhiều căn
- Kết quả nào là CHẾT: [đề xuất] chưa đạt «Đầu khách mở Bảng hàng trên điện thoại, lọc theo nhu cầu khách thành thẻ, giữ lâu một thẻ để chọn nhiều căn» khi hết timebox
- Timebox: …
