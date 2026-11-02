---
schema_version: 1
slug: dang-nhap-auth-15
feature: "Người trong sàn đăng nhập trên một thẻ theo khối auth-15: chỉ mã một lần qua email, không nút Google, Apple hay GitHub, giữ chân điều khoản; chọn sàn và chưa gắn sàn đi cùng khuôn; luồng đăng nhập, phiên và luật vào đúng sàn của hàng 6 giữ nguyên"
owner: phanlemanh@gmail.com
stage: discovery              # discovery | decided | archived
decision:         # build | iterate | park | kill — người ký Cổng 0 điền
decided_by: 
decided_at:     # ISO UTC
prototype:
  base_commit:     # điểm cắt nhánh proto khỏi nhánh chính — guard diffBase khi keep
  disposition:     # keep | archive
lo_trinh_ma: 93
lo_trinh_tep: docs/plan/lo-trinh.json
---

## Vấn đề & ai gặp

Mở từ hàng 93 của «Lộ trình onehub-quy-hang» (`docs/plan/lo-trinh.json`).

Người trong sàn đăng nhập trên một thẻ theo khối auth-15: chỉ mã một lần qua email, không nút Google, Apple hay GitHub, giữ chân điều khoản; chọn sàn và chưa gắn sàn đi cùng khuôn; luồng đăng nhập, phiên và luật vào đúng sàn của hàng 6 giữ nguyên

Vì sao: Chủ kho chọn auth-15 bỏ OAuth 02/11 (PR #88, vo-va-ia §2 và «Chỗ hở»): màn đăng nhập đang là bản ghép tạm bậc 6 từ hàng 6, dòng «Chỗ hở» quá hạn 30/10; phần Đăng nhập của mục chân trời H16

## Ngưỡng chết / ngưỡng UAT

- Câu hỏi phép đo trả lời: [đề xuất] đã đạt «Ba màn đăng nhập, chọn sàn, chưa gắn sàn dựng trên khuôn Khung theo auth-15, không nút OAuth; không đổi tệp nào dưới packages/api/src/auth; dòng «Chỗ hở» Đăng nhập rời §3 và bài kiem-chuan bớt đúng một cảnh báo hạn» chưa?
- Kết quả nào là SỐNG: [đề xuất] Ba màn đăng nhập, chọn sàn, chưa gắn sàn dựng trên khuôn Khung theo auth-15, không nút OAuth; không đổi tệp nào dưới packages/api/src/auth; dòng «Chỗ hở» Đăng nhập rời §3 và bài kiem-chuan bớt đúng một cảnh báo hạn
- Kết quả nào là CHẾT: [đề xuất] chưa đạt «Ba màn đăng nhập, chọn sàn, chưa gắn sàn dựng trên khuôn Khung theo auth-15, không nút OAuth; không đổi tệp nào dưới packages/api/src/auth; dòng «Chỗ hở» Đăng nhập rời §3 và bài kiem-chuan bớt đúng một cảnh báo hạn» khi hết timebox
- Timebox: …
