---
slug: vet-chon-khoi
at: 2026-11-01T01:20:00Z
verdict: findings
p0: 0
p1: 3
p2: 2
---

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P1 | evals | E2 chỉ thử bộ nhận diện trên một chú thích viết tay; không ca nào chứng bộ quét bắt hai chú thích thật | Chú thích thật viết khác ca thử, bộ quét trả 0 khối trên cây thật mà E1, E2 vẫn xanh | Ma trận 2 phần tử trên bản sao cây thật, xoá dòng từng khối; số khối nhận bằng số dòng bảng | fixed: E2 thêm ca «khối: bộ quét bắt hai khối thật» — ma trận 2 phần tử, tệp:dòng đọc từ cây, số khối nhận bằng số dòng |
| P1 | evals | Cảnh báo hạn đã tới chỉ đo ở mảng hàm trả, không đo trên đầu ra thật | CLI không in mảng cảnh báo, tín hiệu H16 không tới mắt người | Ghim bốn dòng cảnh báo trên stdout và exit 0 | fixed: E1 ghim đúng 4 dòng cảnh báo có tên trên stdout; thiết kế §2.2 và AC-6 nói rõ in ở đầu ra kiểm chuẩn |
| P1 | evals | Điền ngược chỉ đo khuôn, không đo nguồn: ô đã tra và ô Duyệt có thể điền bằng trí nhớ | Lint xanh trên truy vấn không chạy và chữ ký không có | Đối chiếu ô với kết quả tra thật và hồ sơ ký thật | fixed: ô Duyệt mang slug hồ sơ, kiểm approved_by khớp tên (AC-3, E3); ô đã tra đối chiếu kết quả MCP thô lưu ở evidence/reui-tra.md (AC-4, E4). Vế «gọi lại reui search trong eval»: rejected — kiểm chuẩn và eval máy chạy không có MCP reui |
| P2 | evals | Lớp ô rỗng chỉ có một đại diện, «—» chưa thử ở bộ kiểm | Bộ kiểm xét thiếu cột hay coi «—» là có nội dung, lint vẫn xanh | Ma trận đủ cột cho hai bảng | fixed: E3 ma trận 15 ca (9 cột rỗng + 6), E5 ma trận 11 ca (5 rỗng + 5 «—» + hạn sai) |
| P2 | design | d-3 ghi một lối dù băm registry còn sống; d-5 trích câu chỉ liên quan | Người ký tưởng lựa chọn bị ép; câu trích không quyết hạn | Viết lại d-3, đổi câu trích d-5 | fixed: dòng sổ mới thay d-3 nêu lý do băm registry chết; dòng mới thay d-5 trích ADR-0019 «hạn của cả bốn đã tới» |
