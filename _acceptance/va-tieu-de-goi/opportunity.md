---
schema_version: 1
slug: va-tieu-de-goi
feature: "Vá tiêu đề Cuộc gọi: trên điện thoại, đầu trang của màn ghi cuộc gọi hiện «Ghi cuộc gọi» thay vì «Căn call»; trang của một căn vẫn hiện mã căn như cũ"
owner: phanlemanh@gmail.com
stage: decided                # discovery | decided | archived
decision: build   # build | iterate | park | kill — người ký Cổng 0 điền
decided_by: Manh Phan
decided_at: 2026-11-02T21:27:43Z   # ISO UTC
prototype:
  base_commit:     # điểm cắt nhánh proto khỏi nhánh chính — guard diffBase khi keep
  disposition:     # keep | archive
lo_trinh_ma: va-tieu-de-goi
lo_trinh_tep: docs/plan/lo-trinh.json
---

## Vấn đề & ai gặp

Mở từ hàng va-tieu-de-goi của «Lộ trình onehub-quy-hang» (`docs/plan/lo-trinh.json`).

Vá tiêu đề Cuộc gọi: trên điện thoại, đầu trang của màn ghi cuộc gọi hiện «Ghi cuộc gọi» thay vì «Căn call»; trang của một căn vẫn hiện mã căn như cũ

Vì sao: Dãy D báo (tín hiệu D-25, 02/11, đợt dau-chu-dong-vao): titleOf ở vỏ ứng dụng coi mọi /units/<x> là mã căn nên màn ghi cuộc gọi của hàng 28 hiện «Căn call» trên điện thoại. Chủ kho: «tiêu đề Căn call: mở hàng vá ở đợt kế»

## Ngưỡng chết / ngưỡng UAT

- Câu hỏi phép đo trả lời: [đề xuất] đã đạt «Trên điện thoại /units/call và /units/call/dial hiện tiêu đề «Ghi cuộc gọi» (khớp nhãn nút Hỏi-8 của hàng 29); trang một căn thật vẫn hiện «Căn <mã>» như cũ; có bài kiểm cho titleOf phủ cả hai ca» chưa?
- Kết quả nào là SỐNG: [đề xuất] Trên điện thoại /units/call và /units/call/dial hiện tiêu đề «Ghi cuộc gọi» (khớp nhãn nút Hỏi-8 của hàng 29); trang một căn thật vẫn hiện «Căn <mã>» như cũ; có bài kiểm cho titleOf phủ cả hai ca
- Kết quả nào là CHẾT: [đề xuất] chưa đạt «Trên điện thoại /units/call và /units/call/dial hiện tiêu đề «Ghi cuộc gọi» (khớp nhãn nút Hỏi-8 của hàng 29); trang một căn thật vẫn hiện «Căn <mã>» như cũ; có bài kiểm cho titleOf phủ cả hai ca» khi hết timebox
- Timebox: …
