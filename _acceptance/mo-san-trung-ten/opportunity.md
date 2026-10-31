---
schema_version: 1
slug: mo-san-trung-ten
feature: Mở sàn cho công ty mới trùng tên với sàn đang chạy thì được một sàn riêng; người của sàn mới không thấy dữ liệu sàn cũ
owner: phanlemanh@gmail.com
stage: decided                # discovery | decided | archived
decision: build   # build | iterate | park | kill — người ký Cổng 0 điền
decided_by: Manh Phan
decided_at: 2026-10-31T08:50:08Z   # ISO UTC
prototype:
  base_commit:     # điểm cắt nhánh proto khỏi nhánh chính — guard diffBase khi keep
  disposition:     # keep | archive
lo_trinh_ma: 56
lo_trinh_tep: docs/plan/lo-trinh.json
---

## Vấn đề & ai gặp

Mở từ hàng 56 của «Lộ trình onehub-quy-hang» (`docs/plan/lo-trinh.json`).
Nguồn: `wiki/dot/nen-dau.md#015b66d24d60d7679bc3960ebb29146fdd9b4a09` — chưa có trang: trang nền, mã ND3

Mở sàn cho công ty mới trùng tên với sàn đang chạy thì được một sàn riêng; người của sàn mới không thấy dữ liệu sàn cũ

Vì sao: Cổng Bằng chứng hàng 6: Ngoài-7 và Ngoài-15 «mở hợp đồng mới» (chủ kho 30/10) — công cụ mở sàn tìm sàn theo tên nên gộp lặng người mới vào sàn cũ; chạm bất biến 1 (cách ly giữa công ty)

## Ngưỡng chết / ngưỡng UAT

- Câu hỏi phép đo trả lời: [đề xuất] đã đạt «Mở hai sàn cùng tên ra hai sàn khác mã; bộ kiểm cách ly có ca người sàn mới không đọc được dòng nào của sàn cũ» chưa?
- Kết quả nào là SỐNG: [đề xuất] Mở hai sàn cùng tên ra hai sàn khác mã; bộ kiểm cách ly có ca người sàn mới không đọc được dòng nào của sàn cũ
- Kết quả nào là CHẾT: [đề xuất] chưa đạt «Mở hai sàn cùng tên ra hai sàn khác mã; bộ kiểm cách ly có ca người sàn mới không đọc được dòng nào của sàn cũ» khi hết timebox
- Timebox: …
