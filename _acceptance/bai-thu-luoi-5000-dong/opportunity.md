---
schema_version: 1
slug: bai-thu-luoi-5000-dong
feature: Lưới bảng hàng 5.000 dòng × 20 cột cuộn, sửa trên ô và dán 500 ô từ Excel mà không giật trên máy tính văn phòng
owner: phanlemanh@gmail.com
stage: decided              # discovery | decided | archived
decision: build   # build | iterate | park | kill — người ký Cổng 0 điền
decided_by: Manh Phan
decided_at: 2026-10-30T02:04:24Z   # ISO UTC
prototype:
  base_commit:     # điểm cắt nhánh proto khỏi nhánh chính — guard diffBase khi keep
  disposition:     # keep | archive
lo_trinh_ma: 1
lo_trinh_tep: docs/plan/lo-trinh.json
---

## Vấn đề & ai gặp

Mở từ hàng 1 của «Lộ trình onehub-quy-hang» (`docs/plan/lo-trinh.json`).
Nguồn: `wiki/dot/ban-dau-2910.md#867b6192ae2581fd453691e740592f736dda4cbc` — chưa có trang: trang nền, mã B1

Lưới bảng hàng 5.000 dòng × 20 cột cuộn, sửa trên ô và dán 500 ô từ Excel mà không giật trên máy tính văn phòng

Vì sao: Kiến trúc §9 bước 1: chọn lưới ReUI hay lưới vẽ canvas trước khi dựng bảng hàng

## Ngưỡng chết / ngưỡng UAT

- Câu hỏi phép đo trả lời: [đề xuất] đã đạt «Trên dữ liệu sinh 5.000 dòng: cuộn và gõ không tụt khung hình thấy được, dán 500 ô xong dưới một giây; kết luận chọn lưới ghi thành ADR» chưa?
- Kết quả nào là SỐNG: [đề xuất] Trên dữ liệu sinh 5.000 dòng: cuộn và gõ không tụt khung hình thấy được, dán 500 ô xong dưới một giây; kết luận chọn lưới ghi thành ADR
- Kết quả nào là CHẾT: [đề xuất] chưa đạt «Trên dữ liệu sinh 5.000 dòng: cuộn và gõ không tụt khung hình thấy được, dán 500 ô xong dưới một giây; kết luận chọn lưới ghi thành ADR» khi hết timebox
- Timebox: …
