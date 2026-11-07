---
schema_version: 1
slug: va-dong-duong-gui-ma-song-song
feature: "Bài kiểm «đường lõi mật khẩu đóng» thôi đếm tổng người dùng của cả cơ sở dữ liệu: nó chỉ xét người dùng mang đúng email mà đường đăng ký được thử, để chạy song song với các tệp kiểm khác không vỡ, và vẫn bắt được đường đăng ký lỡ mở lại."
owner: phanlemanh@gmail.com
stage: decided              # discovery | decided | archived
decision: build        # build | iterate | park | kill — người ký Cổng 0 điền
decided_by: Manh Phan
decided_at: 2026-11-07     # ISO UTC — chủ kho gõ ở phiên giám sát 07/11 «Cổng Đáng va-dong-duong-gui-ma-song-song: build», giám sát chuyển nguyên văn cho dãy Q
prototype:
  base_commit:     # điểm cắt nhánh proto khỏi nhánh chính — guard diffBase khi keep
  disposition:     # keep | archive
lo_trinh_ma: va-dong-duong-gui-ma-song-song
lo_trinh_tep: docs/plan/lo-trinh.json
---

## Vấn đề & ai gặp

Mở từ hàng va-dong-duong-gui-ma-song-song của «Lộ trình onehub-quy-hang» (`docs/plan/lo-trinh.json`).

Bài kiểm «đường lõi mật khẩu đóng» thôi đếm tổng người dùng của cả cơ sở dữ liệu: nó chỉ xét người dùng mang đúng email mà đường đăng ký được thử, để chạy song song với các tệp kiểm khác không vỡ, và vẫn bắt được đường đăng ký lỡ mở lại.

Vì sao: lượt chấm 1 của hàng va-deploy-csdl-tam (06/11) đỏ oan ở ca «đường lõi mật khẩu đóng» của bộ API: ca ấy đếm tổng người dùng của cả cơ sở dữ liệu trước và sau khi gọi các đường lõi, nên bộ kiểm khác ghi người dùng cùng lúc trên cùng cơ sở dữ liệu làm số lệch (sổ va-deploy-csdl-tam d-20261106T134952Z-12). Dãy Q khuyên mở hàng; giám sát mở 06/11, chủ kho chốt build 07/11.

## Ngưỡng chết / ngưỡng UAT

- Câu hỏi phép đo trả lời: [đề xuất] đã đạt «Bài «đường lõi mật khẩu đóng» xanh khi có tệp kiểm khác tạo người dùng cùng lúc trên cùng cơ sở dữ liệu, và vẫn đỏ đúng thông điệp khi đường đăng ký tạo người» chưa?
- Kết quả nào là SỐNG: [đề xuất] Bài «đường lõi mật khẩu đóng» xanh khi có tệp kiểm khác tạo người dùng cùng lúc trên cùng cơ sở dữ liệu, và vẫn đỏ đúng thông điệp khi đường đăng ký tạo người
- Kết quả nào là CHẾT: [đề xuất] chưa đạt «Bài «đường lõi mật khẩu đóng» xanh khi có tệp kiểm khác tạo người dùng cùng lúc trên cùng cơ sở dữ liệu, và vẫn đỏ đúng thông điệp khi đường đăng ký tạo người» khi hết timebox
- Timebox: …
