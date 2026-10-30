---
schema_version: 1
slug: bai-thu-zalo
feature: Link trang khách dán vào Zalo hiện ảnh xem trước, và lượt Zalo tự lấy ảnh không bị tính là khách mở
owner: phanlemanh@gmail.com
stage: decided              # discovery | decided | archived
decision: build   # build | iterate | park | kill — người ký Cổng 0 điền
decided_by: Manh Phan
decided_at: 2026-10-30T02:04:24Z   # ISO UTC
prototype:
  base_commit:     # điểm cắt nhánh proto khỏi nhánh chính — guard diffBase khi keep
  disposition:     # keep | archive
lo_trinh_ma: 3
lo_trinh_tep: docs/plan/lo-trinh.json
---

## Vấn đề & ai gặp

Mở từ hàng 3 của «Lộ trình onehub-quy-hang» (`docs/plan/lo-trinh.json`).
Nguồn: `wiki/dot/ban-dau-2910.md#867b6192ae2581fd453691e740592f736dda4cbc` — chưa có trang: trang nền, mã B3

Link trang khách dán vào Zalo hiện ảnh xem trước, và lượt Zalo tự lấy ảnh không bị tính là khách mở

Vì sao: Kiến trúc §9 bước 1: trang khách và luồng Gửi đứng trên hành vi thật của Zalo

## Ngưỡng chết / ngưỡng UAT

- Câu hỏi phép đo trả lời: [đề xuất] đã đạt «Thử với Zalo thật trên Android và iPhone: ảnh xem trước hiện, lượt tự lấy không vào số mở; chia sẻ ảnh + tin từ web trên iPhone mở được bảng chia sẻ; kéo ảnh từ Zalo trên máy tính vào trình duyệt được» chưa?
- Kết quả nào là SỐNG: [đề xuất] Thử với Zalo thật trên Android và iPhone: ảnh xem trước hiện, lượt tự lấy không vào số mở; chia sẻ ảnh + tin từ web trên iPhone mở được bảng chia sẻ; kéo ảnh từ Zalo trên máy tính vào trình duyệt được
- Kết quả nào là CHẾT: [đề xuất] chưa đạt «Thử với Zalo thật trên Android và iPhone: ảnh xem trước hiện, lượt tự lấy không vào số mở; chia sẻ ảnh + tin từ web trên iPhone mở được bảng chia sẻ; kéo ảnh từ Zalo trên máy tính vào trình duyệt được» khi hết timebox
- Timebox: …
