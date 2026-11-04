---
slug: phat-hang
at: 2026-11-04T03:20:00Z
verdict: findings
p0: 1
p1: 3
p2: 1
---

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
| --- | --- | --- | --- | --- | --- |
| P0 | design | Dòng sổ ghi máy tự quyết «không thêm thư viện» cho bộ ghi PDF, Excel với câu trích chỉ nói ranh giới của hàng 5; lối thêm thư viện vẫn sống và chính là lối khác của Hỏi-3 | Chủ kho ký Hỏi-3 vì tưởng kho cấm thêm phụ thuộc | Dòng thay supersedes nguồn chi-nguoi gộp vào Hỏi-3; design §1 nói rõ đó là ranh giới hàng 5 | fixed: dòng sổ Hỏi-3 mới (supersedes dòng máy quyết và dòng Hỏi-3 cũ) nói rõ thêm thư viện được phép kèm giá; design §1, §4, §7 sửa theo |
| P1 | evals | Bài kiểm rò rỉ và rào cửa ra gắn trang /exports (chỉ chuyển hướng); cửa ra thật là hộp thoại ở inventory/phat-hang | Hộp thoại đọc thẳng trường nội bộ mà rào vẫn xanh | Bài rò rỉ đặt ở hộp thoại, quét mã nguồn hộp thoại, chiều đỏ chèn một lần đọc trường nội bộ | fixed: E7 chuyển tệp kiểm vào inventory/phat-hang, thêm quét nguồn mọi tệp hộp thoại và ca đỏ thứ hai; AC-7 sửa chữ |
| P1 | contract | AC-8, AC-9 đi qua giao diện, API, cơ sở dữ liệu mà không tag cross-layer, không eval đi trọn đường | Hộp thoại gửi thân lệch khuôn, số đo luôn 0 mà mọi eval vẫn xanh | Tag cross-layer, eval backend-effect từ hộp thoại thật tới số đo | fixed: AC-8 tag (cross-layer); thêm E8c ui-check backend-effect: hai lần phát thật → 2 dòng exports đúng trường → số đo kỳ ra 2 |
| P1 | evals | E5 dùng bộ đọc viết trong bài, không độc lập | Bộ ghi thiếu tệp khuôn Office mà bài vẫn xanh, Excel báo hỏng | Đọc lại bằng bộ đọc ngoài tác giả | fixed: E5 đọc bằng packages/db/seed/doc-xlsx.py (thư viện chuẩn Python) và kiểm đủ năm tệp khuôn của gói |
| P2 | evals | «Quay lại bước trước» và ba thẻ khoá ở 31 căn trên giao diện thật không có eval | Quay lại mất người nhận, hay giao diện không đọc cờ khoá | Thêm bước vào E1b | fixed: E1b thêm quay lại hai bước đổi người nhận và lọc 31 căn thấy ba thẻ khoá |
