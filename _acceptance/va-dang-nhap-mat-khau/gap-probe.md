---
slug: va-dang-nhap-mat-khau
at: 2026-11-05T06:10:00Z
verdict: findings
claims_input: ok
p0: 2
p1: 1
p2: 2
---

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P0 | decisions | Dòng sổ chỗ thu phiên ghi nguồn mục tiêu, câu trích của hàng 104 chỉ quyết vô hiệu ở trigger 034, không quyết chỗ thu phiên [nhap-hoan-tac#F2] [hom-nay-dau-khach#F1]. | Có người dựa câu trích dời thu phiên sang API mời người; công cụ mở sàn và SQL chèn thẳng lọt lại đúng kẽ Ngoài-6. | Ghi lại dòng nguồn một-lối nêu ba đường ghi company_members, supersedes dòng cũ. | fixed: dòng mới nguồn mot-loi nêu API mời, công cụ mở sàn, SQL chèn thẳng; supersedes d-20261105T054528Z-3. |
| P0 | decisions | Dòng «bỏ ui-observed» ghi một-lối nhưng lối chụp màn không chết (thiếu khoá thông báo đẩy là việc vận hành sửa được); ở hàng 104 việc bỏ ảnh do chủ kho chọn [nhap-hoan-tac#F1]. | Cổng Phạm vi ký căn cứ sai; Cổng Bằng chứng không thấy câu «Thử lại sau ít phút» trên màn thật. | Ghi lại thành câu chỉ-người-có với lối khác là bổ sung khoá rồi chụp. | fixed: Hỏi-2 (khuyến nghị bỏ ui-observed, lối khác bổ sung khoá thông báo đẩy và chụp ST-doi-mat-khau-cho), supersedes d-20261105T054530Z-5. |
| P1 | design | Thu mọi phiên khi khoá ở lần sai thứ 20 chỉ áp cho đường đổi; lần thứ 20 qua đăng nhập khoá mật khẩu mà giữ phiên. | Sai 19 lần ở đường đổi, lần 20 ở đăng nhập: phiên sống, đặt được mật khẩu mới không cần mật khẩu cũ — lối vòng. | AC-4 phủ cả hai đường; ca E5 lần 20 qua đăng nhập. | fixed: AC-4 «qua đường đổi hay qua đăng nhập»; E5 thêm ca «khoá qua đăng nhập cũng thu mọi phiên». |
| P2 | evals | E4 chỉ đo chiều đăng nhập sang đổi, thiết kế hứa cả chiều ngược. | Đường đổi ghi lần sai khoá email lệch; đăng nhập không thấy; 10 lần thử mỗi cửa sổ. | Ca 5 lần đổi sai rồi đăng nhập đúng ra 429, đối chứng 4 lần. | fixed: E4 thêm ca «chiều ngược — sai ở đổi thì đăng nhập chờ» kèm đối chứng dương. |
| P2 | evals | E3 chỉ đo phiên, AC-2 hứa cả mật khẩu giữ nguyên. | Hàm 035 làm rơi bộ lọc theo gốc ở câu update; mật khẩu tu-doi bị khoá mà E3 vẫn xanh. | Mỗi hình kiểm disabled_reason rỗng và đăng nhập bằng mật khẩu cũ. | fixed: E3 thêm kiểm password_state.disabled_reason và đăng nhập bằng mật khẩu cũ. |
