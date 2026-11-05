---
schema_version: 1
slug: luat-chia-lead
feature: Quản trị sàn đổi cách chia lead, hạn nhận và hạn gọi, ngưỡng hai hàng đợi của Hôm nay; đổi chỉ áp cho lead mới
owner: phanlemanh@gmail.com
stage: decided                # discovery | decided | archived
decision: build # build | iterate | park | kill — người ký Cổng 0 điền
decided_by: Manh Phan
decided_at: 2026-11-05T11:27:14Z    # ISO UTC
prototype:
  base_commit:     # điểm cắt nhánh proto khỏi nhánh chính — guard diffBase khi keep
  disposition:     # keep | archive
lo_trinh_ma: 48
lo_trinh_tep: docs/plan/lo-trinh.json
---

## Vấn đề & ai gặp

Mở từ hàng 48 của «Lộ trình onehub-quy-hang» (`docs/plan/lo-trinh.json`).
Nguồn: `wiki/dot/ban-dau-2910.md#867b6192ae2581fd453691e740592f736dda4cbc` — chưa có trang: trang nền, mã P11

Quản trị sàn đổi cách chia lead, hạn nhận và hạn gọi, ngưỡng hai hàng đợi của Hôm nay; đổi chỉ áp cho lead mới

Vì sao: Màn P1 (S3)

## Ngưỡng chết / ngưỡng UAT

- Câu hỏi phép đo trả lời: [đề xuất] đã đạt «Quản trị sàn đổi cách chia lead, hạn nhận, hạn gọi và ngưỡng hai hàng đợi của Hôm nay trong Cài đặt hợp nhất; lead mới đến sau lúc đổi theo luật mới, lead đã chia giữ luật cũ; màn dùng nhãn đã chốt ở Cổng Phạm vi 103; vai khác không đổi được» chưa?
- Kết quả nào là SỐNG: [đề xuất] Quản trị sàn đổi cách chia lead, hạn nhận, hạn gọi và ngưỡng hai hàng đợi của Hôm nay trong Cài đặt hợp nhất; lead mới đến sau lúc đổi theo luật mới, lead đã chia giữ luật cũ; màn dùng nhãn đã chốt ở Cổng Phạm vi 103; vai khác không đổi được
- Kết quả nào là CHẾT: [đề xuất] chưa đạt «Quản trị sàn đổi cách chia lead, hạn nhận, hạn gọi và ngưỡng hai hàng đợi của Hôm nay trong Cài đặt hợp nhất; lead mới đến sau lúc đổi theo luật mới, lead đã chia giữ luật cũ; màn dùng nhãn đã chốt ở Cổng Phạm vi 103; vai khác không đổi được» khi hết timebox
- Timebox: …
