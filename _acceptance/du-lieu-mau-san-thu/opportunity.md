---
schema_version: 1
slug: du-lieu-mau-san-thu
feature: Bộ dữ liệu mẫu của một sàn thử — một dự án căn hộ, hai mẫu file bảng hàng Excel, lead và chủ nhà giả — sinh từ khuôn của bảng hàng thật, mọi bản ghi mang nhãn mẫu
owner: phanlemanh@gmail.com
stage: decided              # discovery | decided | archived
decision: build   # build | iterate | park | kill — người ký Cổng 0 điền
decided_by: Manh Phan
decided_at: 2026-10-30T02:04:24Z   # ISO UTC
prototype:
  base_commit:     # điểm cắt nhánh proto khỏi nhánh chính — guard diffBase khi keep
  disposition:     # keep | archive
lo_trinh_ma: 5
lo_trinh_tep: docs/plan/lo-trinh.json
---

## Vấn đề & ai gặp

Mở từ hàng 5 của «Lộ trình onehub-quy-hang» (`docs/plan/lo-trinh.json`).
Nguồn: `wiki/dot/ban-dau-2910.md#867b6192ae2581fd453691e740592f736dda4cbc` — chưa có trang: trang nền

Bộ dữ liệu mẫu của một sàn thử — một dự án căn hộ, hai mẫu file bảng hàng Excel, lead và chủ nhà giả — sinh từ khuôn của bảng hàng thật, mọi bản ghi mang nhãn mẫu

Vì sao: Mạnh 29/10: dựng tính năng bằng dữ liệu mẫu, có người dùng thật thì chỉnh dần; dự án thử chọn sau

## Ngưỡng chết / ngưỡng UAT

- Câu hỏi phép đo trả lời: [đề xuất] đã đạt «Sinh lại hai lần ra cùng dữ liệu; không tên hay số điện thoại thật; mọi bản ghi mang nhãn mẫu và xoá được một lần» chưa?
- Kết quả nào là SỐNG: [đề xuất] Sinh lại hai lần ra cùng dữ liệu; không tên hay số điện thoại thật; mọi bản ghi mang nhãn mẫu và xoá được một lần
- Kết quả nào là CHẾT: [đề xuất] chưa đạt «Sinh lại hai lần ra cùng dữ liệu; không tên hay số điện thoại thật; mọi bản ghi mang nhãn mẫu và xoá được một lần» khi hết timebox
- Timebox: …
