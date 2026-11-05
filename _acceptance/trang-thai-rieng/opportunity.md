---
schema_version: 1
slug: trang-thai-rieng
feature: Quản trị sàn thêm nhãn trạng thái riêng như «Giữ chỗ», bắt buộc neo vào một trong sáu trạng thái chuẩn và nhận luật, màu của trạng thái đó
owner: phanlemanh@gmail.com
stage: decided                # discovery | decided | archived
decision: build # build | iterate | park | kill — người ký Cổng 0 điền
decided_by: Manh Phan
decided_at: 2026-11-05T11:27:14Z    # ISO UTC
prototype:
  base_commit:     # điểm cắt nhánh proto khỏi nhánh chính — guard diffBase khi keep
  disposition:     # keep | archive
lo_trinh_ma: 46
lo_trinh_tep: docs/plan/lo-trinh.json
---

## Vấn đề & ai gặp

Mở từ hàng 46 của «Lộ trình onehub-quy-hang» (`docs/plan/lo-trinh.json`).
Nguồn: `wiki/dot/ban-dau-2910.md#867b6192ae2581fd453691e740592f736dda4cbc` — chưa có trang: trang nền, mã P9

Quản trị sàn thêm nhãn trạng thái riêng như «Giữ chỗ», bắt buộc neo vào một trong sáu trạng thái chuẩn và nhận luật, màu của trạng thái đó

Vì sao: Màn P1 (S2); luật «sàn thêm nhãn, không thêm nghĩa»

## Ngưỡng chết / ngưỡng UAT

- Câu hỏi phép đo trả lời: [đề xuất] đã đạt «Quản trị sàn thêm nhãn «Giữ chỗ» neo vào một trong sáu trạng thái chuẩn, căn mang nhãn ấy nhận đúng luật và màu của trạng thái neo ở Bảng hàng, Hôm nay và trang khách; không neo thì không lưu được; xoá nhãn đang dùng thì máy hỏi trạng thái thay; báo cáo vẫn đếm theo sáu trạng thái chuẩn» chưa?
- Kết quả nào là SỐNG: [đề xuất] Quản trị sàn thêm nhãn «Giữ chỗ» neo vào một trong sáu trạng thái chuẩn, căn mang nhãn ấy nhận đúng luật và màu của trạng thái neo ở Bảng hàng, Hôm nay và trang khách; không neo thì không lưu được; xoá nhãn đang dùng thì máy hỏi trạng thái thay; báo cáo vẫn đếm theo sáu trạng thái chuẩn
- Kết quả nào là CHẾT: [đề xuất] chưa đạt «Quản trị sàn thêm nhãn «Giữ chỗ» neo vào một trong sáu trạng thái chuẩn, căn mang nhãn ấy nhận đúng luật và màu của trạng thái neo ở Bảng hàng, Hôm nay và trang khách; không neo thì không lưu được; xoá nhãn đang dùng thì máy hỏi trạng thái thay; báo cáo vẫn đếm theo sáu trạng thái chuẩn» khi hết timebox
- Timebox: …
