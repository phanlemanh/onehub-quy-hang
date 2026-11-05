---
schema_version: 1
slug: chuan-hoa-moi-cua
feature: Đầu chủ gõ «dong nam», «bp», «Đang gd» ở ô bất kỳ và thấy máy gợi giá trị chuẩn; lựa chọn thành đề xuất từ điển của sàn; quản trị sàn duyệt và xem sức khoẻ dữ liệu
owner: phanlemanh@gmail.com
stage: decided                # discovery | decided | archived
decision: build # build | iterate | park | kill — người ký Cổng 0 điền
decided_by: Manh Phan
decided_at: 2026-11-05T12:56:24Z    # ISO UTC
prototype:
  base_commit:     # điểm cắt nhánh proto khỏi nhánh chính — guard diffBase khi keep
  disposition:     # keep | archive
lo_trinh_ma: 70
lo_trinh_tep: docs/plan/lo-trinh.json
---

## Vấn đề & ai gặp

Mở từ hàng 70 của «Lộ trình onehub-quy-hang» (`docs/plan/lo-trinh.json`).
Nguồn: `wiki/dot/nhap-du-lieu-3110.md#071467f2c9f6b260c323903bbb9b5253349afd32` — chưa có trang: trang nền, mã ND7

Đầu chủ gõ «dong nam», «bp», «Đang gd» ở ô bất kỳ và thấy máy gợi giá trị chuẩn; lựa chọn thành đề xuất từ điển của sàn; quản trị sàn duyệt và xem sức khoẻ dữ liệu

Vì sao: Chủ kho 31/10 «Duyệt hướng này» — ADR-0011 quyết định 12: chuẩn hoá ở mọi cửa vào

## Ngưỡng chết / ngưỡng UAT

- Câu hỏi phép đo trả lời: [đề xuất] đã đạt «Đầu chủ gõ «dong nam», «bp», «Đang gd» ở ô bất kỳ thì thấy máy gợi đúng giá trị chuẩn; chọn gợi ý thành đề xuất từ điển của sàn chờ quản trị sàn duyệt; quản trị sàn xem được sức khoẻ dữ liệu (bao nhiêu ô lạ, đã neo bao nhiêu); bộ chuẩn hoá dùng chung với lõi nhập, không gọi dịch vụ ngoài» chưa?
- Kết quả nào là SỐNG: [đề xuất] Đầu chủ gõ «dong nam», «bp», «Đang gd» ở ô bất kỳ thì thấy máy gợi đúng giá trị chuẩn; chọn gợi ý thành đề xuất từ điển của sàn chờ quản trị sàn duyệt; quản trị sàn xem được sức khoẻ dữ liệu (bao nhiêu ô lạ, đã neo bao nhiêu); bộ chuẩn hoá dùng chung với lõi nhập, không gọi dịch vụ ngoài
- Kết quả nào là CHẾT: [đề xuất] chưa đạt «Đầu chủ gõ «dong nam», «bp», «Đang gd» ở ô bất kỳ thì thấy máy gợi đúng giá trị chuẩn; chọn gợi ý thành đề xuất từ điển của sàn chờ quản trị sàn duyệt; quản trị sàn xem được sức khoẻ dữ liệu (bao nhiêu ô lạ, đã neo bao nhiêu); bộ chuẩn hoá dùng chung với lõi nhập, không gọi dịch vụ ngoài» khi hết timebox
- Timebox: …
