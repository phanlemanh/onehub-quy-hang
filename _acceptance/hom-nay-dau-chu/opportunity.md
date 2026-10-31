---
schema_version: 1
slug: hom-nay-dau-chu
feature: Đầu chủ mở app vào Hôm nay và thấy các hàng đợi của mình — lead mới, cần gọi lại, nên gọi ép giá, thiếu thông tin, mới đổi — mỗi căn ở đúng một hàng đợi, ghi kết quả gọi một chạm
owner: phanlemanh@gmail.com
stage: discovery              # discovery | decided | archived
decision:         # build | iterate | park | kill — người ký Cổng 0 điền
decided_by: 
decided_at:     # ISO UTC
prototype:
  base_commit:     # điểm cắt nhánh proto khỏi nhánh chính — guard diffBase khi keep
  disposition:     # keep | archive
lo_trinh_ma: 22
lo_trinh_tep: docs/plan/lo-trinh.json
---

## Vấn đề & ai gặp

Mở từ hàng 22 của «Lộ trình onehub-quy-hang» (`docs/plan/lo-trinh.json`).
Nguồn: `wiki/dot/ban-dau-2910.md#867b6192ae2581fd453691e740592f736dda4cbc` — chưa có trang: trang nền, mã D10

Đầu chủ mở app vào Hôm nay và thấy các hàng đợi của mình — lead mới, cần gọi lại, nên gọi ép giá, thiếu thông tin, mới đổi — mỗi căn ở đúng một hàng đợi, ghi kết quả gọi một chạm

Vì sao: Màn P0 (1); luật 18; hàng đợi «Xin dẫn xem» chờ điều kiện
Số đo hai tuần thử gần nhất (Tham chiếu §11): Thời gian lead → cuộc gọi đầu; số căn gọi ép giá đợt hai — ngưỡng số đặt trước khi thử.

## Ngưỡng chết / ngưỡng UAT

- Câu hỏi phép đo trả lời: [đề xuất] đã đạt «Đầu chủ mở app vào Hôm nay và thấy các hàng đợi của mình — lead mới, cần gọi lại, nên gọi ép giá, thiếu thông tin, mới đổi — mỗi căn ở đúng một hàng đợi, ghi kết quả gọi một chạm» chưa?
- Kết quả nào là SỐNG: [đề xuất] Đầu chủ mở app vào Hôm nay và thấy các hàng đợi của mình — lead mới, cần gọi lại, nên gọi ép giá, thiếu thông tin, mới đổi — mỗi căn ở đúng một hàng đợi, ghi kết quả gọi một chạm
- Kết quả nào là CHẾT: [đề xuất] chưa đạt «Đầu chủ mở app vào Hôm nay và thấy các hàng đợi của mình — lead mới, cần gọi lại, nên gọi ép giá, thiếu thông tin, mới đổi — mỗi căn ở đúng một hàng đợi, ghi kết quả gọi một chạm» khi hết timebox
- Timebox: …
