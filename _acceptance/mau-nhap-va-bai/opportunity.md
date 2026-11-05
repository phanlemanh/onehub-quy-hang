---
schema_version: 1
slug: mau-nhap-va-bai
feature: Quản trị sàn xem và sửa mẫu file nhập đã nhớ, mẫu bảng hàng và mẫu bài theo kênh
owner: phanlemanh@gmail.com
stage: decided                # discovery | decided | archived
decision: build # build | iterate | park | kill — người ký Cổng 0 điền
decided_by: Manh Phan
decided_at: 2026-11-05T11:27:14Z    # ISO UTC
prototype:
  base_commit:     # điểm cắt nhánh proto khỏi nhánh chính — guard diffBase khi keep
  disposition:     # keep | archive
lo_trinh_ma: 50
lo_trinh_tep: docs/plan/lo-trinh.json
---

## Vấn đề & ai gặp

Mở từ hàng 50 của «Lộ trình onehub-quy-hang» (`docs/plan/lo-trinh.json`).
Nguồn: `wiki/dot/ban-dau-2910.md#867b6192ae2581fd453691e740592f736dda4cbc` — chưa có trang: trang nền, mã P13

Quản trị sàn xem và sửa mẫu file nhập đã nhớ, mẫu bảng hàng và mẫu bài theo kênh

Vì sao: Màn P1 (S6, phác 29/10)

## Ngưỡng chết / ngưỡng UAT

- Câu hỏi phép đo trả lời: [đề xuất] đã đạt «Quản trị sàn mở trong Cài đặt hợp nhất (nhóm Sàn) thấy đủ mẫu file nhập đã nhớ, mẫu bảng hàng và mẫu bài theo kênh của sàn mình, sửa hay xoá một mẫu thì lần nhập và bài kế tiếp dùng bản mới, lần nhập đã xong không đổi; vai khác không mở được màn; sàn khác không thấy mẫu của nhau» chưa?
- Kết quả nào là SỐNG: [đề xuất] Quản trị sàn mở trong Cài đặt hợp nhất (nhóm Sàn) thấy đủ mẫu file nhập đã nhớ, mẫu bảng hàng và mẫu bài theo kênh của sàn mình, sửa hay xoá một mẫu thì lần nhập và bài kế tiếp dùng bản mới, lần nhập đã xong không đổi; vai khác không mở được màn; sàn khác không thấy mẫu của nhau
- Kết quả nào là CHẾT: [đề xuất] chưa đạt «Quản trị sàn mở trong Cài đặt hợp nhất (nhóm Sàn) thấy đủ mẫu file nhập đã nhớ, mẫu bảng hàng và mẫu bài theo kênh của sàn mình, sửa hay xoá một mẫu thì lần nhập và bài kế tiếp dùng bản mới, lần nhập đã xong không đổi; vai khác không mở được màn; sàn khác không thấy mẫu của nhau» khi hết timebox
- Timebox: …
