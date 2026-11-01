---
schema_version: 1
slug: the-ba-loi
feature: Chủ sản phẩm duyệt Cổng Phạm vi của một vòng chạm ô chưa có khuôn và thấy trang so ba lối — Trong kho, ReUI, Vẽ mới — cùng khổ 1440 và 375, mỗi lối một câu đánh đổi, lời khuyên của máy ghim trên trang; vòng chỉ đi khuôn sẵn thì không có trang ấy
owner: phanlemanh@gmail.com
stage: decided              # discovery | decided | archived
decision: build   # build | iterate | park | kill — người ký Cổng 0 điền
decided_by: Manh Phan
decided_at: 2026-10-31T23:58:34Z   # ISO UTC
prototype:
  base_commit:     # điểm cắt nhánh proto khỏi nhánh chính — guard diffBase khi keep
  disposition:     # keep | archive
lo_trinh_ma: 84
lo_trinh_tep: docs/plan/lo-trinh.json
---

## Vấn đề & ai gặp

Mở từ hàng 84 của «Lộ trình onehub-quy-hang» (`docs/plan/lo-trinh.json`).
Nguồn: `wiki/dot/cong-chon-khoi-0111.md#63e17c9393ef1f732823d3037cceab940ff9d2e2` — chưa có trang: trang nền, mã CK1

Chủ sản phẩm duyệt Cổng Phạm vi của một vòng chạm ô chưa có khuôn và thấy trang so ba lối — Trong kho, ReUI, Vẽ mới — cùng khổ 1440 và 375, mỗi lối một câu đánh đổi, lời khuyên của máy ghim trên trang; vòng chỉ đi khuôn sẵn thì không có trang ấy

Vì sao: ADR-0019 quyết định 1, 2: bước phân kỳ của design-pass luôn bị bỏ khi khối đích đã chốt, và ảnh đối chiếu màn đầu nhóm mới so với chính nó — đúng lúc chọn khối thì không có vật để duyệt

## Ngưỡng chết / ngưỡng UAT

- Câu hỏi phép đo trả lời: [đề xuất] đã đạt «Vòng thử có màn đầu nhóm mới: trang ba lối dựng đủ ba cột cùng khổ, cột không có ứng viên ghi «không có» kèm điều đã tra; design-pass ghi skipped → đỏ; vòng chỉ điền khe nhóm có sẵn → không có trang, không đỏ» chưa?
- Kết quả nào là SỐNG: [đề xuất] Vòng thử có màn đầu nhóm mới: trang ba lối dựng đủ ba cột cùng khổ, cột không có ứng viên ghi «không có» kèm điều đã tra; design-pass ghi skipped → đỏ; vòng chỉ điền khe nhóm có sẵn → không có trang, không đỏ
- Kết quả nào là CHẾT: [đề xuất] chưa đạt «Vòng thử có màn đầu nhóm mới: trang ba lối dựng đủ ba cột cùng khổ, cột không có ứng viên ghi «không có» kèm điều đã tra; design-pass ghi skipped → đỏ; vòng chỉ điền khe nhóm có sẵn → không có trang, không đỏ» khi hết timebox
- Timebox: …
