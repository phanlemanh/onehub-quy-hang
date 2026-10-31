---
slug: bao-ro-ngay-ban-sai
at: 2026-10-31T09:15:00Z
verdict: findings
p0: 0
p1: 2
p2: 3
---

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P1 | evals | Chiều đỏ của E3 (thêm 2026-02-30 vào NGAY_CO_THAT) không đỏ được: ca chỉ so «lõi nhận ⇔ Postgres nhận», không buộc nhãn ma trận vào Postgres | Người chấm chạy đúng chiều đỏ ghi trong expected mà ca vẫn xanh; hoặc ca bị siết thành so nhãn và mất lời hứa «không ngày nào lõi cho qua mà Postgres từ chối» | E3 assert hai vế: (a) nhãn ma trận khớp Postgres; (b) lõi nhận ⇔ Postgres nhận; chiều đỏ Date.parse đỏ ở (b), thêm ngày sai vào NGAY_CO_THAT đỏ ở (a) | fixed: E3 viết lại hai vế và hai chiều đỏ |
| P1 | contract | Hợp đồng không nói hàng nới vùng sang packages/api/test-db/ngay-ban/**; paths của E4 có packages/api/src/listings/** | Chủ kho ký «sửa ở lõi» mà không thấy hàng đặt tệp kiểm vào gói API | Notes ghi vùng hàng trỏ sổ d-4; E4 bỏ đường API khỏi paths | fixed: Notes thêm dòng vùng (đã khai bằng lệnh hang vung); E4 bỏ packages/api/src/listings/** |
| P2 | evals | Ca sai dạng của E1 không ghim lời báo, chỉ đòi lý do khác «ngày không có thật» | Viết lại hàm làm chuỗi sai dạng ra lời khác mà E1 vẫn xanh | Mỗi giá trị sai dạng ra đúng [{path: closeDate, reason: hằng «cần ngày YYYY-MM-DD»}] | fixed: E1 ghim lời bằng hằng xuất ở events.ts |
| P2 | evals | E4 tự viết tay khuôn thân lỗi; đối chứng dương không nêu GET đọc ngày bán từ đâu | Thân lỗi có thêm trường làm E4 đỏ oan; cột date qua trình điều khiển lệch múi giờ | Dựng thân lỗi từ API_ERRORS.invalidPayload.code + hằng lời của lõi; đọc ngày bán ở GET và close_date::text | fixed: E4 dựng khuôn từ hằng và đọc ở hai chỗ (GET đã ép close_date::text ở routes.ts) |
| P2 | contract | Không đo rủi ro còn đường ghi closeDate khác không qua validatePayload | Đường khác mang closeDate vẫn để ngày sai xuống Postgres và trả 500 | Eval liệt mọi chỗ ghi close_date hoặc Coverage trỏ «một đường ghi duy nhất» | fixed: Coverage trục lớp đọc trỏ AGENTS.md «đường ghi duy nhất» và store.ts — closeDate chỉ vào qua status_changed của applyCommand; khuôn created chặt không nhận closeDate |
