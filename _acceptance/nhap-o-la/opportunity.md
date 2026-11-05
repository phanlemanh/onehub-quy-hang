---
schema_version: 1
slug: nhap-o-la
feature: Đầu chủ thấy ô máy không đọc được — giá dải, «thu về 4.2», trạng thái lạ — có đề xuất kèm lý do và chọn một chạm
owner: phanlemanh@gmail.com
stage: discovery              # discovery | decided | archived
decision:         # build | iterate | park | kill — người ký Cổng 0 điền
decided_by: 
decided_at:     # ISO UTC
prototype:
  base_commit:     # điểm cắt nhánh proto khỏi nhánh chính — guard diffBase khi keep
  disposition:     # keep | archive
lo_trinh_ma: 69
lo_trinh_tep: docs/plan/lo-trinh.json
---

## Vấn đề & ai gặp

Mở từ hàng 69 của «Lộ trình onehub-quy-hang» (`docs/plan/lo-trinh.json`).
Nguồn: `wiki/dot/nhap-du-lieu-3110.md#071467f2c9f6b260c323903bbb9b5253349afd32` — chưa có trang: trang nền, mã ND6

Đầu chủ thấy ô máy không đọc được — giá dải, «thu về 4.2», trạng thái lạ — có đề xuất kèm lý do và chọn một chạm

Vì sao: ADR-0011 §5 «ô lạ còn lại»; đo Haiku 5.5 cho việc này

## Ngưỡng chết / ngưỡng UAT

- Câu hỏi phép đo trả lời: [đề xuất] đã đạt «Trên bộ ô lạ có đáp án (giá dải, «thu về 4.2», trạng thái lạ), đầu chủ thấy mỗi ô một đề xuất kèm lý do và chọn một chạm; đề xuất sai thì sửa tay được; không ô nào tự ghi khi người chưa chọn; thông tin chủ nhà không rời công ty» chưa?
- Kết quả nào là SỐNG: [đề xuất] Trên bộ ô lạ có đáp án (giá dải, «thu về 4.2», trạng thái lạ), đầu chủ thấy mỗi ô một đề xuất kèm lý do và chọn một chạm; đề xuất sai thì sửa tay được; không ô nào tự ghi khi người chưa chọn; thông tin chủ nhà không rời công ty
- Kết quả nào là CHẾT: [đề xuất] chưa đạt «Trên bộ ô lạ có đáp án (giá dải, «thu về 4.2», trạng thái lạ), đầu chủ thấy mỗi ô một đề xuất kèm lý do và chọn một chạm; đề xuất sai thì sửa tay được; không ô nào tự ghi khi người chưa chọn; thông tin chủ nhà không rời công ty» khi hết timebox
- Timebox: …
