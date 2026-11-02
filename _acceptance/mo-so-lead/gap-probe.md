---
slug: mo-so-lead
at: 2026-11-02T06:45:00Z
verdict: findings
p0: 0
p1: 5
p2: 0
---

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P1 | evals | Mở số chỉ thử ở nấc vừa giao; thiếu nấc Đã nhận, Đã gọi; thiếu dòng «người nhận bị gỡ vai Đầu chủ» | Hàm chỉ cho mở ở nấc Đã gửi: đầu chủ bấm Nhận rồi tới lúc gọi bị báo «không còn của bạn», bộ đo vẫn xanh; người nghỉ việc bị gỡ vai vẫn mở được | E1 bảng ba nấc còn việc đếm 3; E2 thêm dòng gỡ vai đếm 11; E6 khung bấm Nhận rồi vẫn mở | fixed: E1 thêm bảng ba nấc, E2 thêm dòng gỡ vai (11 dòng), E6 thêm khung 5; hợp đồng AC-1 nêu ba nấc, AC-2 nêu gỡ vai |
| P1 | evals | «Mở số không tự ghi Đã nhận/Đã gọi» là điều ở máy chủ nhưng chỉ ca nhìn màn đo | Hàm mở số ghi luôn mốc nhận, màn chưa tải lại nên E6 vẫn đạt; số đo hạn nhận thành đẹp giả | E1 đọc dòng lead trước–sau, deepEqual; đối chứng Nhận đổi mốc | fixed: E1 thêm ca «không đổi lead» kèm đối chứng dương và chiều đỏ; AC-1 thêm vế không đổi nấc, gắn (cross-layer) |
| P1 | evals | E4 bọc console nhưng không chứng việc bọc tóm được kênh nhật ký thật; thiếu ca máy chủ lỗi | API ghi nhật ký qua kênh khác console, ba hàm bọc không bắt gì, E4 xanh rỗng; lỗi giải mã in số | Bọc đúng kênh thật, đối chứng dương đếm ≥1, ca lỗi ép 500 | fixed: E4 bọc console và process.stdout/stderr, thêm ca đổi khoá ép lỗi giải mã → 500, đếm dòng nhật ký ≥ 1 làm đối chứng |
| P1 | evals | Hai trạng thái đang mở và mở lỗi không có khung nhìn; Xuất xứ component không kê dòng báo lỗi | Màn nuốt lỗi hay khoá nút sau lỗi, E5 vẫn xanh vì hàm trả đúng câu | E6 thêm khung lỗi (Offline) và khung chờ (Slow 3G); kê dòng báo lỗi | fixed: E6 thêm khung 6 (mất mạng, bấm lại được) và khung 7 (nút khoá lúc chờ); thiết kế thêm dòng Xuất xứ cho dòng báo lỗi có sẵn của dòng lead |
| P1 | design | Căn cứ dòng sổ «lead đã trả/bỏ/gửi lại không mở» trích ADR-0020 chỉ quyết lead trả lại | Chủ kho ký AC-2 tưởng cả bốn nấc đã chốt; lead căn trùng có người nhận mà không ai được hỏi | Dòng sổ mới thay dòng cũ, câu hỏi cho chủ kho | fixed: dòng sổ mới thay d-20261102T062621Z-3, căn cứ là định nghĩa «lead còn việc» có sẵn ở migration 015; lead căn trùng tách thành Hỏi-3 cho chủ kho (human-gate1) |
