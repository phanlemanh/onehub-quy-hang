---
schema_version: 1
slug: vo-ung-dung
feature: "Người trong sàn mở Quỹ hàng và thấy đúng vỏ theo thiết bị và vai: trên máy tính thanh trên, cột nhà và cột góc nhìn; trên điện thoại bốn tab dưới; telesales chỉ Hôm nay và «+ Lead»"
owner: phanlemanh@gmail.com
stage: decided              # discovery | decided | archived
decision: build   # build | iterate | park | kill — người ký Cổng 0 điền
decided_by: Manh Phan
decided_at: 2026-10-30T02:04:24Z   # ISO UTC
prototype:
  base_commit:     # điểm cắt nhánh proto khỏi nhánh chính — guard diffBase khi keep
  disposition:     # keep | archive
lo_trinh_ma: 53
lo_trinh_tep: docs/plan/lo-trinh.json
---

## Vấn đề & ai gặp

Mở từ hàng 53 của «Lộ trình onehub-quy-hang» (`docs/plan/lo-trinh.json`).
Nguồn: `wiki/dot/ban-dau-2910.md#867b6192ae2581fd453691e740592f736dda4cbc` — chưa có trang: trang nền

Người trong sàn mở Quỹ hàng và thấy đúng vỏ theo thiết bị và vai: trên máy tính thanh trên, cột nhà và cột góc nhìn; trên điện thoại bốn tab dưới; telesales chỉ Hôm nay và «+ Lead»

Vì sao: Mạnh 30/10: chọn vỏ và IA trên kho ReUI trước khi mở phiên làm màn (ADR-0002); hàng đổi khung giữ cả khu nên dựng một lần, trước màn đầu tiên

## Ngưỡng chết / ngưỡng UAT

- Câu hỏi phép đo trả lời: [đề xuất] đã đạt «Năm vai mẫu × hai bề rộng đúng bảng nhà và nút của Tham chiếu §9; gõ mã căn mở hồ sơ; trang khách và đăng nhập không có vỏ; sáng và tối đều đọc được» chưa?
- Kết quả nào là SỐNG: [đề xuất] Năm vai mẫu × hai bề rộng đúng bảng nhà và nút của Tham chiếu §9; gõ mã căn mở hồ sơ; trang khách và đăng nhập không có vỏ; sáng và tối đều đọc được
- Kết quả nào là CHẾT: [đề xuất] chưa đạt «Năm vai mẫu × hai bề rộng đúng bảng nhà và nút của Tham chiếu §9; gõ mã căn mở hồ sơ; trang khách và đăng nhập không có vỏ; sáng và tối đều đọc được» khi hết timebox
- Timebox: …
