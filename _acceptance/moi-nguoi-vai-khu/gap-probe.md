---
slug: moi-nguoi-vai-khu
at: 2026-10-30T08:12:00Z
verdict: findings
p0: 2
p1: 2
p2: 1
---

# Phản biện ngữ cảnh sạch — moi-nguoi-vai-khu

Một tác tử tươi đọc thiết kế, hợp đồng, evals, sổ quyết định, ô cơ hội và bài học từ hai hồ sơ trước; không hội thoại,
không mã.

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P0 | design | Mời tạo tài khoản cho email bất kỳ và kéo người ở sàn khác vào mà sổ không ghi lựa chọn; cùng dạng [dang-nhap-theo-san#F1] | Chủ kho ký Hỏi-1 mà không biết mình ký luôn chính sách tài khoản; quản trị dò được email nào đã có tài khoản | Hỏi-4 trên thẻ; ca mời email mới và email đã có tài khoản trả cùng mã và hình dạng thân | human-gate1: Hỏi-4 (khuyến nghị cho phép, không lộ ai đã có tài khoản); E2 thêm ca không dò được; AC-2 thêm vế |
| P0 | design | Dòng sổ bỏ khối Pro và bỏ design-pass ghi máy quyết nhưng lối thêm khoá ReUI vẫn sống; cùng dạng [tang-5-giao-dien#F1] | Người duyệt tin không có đường dùng khối đích, sau phải làm lại màn | Đổi sang câu hỏi trên thẻ | human-gate1: Hỏi-5 (khuyến nghị ghép, khối Pro sau); dòng sổ mới thay d-7, d-9 |
| P1 | evals | Lời gọi kế sau khi bị bỏ hay bị gỡ vai chỉ đo bằng danh sách sàn và /me, không đo phiên cũ | Quyền giữ trong phiên làm người bị bỏ vẫn gọi được, quản trị bị gỡ vai vẫn mời được | Ca phiên cũ sau khi bỏ và sau khi gỡ vai, có đối chứng trước | fixed: E5 hai ca phiên cũ có đối chứng; AC-5 viết lại; thiết kế ghi vai đọc lại mỗi lời gọi |
| P1 | evals | Quản trị cuối chỉ đo qua API, không ghim 409 cho gỡ vai, không đo ghi thẳng và gỡ đồng thời | Chỉ chặn ở API, hoặc trigger đếm trên ảnh chụp giao dịch nên hai quản trị gỡ nhau cùng lúc | Ca ghi thẳng bằng quy_hang_app; ca hai giao dịch đồng thời; ghim 409 | fixed: E7 năm ca; AC-7 viết lại; thiết kế thêm khoá theo sàn trong trigger |
| P2 | evals | E10 không có khung cho form mời, form sửa và hộp xác nhận bỏ | Màn bỏ người ngay không hỏi mà E10 vẫn đạt | Ba khung thêm + bước huỷ | fixed: E10 mười một khung, thêm bước huỷ; E6 sửa «năm đường», GET khu vẫn đọc được |
