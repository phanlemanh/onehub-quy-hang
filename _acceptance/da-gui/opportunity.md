---
schema_version: 1
slug: da-gui
feature: "Đầu khách mở Đã gửi và thấy từng link: lượt khách mở, căn được quan tâm, căn vừa đổi kèm «Gợi ý căn thay»; tắt được link"
owner: phanlemanh@gmail.com
stage: discovery              # discovery | decided | archived
decision:         # build | iterate | park | kill — người ký Cổng 0 điền
decided_by: 
decided_at:     # ISO UTC
prototype:
  base_commit:     # điểm cắt nhánh proto khỏi nhánh chính — guard diffBase khi keep
  disposition:     # keep | archive
lo_trinh_ma: 36
lo_trinh_tep: docs/plan/lo-trinh.json
---

## Vấn đề & ai gặp

Mở từ hàng 36 của «Lộ trình onehub-quy-hang» (`docs/plan/lo-trinh.json`).
Nguồn: `wiki/dot/ban-dau-2910.md#867b6192ae2581fd453691e740592f736dda4cbc` — chưa có trang: trang nền, mã K6

Đầu khách mở Đã gửi và thấy từng link: lượt khách mở, căn được quan tâm, căn vừa đổi kèm «Gợi ý căn thay»; tắt được link

Vì sao: Màn P0 (G4); link không tự hết hạn ở bản đầu (29/10)
Số đo hai tuần thử gần nhất (Tham chiếu §11): Số link khách mở, số lượt quan tâm — ngưỡng số đặt trước khi thử.

## Ngưỡng chết / ngưỡng UAT

- Câu hỏi phép đo trả lời: [đề xuất] đã đạt «Đầu khách mở Đã gửi và thấy từng link: lượt khách mở, căn được quan tâm, căn vừa đổi kèm «Gợi ý căn thay»; tắt được link» chưa?
- Kết quả nào là SỐNG: [đề xuất] Đầu khách mở Đã gửi và thấy từng link: lượt khách mở, căn được quan tâm, căn vừa đổi kèm «Gợi ý căn thay»; tắt được link
- Kết quả nào là CHẾT: [đề xuất] chưa đạt «Đầu khách mở Đã gửi và thấy từng link: lượt khách mở, căn được quan tâm, căn vừa đổi kèm «Gợi ý căn thay»; tắt được link» khi hết timebox
- Timebox: …
