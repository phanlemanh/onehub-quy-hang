---
schema_version: 1
slug: luat-chia-lead-cap-han-hong
feature: "Ở mục «Luật chia lead», khi sàn đã có cặp hạn nhận / hạn gọi lưu sai từ trước, quản trị sửa một hạn thì màn báo đúng: hoặc lưu được cặp hợp lệ, hoặc báo lỗi kèm hạn kia — không báo «Đã lưu» trong khi lead mới vẫn chạy theo hạn mặc định."
owner: phanlemanh@gmail.com
stage: decided                # discovery | decided | archived
decision: build   # build | iterate | park | kill — người ký Cổng 0 điền
decided_by: Manh Phan
decided_at: 2026-11-05T22:10:32Z   # ISO UTC
prototype:
  base_commit:     # điểm cắt nhánh proto khỏi nhánh chính — guard diffBase khi keep
  disposition:     # keep | archive
lo_trinh_ma: luat-chia-lead-cap-han-hong
lo_trinh_tep: docs/plan/lo-trinh.json
---

## Vấn đề & ai gặp

Mở từ hàng luat-chia-lead-cap-han-hong của «Lộ trình onehub-quy-hang» (`docs/plan/lo-trinh.json`).

Ở mục «Luật chia lead», khi sàn đã có cặp hạn nhận / hạn gọi lưu sai từ trước, quản trị sửa một hạn thì màn báo đúng: hoặc lưu được cặp hợp lệ, hoặc báo lỗi kèm hạn kia — không báo «Đã lưu» trong khi lead mới vẫn chạy theo hạn mặc định.

Vì sao: Ngoài-2 và Ngoài-20 của hàng 48 luat-chia-lead (_acceptance/luat-chia-lead/review-findings.md). Chủ kho chọn «mở hợp đồng mới» ở Cổng Bằng chứng 06/11 (dãy D, yêu cầu D-19). Hàng không mã: đã quyết.

## Ngưỡng chết / ngưỡng UAT

- Câu hỏi phép đo trả lời: [đề xuất] đã đạt «Sàn có cặp hạn lưu sai từ trước: sửa một hạn ra cặp hợp lệ thì lưu và lead mới chạy theo cặp mới; ra cặp không hợp lệ thì màn báo lỗi nêu hạn kia, không hiện «Đã lưu»; bài kiểm phủ cả hai đường» chưa?
- Kết quả nào là SỐNG: [đề xuất] Sàn có cặp hạn lưu sai từ trước: sửa một hạn ra cặp hợp lệ thì lưu và lead mới chạy theo cặp mới; ra cặp không hợp lệ thì màn báo lỗi nêu hạn kia, không hiện «Đã lưu»; bài kiểm phủ cả hai đường
- Kết quả nào là CHẾT: [đề xuất] chưa đạt «Sàn có cặp hạn lưu sai từ trước: sửa một hạn ra cặp hợp lệ thì lưu và lead mới chạy theo cặp mới; ra cặp không hợp lệ thì màn báo lỗi nêu hạn kia, không hiện «Đã lưu»; bài kiểm phủ cả hai đường» khi hết timebox
- Timebox: …
