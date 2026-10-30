---
schema_version: 1
slug: bai-thu-dong-bo-mat-mang
feature: Bộ đồng bộ đưa đúng phần mỗi người được thấy xuống máy, rút mạng năm phút rồi nối lại không mất thay đổi nào
owner: phanlemanh@gmail.com
stage: decided              # discovery | decided | archived
decision: build   # build | iterate | park | kill — người ký Cổng 0 điền
decided_by: Manh Phan
decided_at: 2026-10-30T02:04:24Z   # ISO UTC
prototype:
  base_commit:     # điểm cắt nhánh proto khỏi nhánh chính — guard diffBase khi keep
  disposition:     # keep | archive
lo_trinh_ma: 2
lo_trinh_tep: docs/plan/lo-trinh.json
---

## Vấn đề & ai gặp

Mở từ hàng 2 của «Lộ trình onehub-quy-hang» (`docs/plan/lo-trinh.json`).
Nguồn: `wiki/dot/ban-dau-2910.md#867b6192ae2581fd453691e740592f736dda4cbc` — chưa có trang: trang nền, mã B2

Bộ đồng bộ đưa đúng phần mỗi người được thấy xuống máy, rút mạng năm phút rồi nối lại không mất thay đổi nào

Vì sao: Kiến trúc §9 bước 1: chọn bộ đồng bộ (PowerSync, ElectricSQL hay tự làm mỏng) trước khi dựng phần nhanh tức thì

## Ngưỡng chết / ngưỡng UAT

- Câu hỏi phép đo trả lời: [đề xuất] đã đạt «Hai sàn mẫu, ba vai: không dòng nào của sàn kia và không số chủ của đầu chủ khác xuống máy; sau năm phút mất mạng mọi thay đổi lên máy chủ đúng thứ tự; ADR chọn bộ đồng bộ» chưa?
- Kết quả nào là SỐNG: [đề xuất] Hai sàn mẫu, ba vai: không dòng nào của sàn kia và không số chủ của đầu chủ khác xuống máy; sau năm phút mất mạng mọi thay đổi lên máy chủ đúng thứ tự; ADR chọn bộ đồng bộ
- Kết quả nào là CHẾT: [đề xuất] chưa đạt «Hai sàn mẫu, ba vai: không dòng nào của sàn kia và không số chủ của đầu chủ khác xuống máy; sau năm phút mất mạng mọi thay đổi lên máy chủ đúng thứ tự; ADR chọn bộ đồng bộ» khi hết timebox
- Timebox: …
