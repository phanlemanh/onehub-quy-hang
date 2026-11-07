---
slug: anh-khong-chan-ban
at: 2026-11-07T02:00:00Z
verdict: findings
p0: 1
p1: 3
p2: 1
claims_input: ok
---

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
| --- | --- | --- | --- | --- | --- |
| P0 | design | Dòng sổ máy quyết «mặc định 0» không quyết chuyện sàn đang chạy chưa đặt riêng có lật theo không — lựa chọn chỉ người có, khó đảo (căn đã Đang bán là gửi được) [va-ac9-mau-co-san#F1] | Gộp xong, sàn cũ chưa từng đặt thấy căn 0 ảnh lên Đang bán mà người ký tưởng chỉ sàn mới đổi | Dòng Hỏi chi-nguoi, kho_dao true về sàn đang chạy; ca cho sàn có từ trước | human-gate1: thành Hỏi-6 (kho_dao true) trên thẻ Cổng Phạm vi; AC-2 và E2 thêm ca sàn đã lưu dòng 1 và ca sàn vắng khoá theo câu chốt Hỏi-6 |
| P1 | evals | Mọi ca đo trên sàn mới tạo; không ca nào cho sàn đã lưu cấu hình từ trước hàng | Sàn từng bấm lưu Cài đặt giữ dòng 1 nên căn 0 ảnh vẫn bị chặn, eval vẫn xanh | Ca test-db sàn có dòng lưu trước | fixed: E2 thêm ca chèn thẳng dòng 1 (giữ chặn) và ca sàn có dòng khoá khác mà vắng khoá này; phần giả định «lối lưu chung ghi đủ bộ khoá mặc định» rejected: `writeCompanySettings` chỉ ghi khoá người đổi (packages/api/src/settings/store.ts) |
| P1 | evals | Lời hứa «gửi khách được» chỉ đo bằng dựng thành phần với fixture tay; AC-9 thiếu cross-layer | Lối tạo lần gửi hay dữ liệu trang khách lỗi với căn 0 ảnh mà E9 vẫn xanh | Eval test-db: tạo lần gửi, đọc dữ liệu trang khách | fixed: AC-9 gắn (cross-layer), thêm E9c (backend-effect) gửi căn 0 ảnh và đọc dữ liệu trang khách, đối chứng căn có ảnh |
| P1 | evals | photosCount trên máy đầu chủ không được đo qua đồng bộ thật; E5, E6, E6b dựng sẵn số | Tải ảnh lên mà máy vẫn 0 hoặc lớp lưu bỏ trường, Hôm nay nhắc mãi | Ca db-test đồng bộ thật trước và sau tải ảnh | fixed: AC-6 gắn (cross-layer), thêm E6c — kéo về 0, tải ảnh Gửi được kéo lại 1, ảnh Nội bộ không cộng, chiều đỏ bỏ trường |
| P2 | evals | E9b chạy lại bộ rò rỉ cũ, không mồi cho số đếm và mục ảnh | Đổi sau này kéo ảnh Nội bộ ra trang khách mà bộ cũ không biết | Mồi ảnh Nội bộ trong tệp ro-ri | fixed: E9b đòi ca mới có mồi ảnh Nội bộ và đối chứng dương |
