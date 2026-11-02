---
schema_version: 1
slug: lead-dien-thoai
feature: "Telesales nhập lead trên điện thoại: thiếu một mục thì chưa gửi được, gửi xong theo dõi được bốn nấc"
owner: phanlemanh@gmail.com
stage: discovery              # discovery | decided | archived
decision:         # build | iterate | park | kill — người ký Cổng 0 điền
decided_by: 
decided_at:     # ISO UTC
prototype:
  base_commit:     # điểm cắt nhánh proto khỏi nhánh chính — guard diffBase khi keep
  disposition:     # keep | archive
lo_trinh_ma: 51
lo_trinh_tep: docs/plan/lo-trinh.json
---

## Vấn đề & ai gặp

Mở từ hàng 51 của «Lộ trình onehub-quy-hang» (`docs/plan/lo-trinh.json`).
Nguồn: `wiki/dot/ban-dau-2910.md#867b6192ae2581fd453691e740592f736dda4cbc` — chưa có trang: trang nền, mã L9

Telesales nhập lead trên điện thoại: thiếu một mục thì chưa gửi được, gửi xong theo dõi được bốn nấc

Vì sao: Màn P1 (L4, L5)
Số đo hai tuần thử gần nhất (Tham chiếu §11): Thời gian lead → cuộc gọi đầu; tỉ lệ thao tác trên máy tính / điện thoại theo vai — ngưỡng số đặt trước khi thử.

## Ngưỡng chết / ngưỡng UAT

- Câu hỏi phép đo trả lời: [đề xuất] đã đạt «Telesales nhập lead trên điện thoại: thiếu một mục thì chưa gửi được, gửi xong theo dõi được bốn nấc» chưa?
- Kết quả nào là SỐNG: [đề xuất] Telesales nhập lead trên điện thoại: thiếu một mục thì chưa gửi được, gửi xong theo dõi được bốn nấc
- Kết quả nào là CHẾT: [đề xuất] chưa đạt «Telesales nhập lead trên điện thoại: thiếu một mục thì chưa gửi được, gửi xong theo dõi được bốn nấc» khi hết timebox
- Timebox: …
