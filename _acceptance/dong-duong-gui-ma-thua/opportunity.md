---
schema_version: 1
slug: dong-duong-gui-ma-thua
feature: Mọi đường gửi mã đăng nhập đi qua cùng giới hạn 5 lần xin mã trong 15 phút cho mỗi email; đường quên mật khẩu của plugin không còn phục vụ
owner: phanlemanh@gmail.com
stage: decided                # discovery | decided | archived
decision: build   # build | iterate | park | kill — người ký Cổng 0 điền
decided_by: Manh Phan
decided_at: 2026-10-31T08:50:08Z   # ISO UTC
prototype:
  base_commit:     # điểm cắt nhánh proto khỏi nhánh chính — guard diffBase khi keep
  disposition:     # keep | archive
lo_trinh_ma: 55
lo_trinh_tep: docs/plan/lo-trinh.json
---

## Vấn đề & ai gặp

Mở từ hàng 55 của «Lộ trình onehub-quy-hang» (`docs/plan/lo-trinh.json`).
Nguồn: `wiki/dot/nen-dau.md#015b66d24d60d7679bc3960ebb29146fdd9b4a09` — chưa có trang: trang nền, mã ND2

Mọi đường gửi mã đăng nhập đi qua cùng giới hạn 5 lần xin mã trong 15 phút cho mỗi email; đường quên mật khẩu của plugin không còn phục vụ

Vì sao: Cổng Bằng chứng hàng 6: Ngoài-6 và Ngoài-10 «mở hợp đồng mới» (chủ kho 30/10) — người lạ dội email mã vào hộp thư thành viên sàn, mã qua đường thừa không đăng nhập được

## Ngưỡng chết / ngưỡng UAT

- Câu hỏi phép đo trả lời: [đề xuất] đã đạt «Lời xin mã thứ sáu trong 15 phút bị từ chối ở mọi đường gửi mã của plugin; các đường quên mật khẩu trả 404 và không gửi email» chưa?
- Kết quả nào là SỐNG: [đề xuất] Lời xin mã thứ sáu trong 15 phút bị từ chối ở mọi đường gửi mã của plugin; các đường quên mật khẩu trả 404 và không gửi email
- Kết quả nào là CHẾT: [đề xuất] chưa đạt «Lời xin mã thứ sáu trong 15 phút bị từ chối ở mọi đường gửi mã của plugin; các đường quên mật khẩu trả 404 và không gửi email» khi hết timebox
- Timebox: …
