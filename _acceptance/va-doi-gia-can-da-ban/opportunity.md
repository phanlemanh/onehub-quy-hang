---
schema_version: 1
slug: va-doi-gia-can-da-ban
feature: "Vá đổi giá căn Đã bán: máy chủ từ chối lệnh đổi giá trên căn Đã bán với lý do rõ, kể cả khi bản trên máy đã mới; bộ đồng bộ đưa lệnh ấy vào «Cần xem»"
owner: phanlemanh@gmail.com
stage: decided                # discovery | decided | archived
decision: build   # build | iterate | park | kill — người ký Cổng 0 điền
decided_by: Manh Phan
decided_at: 2026-11-02T21:21:03Z   # ISO UTC
prototype:
  base_commit:     # điểm cắt nhánh proto khỏi nhánh chính — guard diffBase khi keep
  disposition:     # keep | archive
lo_trinh_ma: va-doi-gia-can-da-ban
lo_trinh_tep: docs/plan/lo-trinh.json
---

## Vấn đề & ai gặp

Mở từ hàng va-doi-gia-can-da-ban của «Lộ trình onehub-quy-hang» (`docs/plan/lo-trinh.json`).

Vá đổi giá căn Đã bán: máy chủ từ chối lệnh đổi giá trên căn Đã bán với lý do rõ, kể cả khi bản trên máy đã mới; bộ đồng bộ đưa lệnh ấy vào «Cần xem»

Vì sao: Dãy D báo khi làm hàng 28 (đợt dau-chu-dong-vao, 02/11): máy chủ nhận price_changed trên căn Đã bán (Closed) khi bản trên máy đã mới — luật trạng thái của hàng 8 chỉ chặn ở ô. Chủ kho 02/11: «hai lỗi máy chủ: mở hai hàng vá ở đợt kế»

## Ngưỡng chết / ngưỡng UAT

- Câu hỏi phép đo trả lời: [đề xuất] đã đạt «Căn Đã bán thì máy chủ từ chối lệnh đổi giá với lý do rõ bằng tiếng Việt, lịch sử và giá không đổi; bộ đồng bộ đưa lệnh bị từ chối vào «Cần xem» với lý do ấy; căn các trạng thái khác đổi giá như cũ; luật nằm ở packages/core, không chặn ở giao diện» chưa?
- Kết quả nào là SỐNG: [đề xuất] Căn Đã bán thì máy chủ từ chối lệnh đổi giá với lý do rõ bằng tiếng Việt, lịch sử và giá không đổi; bộ đồng bộ đưa lệnh bị từ chối vào «Cần xem» với lý do ấy; căn các trạng thái khác đổi giá như cũ; luật nằm ở packages/core, không chặn ở giao diện
- Kết quả nào là CHẾT: [đề xuất] chưa đạt «Căn Đã bán thì máy chủ từ chối lệnh đổi giá với lý do rõ bằng tiếng Việt, lịch sử và giá không đổi; bộ đồng bộ đưa lệnh bị từ chối vào «Cần xem» với lý do ấy; căn các trạng thái khác đổi giá như cũ; luật nằm ở packages/core, không chặn ở giao diện» khi hết timebox
- Timebox: …
