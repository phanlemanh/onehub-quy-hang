---
schema_version: 1
slug: thong-bao-lead
feature: Đầu chủ nhận thông báo lead trên điện thoại và máy tính, chạm vào thì mở đúng mục ở Hôm nay
owner: phanlemanh@gmail.com
stage: decided              # discovery | decided | archived
decision: build   # build | iterate | park | kill — người ký Cổng 0 điền
decided_by: Manh Phan
decided_at: 2026-10-31T13:38:56Z   # ISO UTC
prototype:
  base_commit:     # điểm cắt nhánh proto khỏi nhánh chính — guard diffBase khi keep
  disposition:     # keep | archive
lo_trinh_ma: 26
lo_trinh_tep: docs/plan/lo-trinh.json
---

## Vấn đề & ai gặp

Mở từ hàng 26 của «Lộ trình onehub-quy-hang» (`docs/plan/lo-trinh.json`).
Nguồn: `wiki/dot/ban-dau-2910.md#867b6192ae2581fd453691e740592f736dda4cbc` — chưa có trang: trang nền, mã L3

Đầu chủ nhận thông báo lead trên điện thoại và máy tính, chạm vào thì mở đúng mục ở Hôm nay

Vì sao: Kiến trúc §5: Web Push; hướng dẫn cài lên màn hình chính cho iPhone
Số đo hai tuần thử gần nhất (Tham chiếu §11): Thời gian lead → cuộc gọi đầu — ngưỡng số đặt trước khi thử.

## Ngưỡng chết / ngưỡng UAT

- Câu hỏi phép đo trả lời: [đề xuất] đã đạt «Đầu chủ nhận thông báo lead trên điện thoại và máy tính, chạm vào thì mở đúng mục ở Hôm nay» chưa?
- Kết quả nào là SỐNG: trung vị thời gian lead về đầu chủ → cuộc gọi đầu ≤ 5 phút (Hỏi-4, chủ kho duyệt Cổng Phạm vi 02/11)
- Kết quả nào là CHẾT: trung vị > 5 phút khi hết timebox
- Timebox: hai tuần thử (Tham chiếu §11)
