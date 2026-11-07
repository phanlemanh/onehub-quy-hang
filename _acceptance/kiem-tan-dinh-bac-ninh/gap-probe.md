---
slug: kiem-tan-dinh-bac-ninh
at: 2026-11-07T08:05:00Z
verdict: findings
p0: 0
p1: 1
p2: 3
claims_input: ok
---

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P1 | evals E3, contract AC-3, design | Phá thử dạng không tiền tố dựa trên tiền đề chưa đo | Lối lui về không có đoạn xã để so, kết quả vẫn rỗng, E3 đỏ hoặc phá thử không bao giờ đỏ | Ghi kết quả đo thật của lối lui trên dạng này trước khi chốt E3 | fixed: đã đo 07/11 — docDiaChiVoi(«12 Lê Lợi, Tân Định, Tỉnh Bắc Ninh», soDau lui-bo-dau) ra 07432 Tân Dĩnh, chuan; ghi vào thiết kế; E3 giữ nguyên |
| P2 | design, contract AC-1 | Kết quả ghim chỉ là bản chụp hành vi, không căn cứ độc lập | Danh mục sai thì bài khoá cứng cái sai | Trích nguồn danh mục cho tên tỉnh 24 và việc không có Tân Định | fixed: thiết kế và AC-1 trích đối chiếu nguồn của danh-muc-xa-day-du AC-4 (tên «Thành phố Bắc Ninh», tỉnh 24 chỉ có Tân Dĩnh) |
| P2 | evals E2(c) | E2(c) kiểm có mặt, không bằng nhau | Hàm phát thêm dòng lỗi giả mà E2(c) vẫn xanh | deepEqual đúng một dòng; ghi mã xã | fixed: E2(c) deepEqual [«lệch kết quả ghim: wardName»] với xã 07210 Bắc Giang |
| P2 | evals E1, design | «So trọn» nhưng chỉ so 8 trường | Bộ đọc thêm hay đổi trường ngoài 8 trường mà ca vẫn xanh | So tập khoá với tập ghim | fixed: E1 so tập khoá 9 khoá trước, có phá thử khoá lạ «goiY» |
