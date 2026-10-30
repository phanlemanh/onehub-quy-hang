---
schema_version: 1
slug: truc-ai-thay-hang
feature: Đầu chủ để lead và hàng chưa khoá nguồn ở «Chỉ tôi»; hàng lên «Toàn sàn» thì cả sàn mới thấy
owner: phanlemanh@gmail.com
stage: discovery              # discovery | decided | archived
decision:         # build | iterate | park | kill — người ký Cổng 0 điền
decided_by: 
decided_at:     # ISO UTC
prototype:
  base_commit:     # điểm cắt nhánh proto khỏi nhánh chính — guard diffBase khi keep
  disposition:     # keep | archive
lo_trinh_ma: 12
lo_trinh_tep: docs/plan/lo-trinh.json
---

## Vấn đề & ai gặp

Mở từ hàng 12 của «Lộ trình onehub-quy-hang» (`docs/plan/lo-trinh.json`).
Nguồn: `wiki/dot/ban-dau-2910.md#867b6192ae2581fd453691e740592f736dda4cbc` — chưa có trang: trang nền, mã N8

Đầu chủ để lead và hàng chưa khoá nguồn ở «Chỉ tôi»; hàng lên «Toàn sàn» thì cả sàn mới thấy

Vì sao: Tham chiếu §6 trục 1

## Ngưỡng chết / ngưỡng UAT

- Câu hỏi phép đo trả lời: [đề xuất] đã đạt «lead và hàng chưa khoá nguồn ở «Chỉ tôi» chỉ người tạo đọc được qua API; lên «Toàn sàn» thì mọi người trong sàn đọc được, sàn khác vẫn không» chưa?
- Kết quả nào là SỐNG: [đề xuất] lead và hàng chưa khoá nguồn ở «Chỉ tôi» chỉ người tạo đọc được qua API; lên «Toàn sàn» thì mọi người trong sàn đọc được, sàn khác vẫn không
- Kết quả nào là CHẾT: [đề xuất] chưa đạt «lead và hàng chưa khoá nguồn ở «Chỉ tôi» chỉ người tạo đọc được qua API; lên «Toàn sàn» thì mọi người trong sàn đọc được, sàn khác vẫn không» khi hết timebox
- Timebox: …
