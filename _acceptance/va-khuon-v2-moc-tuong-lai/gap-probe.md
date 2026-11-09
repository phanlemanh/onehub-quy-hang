---
slug: va-khuon-v2-moc-tuong-lai
at: 2026-11-09T16:30:30Z
verdict: findings
p0: 0
p1: 4
p2: 1
---

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P1 | contract | Lưới đuôi bất kỳ áp lên cả khoá máy cấp, hợp đồng không nói. | Invest đẩy khoá chữ thường có dấu chấm thì mọi gói bị từ chối. | Chốt khoá máy miễn hay bị bắt, đo cả ô khoá. | fixed: khoá máy cấp miễn lưới đuôi bất kỳ; AC-4, E4 thêm ô khoá |
| P1 | design | Hỏi-2 chưa nêu giá của lối khuyến nghị: địa danh viết thường, và đuôi ngắn bắt nhầm H.Me Linh, P.Co Giang. | Chủ kho chọn trên tiền đề sai, một trường địa danh làm cả gói bị từ chối. | Hỏi-2 ghi giá, AC-4 đo đúng các chuỗi đó. | fixed: bỏ đuôi ngắn khỏi danh sách không phân biệt hoa thường; Hỏi-2 nêu giá; AC-3, AC-4 đo |
| P1 | evals | E5 không nêu vị trí, E6 chỉ một đường vào. | Đường phiên vẫn 500 mà eval xanh. | Bốn vị trí, hai đường vào. | fixed: E5 bốn vị trí, E6 hai đường |
| P1 | contract | Ngưỡng SỐNG đòi ảnh chụp không đổi cho cả ba nhánh; timebox trống. | Hai nhánh chưa từng đẩy lên khu có ảnh chụp. | Eval tầng ghi cho ba nhánh; điền timebox. | fixed: AC-2, E2 ba lỗi × hai đường trên khu có ảnh chụp; timebox ghi không áp dụng |
| P2 | contract | Dòng sổ chỗ đặt kiểm giờ có câu trích không quyết được. | Cổng Phạm vi tin ADR đã quyết. | Đưa thành Hỏi. | human-gate1: Hỏi-3 |
