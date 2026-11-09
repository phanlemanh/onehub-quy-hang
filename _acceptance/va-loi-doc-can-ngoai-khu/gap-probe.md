---
slug: va-loi-doc-can-ngoai-khu
at: 2026-11-09T10:15:00Z
verdict: findings
p0: 1
p1: 3
p2: 1
---

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P0 | design | Điều kiện báo nới rộng hơn câu giao, ghi máy quyết một lối trong khi đó là nghĩa sản phẩm chưa ai chọn | Máy có bản giữ cũ thiếu 1 căn, mạng chớp là khối báo trên toàn lưới; AC-3 xanh trên hành vi chủ kho chưa chọn | Hỏi ở Cổng Phạm vi, hoặc về đúng câu giao | fixed: về đúng câu giao, dòng sổ mới thay dòng -3 (nguồn mục tiêu, trích câu giao), ca bản giữ rỗng hay thiếu sang Out of scope |
| P1 | evals | Nhánh có bản giữ không có đo qua màn thật; trục B gộp ca hỏng | Hook mất đường rơi về bản giữ mà E1–E6 vẫn xanh; bản giữ hỏng làm bảng sập | E6 ngắt lại rồi nạp lại trang; E3 năm ca, ca hỏng nạp chuỗi hỏng thật | fixed: E3 năm ca qua kho chữ thật, ca đủ assert ghép đúng; E6 thêm bước taiLai; AC-1 thêm bản giữ hỏng |
| P1 | contract | Câu báo không có nguyên văn, test so với hằng do thợ đặt | Thợ viết câu chung chỉ nhắc danh bạ mà E5, E6 vẫn xanh | Ghi nguyên văn vào design, AC-1, AC-5; test đọc từ hồ sơ | fixed: hai câu ở design §3, AC-1, AC-5; E1, E5, E6 assert đúng chuỗi, E1 và E5 đọc từ contract.md |
| P1 | evals | Lớp thân sai khuôn thiếu HTML và phần tử sai; 5xx chưa tới màn; tag cross-layer | API trả 200 HTML hay units có null làm bảng sập, E1 vẫn đủ 7 ca | E1 từ 9 ca; thêm ca 500 trên màn; bước sau assert phản hồi từ máy chủ | fixed: E1 mười ca, E6 thêm ca500 và trạng thái máy chủ 200, căn dựng bằng đường ghi thật; rejected phần tag cross-layer: vòng không đổi đường ghi hay API, không có tác dụng máy chủ để đo |
| P2 | evals | Design §4 hứa báo giữ lúc đọc lại, đọc đúng một lần; đếm âm thiếu đối chứng | Hook xoá cờ lỗi khi bắt đầu đọc: báo nháy mà E6 xanh | Thêm vế vào AC-2; E6 làm chậm phản hồi; bộ đếm tăng đúng 1 | fixed: AC-2 thêm vế, E6 có giuaChung và bộ đếm tăng đúng 1 làm đối chứng; rejected kéo dài cửa sổ: hook không có đồng hồ, chỉ đọc khi đổi sàn hay bấm |
