---
slug: nap-mau-co-anh
at: 2026-11-02T05:18:00Z
verdict: findings
p0: 1
p1: 3
p2: 1
---

# Phản biện context sạch — nap-mau-co-anh

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P0 | design | Dòng sổ xoá byte (d-…-5) ghi máy quyết, kho_dao false, nhưng xoá đối tượng Storage bản thật không đảo được; E6 không ghim mã sàn của lệnh xoá | Gỡ lọc sai sàn → lệnh xoá trên Storage bản thật mang mã sàn thật, byte ảnh thật mất vĩnh viễn; E6 vẫn xanh vì chỉ so tập mã ảnh | kho_dao true, thành Hỏi riêng ở Cổng 1; E6 assert mỗi lệnh xoá mang mã sàn mẫu, chiều đỏ với một lệnh mang mã sàn thật | human-gate1: Hỏi-2 (dòng d-…-10 thay d-…-5, kho_dao true); fixed: AC-5, AC-6 ghim mã sàn của từng lệnh xoá, E6/E7 assert companyId + chiều đỏ; design mục 5 nói rõ câu lọc theo mã sàn mẫu |
| P1 | evals | Không eval nào đo bước «Chạy bộ nạp» trong nap-mau.yml có NODE_ENV=production — dấu làm bộ nạp dừng khi thiếu khoá | Bước mất NODE_ENV → chonKhoAnh chọn Postgres trên bản thật, 29 ảnh vỡ; E5, E8 vẫn xanh | E8 assert NODE_ENV production ở bước ấy, chiều đỏ khi bỏ | fixed: AC-7 thêm vế NODE_ENV; E8 thêm assert + chiều đỏ |
| P1 | evals | Phần chọn kho không có ma trận; lời báo «đúng biến thiếu» chỉ đo ca thiếu cả ba bằng chuỗi có mặt; ca thiếu một phần ngoài bản thật chưa khai | Lỗi chọn kho trả Postgres dù đủ khoá, hay lời báo nêu thừa biến — E5 vẫn xanh | Ma trận viết trước {đủ, thiếu từng biến, không biến} × {production, khác}, so tập | fixed: AC-4 khai hành vi thiếu một phần; E5 ca «chon-kho» ma trận 6 ô so tập + ca không khoá ngoài bản thật dùng Postgres |
| P1 | evals | AC-6 chỉ đo một điểm hỏng (lead cuối); tập «đã ghi» có thể lấy từ danh sách của chính bộ nạp; hỏng giữa lúc byte đã tải mà dòng chưa ghi không đo | Hỏng ở ảnh thứ 10 sau khi tải byte → mã không vào danh sách, byte mồ côi; E7 vẫn xanh vì hai vế cùng nguồn | Ca hỏng ở lần ghi thứ k; so tập xoá với nhật ký ghi của kho giả | fixed: AC-6 thêm ca kho ném ở lần ghi 10, so theo nhật ký kho; design mục 4: lớp ghi sổ bọc kho, ghi trước khi chuyển xuống; E7 thêm ca + chiều đỏ |
| P2 | evals | Câu hỏi E9 đòi hai vế AC-8 không có; vế hành vi chỉ đọc README không kiểm được | README đúng AC-8 mà E9 FAIL oan; hay README nói đúng mà nút thật không dừng | Đồng bộ AC-8 và E9; vế hành vi để eval máy đo | fixed: AC-8 thêm ba vế (không ảnh thật của ai, câu dừng khi thiếu secret, gỡ xoá byte); E9 hỏi «README có nói», hành vi do E5, E8 đo |
