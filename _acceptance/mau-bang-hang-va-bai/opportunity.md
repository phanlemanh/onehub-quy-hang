---
schema_version: 1
slug: mau-bang-hang-va-bai
feature: Quản trị sàn xem và sửa mẫu bảng hàng (cột và thứ tự khi xuất) và mẫu bài theo kênh trong màn Mẫu của Cài đặt › Sàn; sửa hay xoá một mẫu thì lần xuất và lần gửi kế dùng bản mới, lần đã xong không đổi.
owner: phanlemanh@gmail.com
stage: decided              # discovery | decided | archived
decision: build   # build | iterate | park | kill — người ký Cổng 0 điền
decided_by: Manh Phan
decided_at: 2026-11-05T11:27:14Z   # ISO UTC — Cổng Đáng hàng 50 (mau-nhap-va-bai) ký cả ba loại mẫu; tách hàng ở Cổng Phạm vi 50 (Hỏi-1); luật 74 của đợt ghi «đã quyết»
prototype:
  base_commit:     # điểm cắt nhánh proto khỏi nhánh chính — guard diffBase khi keep
  disposition:     # keep | archive
lo_trinh_ma: mau-bang-hang-va-bai
lo_trinh_tep: docs/plan/lo-trinh.json
---

## Vấn đề & ai gặp

Mở từ hàng mau-bang-hang-va-bai của «Lộ trình onehub-quy-hang» (`docs/plan/lo-trinh.json`).

Quản trị sàn xem và sửa mẫu bảng hàng (cột và thứ tự khi xuất) và mẫu bài theo kênh trong màn Mẫu của Cài đặt › Sàn; sửa hay xoá một mẫu thì lần xuất và lần gửi kế dùng bản mới, lần đã xong không đổi.

Vì sao: Tách từ hàng 50 mau-nhap-va-bai: chủ kho duyệt Cổng Phạm vi 05/11 theo khuyến nghị Hỏi-1 (mẫu bảng hàng + mẫu bài theo kênh sang hàng kế). Hàng không mã: đã quyết (Cổng Đáng 50 đã ký cả ba loại mẫu).

## Ngưỡng chết / ngưỡng UAT

- Câu hỏi phép đo trả lời: …
- Kết quả nào là SỐNG: …
- Kết quả nào là CHẾT: …
- Timebox: …
