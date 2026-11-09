---
slug: va-lead-da-nhap-than-hong
at: 2026-11-09T13:55:57Z
verdict: findings
p0: 2
p1: 2
p2: 1
---

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P0 | design | Căn cứ của lựa chọn đọc qua hàm chung chỉ là chú thích tả hàm; mảng có phần tử sai khuôn không AC, không eval, không Out of scope nào nói tới | Máy chủ trả 200 với danh sách có phần tử sai khuôn: hàm chung cho qua, màn vỡ lúc dựng mà mọi eval vẫn xanh | Dòng sổ mới có căn cứ thật; ranh giới vào AC-2 với dòng test và ca nhìn màn | fixed: AC-2, E2, E2b mở cho danh sách có phần tử sai khuôn; nhánh đọc thêm điều kiện từng phần tử; dòng sổ thay trích câu giao của hàng |
| P0 | design | Căn cứ của việc bỏ design-pass trích câu cụt của hợp đồng trước, không quyết việc bỏ bước nhìn | Chủ kho tin hợp đồng trước đã quyết nên ký trên chữ | Dòng sổ mới mang supersedes, đổi loại nguồn nếu không có câu quyết | fixed: dòng sổ thay ghi nguồn một-lối ra, nêu vì sao không còn lối nào để nhìn; không lật quyết định bỏ |
| P1 | contract | Thiếu ô bấm Thử lại mà vẫn hỏng; E3b bước có mạng không đếm lời đọc; mất mạng ở Coverage nhưng AC-4 không có Then | Bấm lần hai mà màn kẹt khung chờ, không eval nào đỏ; lời gọi không tới máy chủ không có Then để chấm | AC-3, AC-4 thêm vế; E3b thêm bước và đếm lời đọc; E4b thêm bước cắt mạng | fixed: AC-3, AC-4, E3b, E4b như đề xuất |
| P1 | evals | Thẻ việc ghi cả hai thiết bị mà không bài nhìn màn nào đo khổ điện thoại | Ở điện thoại khối lỗi tràn hay còn khung chờ mà eval vẫn xanh | E1b, E2b, E3b chạy thêm 375 | fixed: E1b thêm khổ 375 đo tràn và nút trong khung nhìn; E2b, E3b giữ 1440 vì cùng một khối ở cùng một vị trí, chỉ khác dữ liệu vào |
| P2 | evals | Chỗ thử và phép đếm dựa vào điều chưa ghim: cây của máy dev, dữ liệu mẫu, bộ chọn dòng, đối chứng khung chờ | Máy dev của cây khác giữ cổng, thiếu lead mẫu, bộ đếm khung chờ luôn xanh | Khẳng định cây, gọi API thật đòi có lead, ghim bộ chọn, đối chứng dương | fixed: gọi API thật đòi có lead, bộ chọn dòng, đối chứng khung chờ ở E1b; deferred: máy kiểm cổng 3462 thuộc đúng cây trước lượt chấm, không ghi vào bước eval |
