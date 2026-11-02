---
schema_version: 1
slug: so-do-hai-tuan-thu
feature: "Số đo của hai tuần thử đọc được từ sự kiện của sàn thử: tỉ lệ xác nhận, mức đủ, mã tự điền, lead đến cuộc gọi đầu, lần phát, lượt mở, thao tác theo thiết bị và vai, lần mất mạng trên điện thoại"
owner: phanlemanh@gmail.com
stage: discovery              # discovery | decided | archived
decision:         # build | iterate | park | kill — người ký Cổng 0 điền
decided_by: 
decided_at:     # ISO UTC
prototype:
  base_commit:     # điểm cắt nhánh proto khỏi nhánh chính — guard diffBase khi keep
  disposition:     # keep | archive
lo_trinh_ma: 52
lo_trinh_tep: docs/plan/lo-trinh.json
---

## Vấn đề & ai gặp

Mở từ hàng 52 của «Lộ trình onehub-quy-hang» (`docs/plan/lo-trinh.json`).
Nguồn: `wiki/dot/ban-dau-2910.md#867b6192ae2581fd453691e740592f736dda4cbc` — chưa có trang: trang nền, mã M1

Số đo của hai tuần thử đọc được từ sự kiện của sàn thử: tỉ lệ xác nhận, mức đủ, mã tự điền, lead đến cuộc gọi đầu, lần phát, lượt mở, thao tác theo thiết bị và vai, lần mất mạng trên điện thoại

Vì sao: Tham chiếu §11; ngưỡng đặt ở Cổng Đáng của từng hàng, trước hai tuần thử (Mạnh 29/10)
Số đo hai tuần thử gần nhất (Tham chiếu §11): mọi số đo của §11 trừ «số ngày Sheet cũ không được sửa» — hàng này dựng chính các số đo — ngưỡng số đặt trước khi thử.

## Ngưỡng chết / ngưỡng UAT

- Câu hỏi phép đo trả lời: [đề xuất] đã đạt «Mỗi số đo ở Tham chiếu §11, trừ «số ngày Sheet cũ không được sửa», ra từ một truy vấn trên sự kiện, chạy trên dữ liệu mẫu» chưa?
- Kết quả nào là SỐNG: [đề xuất] Mỗi số đo ở Tham chiếu §11, trừ «số ngày Sheet cũ không được sửa», ra từ một truy vấn trên sự kiện, chạy trên dữ liệu mẫu
- Kết quả nào là CHẾT: [đề xuất] chưa đạt «Mỗi số đo ở Tham chiếu §11, trừ «số ngày Sheet cũ không được sửa», ra từ một truy vấn trên sự kiện, chạy trên dữ liệu mẫu» khi hết timebox
- Timebox: …
