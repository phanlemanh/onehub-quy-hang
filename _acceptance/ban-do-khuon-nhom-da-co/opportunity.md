---
schema_version: 1
slug: ban-do-khuon-nhom-da-co
feature: Kho có bản đồ khuôn cho các nhóm màn đã có — Cài đặt sàn, Xác thực, trang tạm, trạng thái trống · lỗi · báo — và mỗi nhóm một khuôn có khe mà mọi màn của nhóm dựng qua
owner: phanlemanh@gmail.com
stage: decided                # discovery | decided | archived
decision: build   # build | iterate | park | kill — người ký Cổng 0 điền
decided_by: Manh Phan
decided_at: 2026-10-31T03:31:01Z   # ISO UTC
prototype:
  base_commit:     # điểm cắt nhánh proto khỏi nhánh chính — guard diffBase khi keep
  disposition:     # keep | archive
lo_trinh_ma: 58
lo_trinh_tep: docs/plan/lo-trinh.json
---

## Vấn đề & ai gặp

Mở từ hàng 58 của «Lộ trình onehub-quy-hang» (`docs/plan/lo-trinh.json`).
Nguồn: `wiki/dot/ban-do-khuon-3110.md#9aed72b222ef4c2346957149830a3c21cf259723` — chưa có trang: trang nền, mã QK1

Kho có bản đồ khuôn cho các nhóm màn đã có — Cài đặt sàn, Xác thực, trang tạm, trạng thái trống · lỗi · báo — và mỗi nhóm một khuôn có khe mà mọi màn của nhóm dựng qua

Vì sao: Chủ sản phẩm 31/10 chọn Quỹ hàng làm kho thử bản đồ khuôn dạng «khai trước khi lệch»; vo-va-ia.md §2 đã là bản đồ bằng lời, cần thành vật máy giữ trước màn dày đầu tiên (hàng 14)

## Ngưỡng chết / ngưỡng UAT

- Câu hỏi phép đo trả lời: [đề xuất] đã đạt «Mỗi nhóm một tệp design/patterns/<nhóm>.md đủ trường theo finding kit §11.3 và đọc được bằng máy; ngoại lệ nào cũng có lý do; mọi màn hiện có của bốn nhóm dựng khuôn ở gốc» chưa?
- Kết quả nào là SỐNG: [đề xuất] Mỗi nhóm một tệp design/patterns/<nhóm>.md đủ trường theo finding kit §11.3 và đọc được bằng máy; ngoại lệ nào cũng có lý do; mọi màn hiện có của bốn nhóm dựng khuôn ở gốc
- Kết quả nào là CHẾT: [đề xuất] chưa đạt «Mỗi nhóm một tệp design/patterns/<nhóm>.md đủ trường theo finding kit §11.3 và đọc được bằng máy; ngoại lệ nào cũng có lý do; mọi màn hiện có của bốn nhóm dựng khuôn ở gốc» khi hết timebox
- Timebox: …
