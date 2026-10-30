---
schema_version: 1
slug: nhanh-tuc-thi
feature: Bảng hàng và hồ sơ đọc từ kho trên máy nên lọc, cuộn, mở hồ sơ không chờ mạng; sửa ghi trên máy trước, rớt mạng vài phút không mất thay đổi
owner: phanlemanh@gmail.com
stage: discovery              # discovery | decided | archived
decision:         # build | iterate | park | kill — người ký Cổng 0 điền
decided_by: 
decided_at:     # ISO UTC
prototype:
  base_commit:     # điểm cắt nhánh proto khỏi nhánh chính — guard diffBase khi keep
  disposition:     # keep | archive
lo_trinh_ma: 13
lo_trinh_tep: docs/plan/lo-trinh.json
---

## Vấn đề & ai gặp

Mở từ hàng 13 của «Lộ trình onehub-quy-hang» (`docs/plan/lo-trinh.json`).
Nguồn: `wiki/dot/ban-dau-2910.md#867b6192ae2581fd453691e740592f736dda4cbc` — chưa có trang: trang nền, mã N9

Bảng hàng và hồ sơ đọc từ kho trên máy nên lọc, cuộn, mở hồ sơ không chờ mạng; sửa ghi trên máy trước, rớt mạng vài phút không mất thay đổi

Vì sao: Tham chiếu luật 30–31; đứng trên kết luận của bài thử đồng bộ

## Ngưỡng chết / ngưỡng UAT

- Câu hỏi phép đo trả lời: [đề xuất] đã đạt «Mở hồ sơ không chờ mạng; rút mạng năm phút, sửa 20 ô, nối lại thì đủ 20 sự kiện lên máy chủ; thanh trên luôn nói đang ở đâu; hai người cùng sửa thì báo, «Đã bán» và «Đã cọc» thắng» chưa?
- Kết quả nào là SỐNG: [đề xuất] Mở hồ sơ không chờ mạng; rút mạng năm phút, sửa 20 ô, nối lại thì đủ 20 sự kiện lên máy chủ; thanh trên luôn nói đang ở đâu; hai người cùng sửa thì báo, «Đã bán» và «Đã cọc» thắng
- Kết quả nào là CHẾT: [đề xuất] chưa đạt «Mở hồ sơ không chờ mạng; rút mạng năm phút, sửa 20 ô, nối lại thì đủ 20 sự kiện lên máy chủ; thanh trên luôn nói đang ở đâu; hai người cùng sửa thì báo, «Đã bán» và «Đã cọc» thắng» khi hết timebox
- Timebox: …
