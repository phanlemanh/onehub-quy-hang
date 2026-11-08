---
slug: khung-ho-so-lien-he
at: 2026-11-08T00:40:00Z
verdict: findings
p0: 1
p1: 3
p2: 1
---

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P0 | design | Hai dòng mục-tiêu trích chỉ phủ một phần lựa chọn (tô dòng, Esc trong ô nhập, chờ 250 ms) | Cổng 1 tin hành vi Esc và hỏi lại do bản kiểm chốt trong khi máy tự chọn | Mỗi vế một câu trích; không có thì thành Hỏi | fixed: tách thành dòng riêng có câu trích (tô dòng + Esc; bỏ chờ 0,25 s); hành vi Esc trong ô tìm, menu thành Hỏi-2 |
| P1 | evals | Ngưỡng máy chậm, mạng chậm và bộ lọc URL không có bài đo | page.tsx bỏ type của URL, màn hỏi lại sau khi dựng mà E7, E8 xanh | E8 thêm giả lập chậm, ghi mạng, HTML ?type có đối chứng | fixed: E8 thêm hai bước (HTML của ?type=Buyer có đối chứng; giả lập chậm không GET danh sách sau khi tải) |
| P1 | evals | Nhánh menu, hộp dùng Esc chỉ đo bằng cờ tự dựng | Menu thật không đặt cờ, Esc đóng cả hồ sơ mà E2 xanh | E8 mở menu hay hộp rồi Esc; E2 xét đích trong role menu, listbox, dialog | fixed: E2 thêm ca đích trong role=menu, listbox, dialog (7 ca); E8 thêm bước mở hộp hay menu rồi Esc |
| P1 | evals | E1 đo có mặt Frame, không đo cùng khung; hàm dựng có thể là bản sao cho bài | Liên hệ bọc Frame thường, E1 vẫn xanh | So nút gốc với KhungHoSo cotPhu; hàm dựng là thành phần vung.tsx dùng | fixed: E1 dựng CotPhuLienHe mà vung.tsx dùng, so nút gốc với KhungHoSo cotPhu cho ba trạng thái |
| P2 | evals | AC-5 không có ảnh gốc trước vòng; vế bảng chiếm lại vùng không quan sát | Khung chung đổi đệm ở chỗ HTML pin không phủ, người xem ghi khớp | Ảnh gốc từ main; bước quan sát bảng sau khi đóng | fixed một phần: E8 thêm quan sát bảng rộng hết vùng sau khi đóng; deferred: ảnh gốc hồ sơ căn — E5 ghim HTML nút gốc là chốt máy |
