---
slug: va-cai-dat-mat-viec
at: 2026-11-09T04:24:29Z
verdict: findings
p0: 2
p1: 3
p2: 0
---
## Findings
| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P0 | design | 404 đóng hộp im lặng ghi là một lối, trong khi lối đóng có câu báo còn sống và lời hứa là màn nói rõ | Đường xoá sai, mọi lần trả 404, hộp đóng êm, người dùng tin đã xoá | Nêu câu cho 404, ghim ở AC-5 | fixed: 404 giữ hộp với câu «Cột này đã bị xoá trước đó» và làm mới bảng; dòng sổ thay thế căn cứ câu giao; AC-5 ghim câu, E5b đo 404 thật |
| P0 | design | Cách xếp bảng ở điện thoại máy tự quyết, bỏ design-pass với căn cứ yếu, Table ghi là dùng | Người ký chỉ đọc chữ, tới lượt chấm mới thấy dòng phụ dính nhau không nhãn | Ảnh 375 tại cổng, sửa xuất xứ | fixed: dòng phụ có nhãn và định dạng cố định trong thiết kế; §5 ghi Table là ghép; sổ thay dòng bỏ design-pass; ảnh 375 của màn đã sửa gửi chủ kho lúc mở cửa phủ quyết, đảo bằng một câu |
| P1 | contract | Đang gửi, 403, 404 không đo trên màn; Huỷ rồi mở dòng khác; Coverage nói quá | Thợ quên chặn Esc, kết quả hỏng rơi vào hộp đã đóng, mọi eval xanh | Ca màn thật treo phản hồi, 403, 404, câu cũ | fixed: AC-4, AC-5 và ca xoa-hong thêm treo, Esc, 403, 404 thật, câu cũ; sửa Coverage. E10 không chụp đang-gửi và không-quyền vì đã có phép đo máy |
| P1 | evals | E1 không đọc danh sách nhãn; AC-4, AC-6 thiếu lớp máy chủ; E6 thiếu đối chứng dương; E3, E6 chưa thấy đỏ | Lưu gửi thiếu nhãn mà căn giữ mã, E1 vẫn xanh | Đọc GET nhãn, đọc cơ sở dữ liệu, đối chứng bỏ chặn | fixed: E1, E3 đọc đường GET nhãn; AC-4, AC-6 gắn cross-layer, E4, E6 đọc cơ sở dữ liệu; E6 thêm đối chứng dương. deferred: bản phá riêng cho E3, E6 — hai ca này là đo hồi quy, đã khai trong expected |
| P1 | evals | Khoá đọc được ở 375 không định nghĩa cách đo; AC-7 bỏ Quy đổi; E8 không đo dòng phụ | Dòng phụ không hiện mà chữ vẫn trong cột ẩn, E7 xanh | Đo từng dòng, phần tử có kích thước, đúng giá trị, đối chứng | fixed: đo phần tử dòng phụ theo từng dòng khớp giá trị đọc ở khổ rộng, đích khác nhau giữa các dòng, thêm đối chứng ẩn dòng phụ; AC-7 thêm Quy đổi; E8 đo dòng phụ không hiện |
