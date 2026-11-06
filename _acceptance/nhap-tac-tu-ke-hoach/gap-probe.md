---
slug: nhap-tac-tu-ke-hoach
at: 2026-11-05T14:12:00Z
verdict: findings
p0: 2
p1: 1
p2: 2
---

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P0 | design §1 + sổ S1 dòng -2, -3 | Ô cơ hội ghi luật gác theo «nền 64»; máy tự đổi thước sang bộ lạ máy dựng và ghi là máy quyết. Thiết kế không nêu lỗi lọt của nền 64 [du-lieu-mau-thap-tang#F1] [va-gui-can-da-go#F2] | Nền 64 đạt mọi ngưỡng thì theo chữ đã ký phải gác; Cổng Phạm vi ký «không gác» trên bộ đo do người làm tự dựng | Bảng bốn số đo nền 64 so ngưỡng; dòng sổ chỉ-người để chủ kho chọn; dòng -3 trích câu thật sự quyết | human-gate1: thiết kế §1 thêm bảng hai bộ; Hỏi-3 (dòng sổ chỉ-người, thay dòng -2); dòng -3 thay bằng câu trích câu nghiệm thu «Trên bộ file mẫu lạ có đáp án» |
| P0 | contract AC-1 + evals E1 | Đề xuất «của Claude» do chính phiên dựng tính năng viết — bên làm tự chấm; băm gói không chứng người đề xuất chỉ đọc gói | Đề xuất viết theo đáp án nên AC-1 xanh; lên mô hình thật thì hụt | Tác tử context sạch chỉ đọc gói + lời nhắc; băm lời nhắc khớp hằng mã; đổi chữ AC-1; giới hạn đã biết về số qua API | fixed: thiết kế §4 thêm nghi thức lập đề xuất bằng tác tử context sạch; AC-1 đổi chữ; E1 thêm assert băm lời nhắc, câu «lập bởi tác tử context sạch»; Notes ghi số qua API là điều kiện phiên nghiệm thu; dòng sổ một-lối mới |
| P1 | design §3 + evals E3, E1 | Quét dáng họ tên ở tiêu đề có thể chặn mọi gói file lạ; thiếu đối chứng dương trên gói thật; đường đo AC-1 không qua quetGoi | Ở sản phẩm thật mọi gói bị chặn, người luôn thấy «Chưa dùng được AI» mà AC-1, AC-3 vẫn xanh | Chốt một nghĩa; quetGoi trên 13 gói thật không trúng; E1 qua quetGoi | fixed: dáng họ tên chỉ quét ở giá trị (thiết kế §3, dòng sổ mới); E3 thêm 13 assert gói thật và 2 assert tiêu đề viết hoa không trúng; E1 cho gói qua quetGoi (13 assert); AC-1, AC-3 đổi chữ |
| P2 | evals E2 | Ma trận «tám lớp» không ràng với ColumnClass | Thêm lớp mới mà bài kiểm vẫn xanh | Tập khoá rút từ mã | fixed: ma trận khai bằng Record<ColumnClass, …>, sáu lớp × hai tình trạng = 12 assert |
| P2 | evals AC-8 | Dải báo «Chưa dùng được AI» là thứ người nhìn thấy mà không có ui-check | Dải không gắn vào bước Ghép cột hay bị cắt ở 375 mà AC-8 xanh | Ca ui-check tat-dinh-loi, tat-dinh-chua-bat ở hai khổ | fixed: thêm E8c ui-check |
