---
slug: va-che-vung-anh
at: 2026-11-02T05:03:00Z
verdict: findings
p0: 0
p1: 2
p2: 2
---

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P1 | evals | E4 là bài duy nhất kiểm trình che thật sự gọi bước đổi cỡ hiển thị sang cỡ vẽ, nhưng hai điểm dò 0,35 và 0,75 không tách bản đúng với bản lỗi; thiếu đối chứng dương. | Khổ 1024×768, ảnh dọc: cỡ vẽ 450×600, trần cao ~560 nên hệ số co ~0,933. Trình che quên gọi diemTrenKhung thì vùng đen rơi 0,187–0,467 thay vì 0,2–0,5: điểm 0,35 vẫn đen, 0,75 vẫn không đen — E4 xanh, E1 xanh vì chỉ thử hàm thuần; lệch ~20px lọt qua Cổng Bằng chứng. | Tính vùng mong đợi theo cỡ vẽ, dò sát mép trong/ngoài; bước dò trước tính vùng của bản lỗi «không chia tỉ lệ» và đòi ít nhất một điểm đổi kết quả, không thì trượt «thước không phân biệt được»; ghi hệ số co. | fixed: E4 kéo 0,2–0,8, ghi hệ số co s, bốn điểm dò 0,5 · 0,78 · 0,82 · 0,15 (0,78 đen ở bản đúng, không đen ở bản lỗi 0,187–0,747), bước dò trước trượt «thước không phân biệt được» khi không điểm nào tách. |
| P1 | design | Ngoại lệ có hạn chỉ tính trường hợp hàng 91 chưa gộp; câu trích dòng sổ -3 bảo ghi ở bản đồ khuôn — tệp thiết kế nói ngoài vùng. [chuyen-khong-ket-khoa#F1] | Hàng 91 gộp trước, mang luật quét khuôn; E8 đỏ ở hai lớp đặt tay vì ngoại lệ không ở bản đồ khuôn; hàng không gộp được hoặc phải chạm tệp ngoài ranh giới làm E10 đỏ; chủ kho ký tưởng ADR cho phép ghi ở Notes. | Dòng sổ mới thay -3 nói rõ ghi lệch chỗ ADR và lý do; hợp đồng thêm điều kiện xin chạm bản đồ khuôn khi hàng 91 gộp trước, mở E10 cho đúng tệp; E8 ghi nhánh chính có hay chưa có luật của hàng 91. | fixed: dòng sổ d-20261102T050346Z-10 thay -3 (một lối: bản đồ khuôn ngoài ranh giới, ngăn nổi chưa có); Notes hợp đồng thêm nhánh «hàng 91 gộp trước» → cham-tep bản đồ khuôn, thêm tệp vào E10, báo cáo S4 ghi E8 chạy trên main có hay chưa có luật hàng 91. |
| P2 | evals | E3 không đo hết AC-3 ở 1024×768. | Chỉ kiểm co ở ảnh dọc, không kiểm đáy canvas ≤ đỉnh nút, nút trọn trong hộp; canvas đè nút mà hộp và nút vẫn trọn trong cửa sổ thì E3 xanh. | Thêm cho mỗi ảnh: co ở cả ảnh ngang; đáy canvas ≤ đỉnh nút; nút trọn trong hộp. | fixed: E3 đòi cho cả hai ảnh co (ghi hệ số), đáy canvas ≤ đỉnh nút «Lưu bản che», nút trọn trong hộp và cửa sổ. |
| P2 | contract | Dòng sổ -4 ghi nguồn mục tiêu nhưng câu trích «Che trên điện thoại (cảm ứng)» chỉ liên quan, không quyết việc đổi cỡ hiện khung vẽ trên điện thoại. [va-san-sang-ban#F1] [chuyen-khong-ket-khoa#F1] | AC-5 đòi khung trọn trong hộp trên điện thoại — một thay đổi; chủ kho đọc «điện thoại giữ như cũ» rồi ký mà không thấy máy diễn giải lại. | Dòng sổ mới thay -4, nguồn một lối với lối chết nêu được; AC-5 ghi điều đổi và điều giữ. | fixed: dòng sổ d-20261102T050346Z-11 thay -4 (một lối: giữ khung không co riêng điện thoại là viết nhánh chỉ để giữ hiện tượng tràn câu giao gọi là lỗi); AC-5 nói rõ giữ hộp, ba nút, không cảm ứng — đổi duy nhất là khung co theo hộp. |
