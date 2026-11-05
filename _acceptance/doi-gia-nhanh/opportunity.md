---
schema_version: 1
slug: doi-gia-nhanh
feature: Đầu chủ đổi giá hoặc trạng thái nhanh trên điện thoại sau cuộc gọi, theo đúng luật sửa giá
owner: phanlemanh@gmail.com
stage: discovery              # discovery | decided | archived
decision:         # build | iterate | park | kill — người ký Cổng 0 điền
decided_by: 
decided_at:     # ISO UTC
prototype:
  base_commit:     # điểm cắt nhánh proto khỏi nhánh chính — guard diffBase khi keep
  disposition:     # keep | archive
lo_trinh_ma: 40
lo_trinh_tep: docs/plan/lo-trinh.json
---

## Vấn đề & ai gặp

Mở từ hàng 40 của «Lộ trình onehub-quy-hang» (`docs/plan/lo-trinh.json`).
Nguồn: `wiki/dot/ban-dau-2910.md#867b6192ae2581fd453691e740592f736dda4cbc` — chưa có trang: trang nền, mã P2

Đầu chủ đổi giá hoặc trạng thái nhanh trên điện thoại sau cuộc gọi, theo đúng luật sửa giá

Vì sao: Màn P1 (M2)

## Ngưỡng chết / ngưỡng UAT

- Câu hỏi phép đo trả lời: [đề xuất] đã đạt «Sau cuộc gọi, đầu chủ đổi giá hay trạng thái một căn trên điện thoại trong vài chạm theo đúng luật sửa giá; giá mới hiện ở Bảng hàng và trang khách đang mở; đổi trái luật thì máy chặn và nói lý do; dòng thời gian của căn ghi ai đổi, lúc nào» chưa?
- Kết quả nào là SỐNG: [đề xuất] Sau cuộc gọi, đầu chủ đổi giá hay trạng thái một căn trên điện thoại trong vài chạm theo đúng luật sửa giá; giá mới hiện ở Bảng hàng và trang khách đang mở; đổi trái luật thì máy chặn và nói lý do; dòng thời gian của căn ghi ai đổi, lúc nào
- Kết quả nào là CHẾT: [đề xuất] chưa đạt «Sau cuộc gọi, đầu chủ đổi giá hay trạng thái một căn trên điện thoại trong vài chạm theo đúng luật sửa giá; giá mới hiện ở Bảng hàng và trang khách đang mở; đổi trái luật thì máy chặn và nói lý do; dòng thời gian của căn ghi ai đổi, lúc nào» khi hết timebox
- Timebox: …
