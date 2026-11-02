---
schema_version: 1
slug: tab-toi
feature: Người dùng điện thoại cài Quỹ hàng lên màn hình chính, bật thông báo; đăng xuất hay báo mất máy thì dữ liệu trên máy bị xoá sạch
owner: phanlemanh@gmail.com
stage: discovery              # discovery | decided | archived
decision:         # build | iterate | park | kill — người ký Cổng 0 điền
decided_by: 
decided_at:     # ISO UTC
prototype:
  base_commit:     # điểm cắt nhánh proto khỏi nhánh chính — guard diffBase khi keep
  disposition:     # keep | archive
lo_trinh_ma: 38
lo_trinh_tep: docs/plan/lo-trinh.json
---

## Vấn đề & ai gặp

Mở từ hàng 38 của «Lộ trình onehub-quy-hang» (`docs/plan/lo-trinh.json`).
Nguồn: `wiki/dot/ban-dau-2910.md#867b6192ae2581fd453691e740592f736dda4cbc` — chưa có trang: trang nền, mã K9

Người dùng điện thoại cài Quỹ hàng lên màn hình chính, bật thông báo; đăng xuất hay báo mất máy thì dữ liệu trên máy bị xoá sạch

Vì sao: Luật 32; Kiến trúc §7
Số đo hai tuần thử gần nhất (Tham chiếu §11): Số lần mất mạng và thao tác lúc mất mạng trên điện thoại; tỉ lệ thao tác trên máy tính / điện thoại theo vai — ngưỡng số đặt trước khi thử.

## Ngưỡng chết / ngưỡng UAT

- Câu hỏi phép đo trả lời: [đề xuất] đã đạt «Người dùng điện thoại cài Quỹ hàng lên màn hình chính, bật thông báo; đăng xuất hay báo mất máy thì dữ liệu trên máy bị xoá sạch» chưa?
- Kết quả nào là SỐNG: [đề xuất] Người dùng điện thoại cài Quỹ hàng lên màn hình chính, bật thông báo; đăng xuất hay báo mất máy thì dữ liệu trên máy bị xoá sạch
- Kết quả nào là CHẾT: [đề xuất] chưa đạt «Người dùng điện thoại cài Quỹ hàng lên màn hình chính, bật thông báo; đăng xuất hay báo mất máy thì dữ liệu trên máy bị xoá sạch» khi hết timebox
- Timebox: …
