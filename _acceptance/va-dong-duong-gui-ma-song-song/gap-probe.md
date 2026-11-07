---
slug: va-dong-duong-gui-ma-song-song
at: 2026-11-07T10:30:00Z
verdict: findings
p0: 0
p1: 2
p2: 2
---

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P1 | evals | E2 chèn đúng chuỗi emailMoi mà câu đếm đọc; thư viện chuẩn hoá email (chữ thường, cắt khoảng trắng) trước khi lưu, câu đếm so nguyên chuỗi | mail() sinh email có chữ hoa thì người do đường đăng ký mở lại tạo ra mang email chữ thường, câu đếm không thấy, ca xanh; E2 vẫn ĐẠT vì chèn chuỗi gốc | Khẳng định emailMoi đã ở dạng chuẩn, hoặc chèn qua phép chuẩn hoá | fixed: ca khẳng định emailMoi bằng chính nó sau trim().toLowerCase() (thông điệp «email thử chưa ở dạng chuẩn»); E2 ghim khẳng định ấy trong nguồn và chèn người bằng email đã chuẩn hoá |
| P1 | evals | E2 chỉ đo chuỗi-có-mặt «có lời gọi đường đăng ký», không ghim quan hệ lời gọi tới đúng đường đăng ký của bảng lõi | Bản sửa gõ nhầm đường (/sign-up/emails); mọi lời gọi 404 vì đường không có, ca xanh mãi kể cả khi đường thật mở lại | Ghim đường của lời gọi mang emailMoi là BANG_LOI.signUpEmail[0]; đối chứng dương đường có thật | fixed: ca gọi bằng BANG_LOI.signUpEmail[0] và E2 đòi đúng biểu thức ấy ở lời gọi mang emailMoi (thiếu in «lời gọi email mới không đi đường đăng ký của bảng lõi»); rejected phần đối chứng mở đường: bảng lõi đã được bài thieuLoai đối chiếu với bản cài thư viện (hàng dang-nhap-mat-khau E8), dựng ứng dụng mở đăng ký chỉ để chứng đường có thật là ngoài phạm vi |
| P2 | evals | Bộ đo chèn người vào Postgres dùng chung mà không khai dọn dẹp và khoá riêng theo lượt | emailMoi cố định giữa các lượt thì lần hai trùng khoá duy nhất, E2 đỏ oan | Email mang khoá RUN, dọn khi kết thúc; chạy hai lần đều đạt | fixed: thiết kế khai rõ email chèn và emailMoi đều qua mail() mang RUN riêng mỗi tiến trình, after(cleanup) của tệp xoá theo tiền tố RUN; rejected «chạy hai lần» — RUN đổi mỗi tiến trình nên không có trùng giữa lượt |
| P2 | contract | Dòng sổ S1 lối lọc theo email trích câu chẩn đoán của sổ va-deploy-csdl-tam, câu ấy không quyết giữa lọc theo email và dồn sang cơ sở dữ liệu riêng | Người ký tưởng lối lọc được chọn vì câu chẩn đoán | Dòng S1 mới supersedes, trích câu tính năng ở opportunity.md | fixed: dòng S1 mới thay d-20261107T094535Z-2, trích câu tính năng chủ kho chốt build ở opportunity.md |
