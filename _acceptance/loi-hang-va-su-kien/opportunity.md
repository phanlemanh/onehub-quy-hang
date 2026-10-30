---
schema_version: 1
slug: loi-hang-va-su-kien
feature: Mọi thay đổi của hàng đi qua một lệnh API và thành sự kiện chỉ thêm; sáu trạng thái chuẩn, độ tươi và mức đủ thông tin tính ra từ sự kiện
owner: phanlemanh@gmail.com
stage: decided              # discovery | decided | archived
decision: build   # build | iterate | park | kill — người ký Cổng 0 điền
decided_by: Manh Phan
decided_at: 2026-10-30T02:04:24Z   # ISO UTC
prototype:
  base_commit:     # điểm cắt nhánh proto khỏi nhánh chính — guard diffBase khi keep
  disposition:     # keep | archive
lo_trinh_ma: 8
lo_trinh_tep: docs/plan/lo-trinh.json
---

## Vấn đề & ai gặp

Mở từ hàng 8 của «Lộ trình onehub-quy-hang» (`docs/plan/lo-trinh.json`).
Nguồn: `wiki/dot/ban-dau-2910.md#867b6192ae2581fd453691e740592f736dda4cbc` — chưa có trang: trang nền, mã N4

Mọi thay đổi của hàng đi qua một lệnh API và thành sự kiện chỉ thêm; sáu trạng thái chuẩn, độ tươi và mức đủ thông tin tính ra từ sự kiện

Vì sao: Tham chiếu §4–§5, luật 8, 15, 16; một đường ghi cho mọi bề mặt

## Ngưỡng chết / ngưỡng UAT

- Câu hỏi phép đo trả lời: [đề xuất] đã đạt «Không đường ghi nào ngoài API; độ tươi và mức đủ tính lại đúng trên bộ ca kiểm; bảng mới có luật cách ly và ca trong bộ kiểm cách ly» chưa?
- Kết quả nào là SỐNG: [đề xuất] Không đường ghi nào ngoài API; độ tươi và mức đủ tính lại đúng trên bộ ca kiểm; bảng mới có luật cách ly và ca trong bộ kiểm cách ly
- Kết quả nào là CHẾT: [đề xuất] chưa đạt «Không đường ghi nào ngoài API; độ tươi và mức đủ tính lại đúng trên bộ ca kiểm; bảng mới có luật cách ly và ca trong bộ kiểm cách ly» khi hết timebox
- Timebox: …
