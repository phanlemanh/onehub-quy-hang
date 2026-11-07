---
schema_version: 1
slug: doi-nhan-so-phien-ban
feature: "Đổi nhãn tại chỗ của căn đang giao dịch hay đã bán đi qua phép so phiên bản như mọi lệnh đổi trạng thái: lệnh dựa trên bản cũ không âm thầm đè lần đổi trước hay kéo căn về trạng thái cũ, mà vào «Cần xem»."
owner: phanlemanh@gmail.com
stage: decided                # discovery | decided | archived
decision: build # nguồn: _acceptance/trang-thai-rieng/decisions.jsonl d-20261106T050934Z-34 «Ngoài-5: mở hợp đồng mới», d-20261106T050934Z-36 «Ngoài-7: mở hợp đồng mới» — build | iterate | park | kill — người ký Cổng 0 điền
decided_by: Manh Phan
decided_at: 2026-11-06T05:09:34Z    # ISO UTC
prototype:
  base_commit:     # điểm cắt nhánh proto khỏi nhánh chính — guard diffBase khi keep
  disposition:     # keep | archive
lo_trinh_ma: doi-nhan-so-phien-ban
lo_trinh_tep: docs/plan/lo-trinh.json
---

## Vấn đề & ai gặp

Mở từ hàng doi-nhan-so-phien-ban của «Lộ trình onehub-quy-hang» (`docs/plan/lo-trinh.json`).

Đổi nhãn tại chỗ của căn đang giao dịch hay đã bán đi qua phép so phiên bản như mọi lệnh đổi trạng thái: lệnh dựa trên bản cũ không âm thầm đè lần đổi trước hay kéo căn về trạng thái cũ, mà vào «Cần xem».

Vì sao: Ngoài-5 và Ngoài-7 của hàng 46 trang-thai-rieng (PR #153): đổi nhãn tại chỗ trong Đang giao dịch / Đã bán bỏ qua phép so phiên bản — hai người cùng đổi thì lần sau âm thầm đè, lệnh cũ có thể kéo căn từ Đang bán về Đang giao dịch. Chủ kho chọn «mở hợp đồng mới» ở Cổng Bằng chứng 06/11. Hàng không mã: đã quyết.

## Ngưỡng chết / ngưỡng UAT

- Câu hỏi phép đo trả lời: [đề xuất] đã đạt «Hai lệnh đổi nhãn cùng gốc phiên bản: lệnh sau vào Cần xem, không đè; lệnh đổi nhãn cũ gửi sau khi căn đã về Đang bán thì không kéo căn về; bài kiểm phủ cả Đang giao dịch và Đã bán» chưa?
- Kết quả nào là SỐNG: [đề xuất] Hai lệnh đổi nhãn cùng gốc phiên bản: lệnh sau vào Cần xem, không đè; lệnh đổi nhãn cũ gửi sau khi căn đã về Đang bán thì không kéo căn về; bài kiểm phủ cả Đang giao dịch và Đã bán
- Kết quả nào là CHẾT: [đề xuất] chưa đạt «Hai lệnh đổi nhãn cùng gốc phiên bản: lệnh sau vào Cần xem, không đè; lệnh đổi nhãn cũ gửi sau khi căn đã về Đang bán thì không kéo căn về; bài kiểm phủ cả Đang giao dịch và Đã bán» khi hết timebox
- Timebox: …
