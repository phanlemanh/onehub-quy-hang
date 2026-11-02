---
slug: va-nap-mau-co-anh
at: 2026-11-02T15:50:00Z
verdict: findings
p0: 0
p1: 1
p2: 4
---

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P1 | contract | Ba lần nạp trên cùng sàn mẫu mà không đòi gỡ giữa các lần, không ghim trạng thái đầu, không ghim lúc chụp số đếm | Chạy lần nạp Postgres trước chiều «byte rò» mà không gỡ: 58 dòng còn lại khiến chiều đỏ xanh dù bộ bọc không ghi dòng nào — đúng lỗi âm tính không thể đỏ; ngược lại ảnh còn lại làm tập mong thành 116 và AC-1 đỏ oan | Assert sàn mẫu vắng trước mỗi lần nạp; bộ bọc tự đếm lần insert = 58; số đếm chụp ngay sau lần nạp | fixed: hợp đồng thêm câu dẫn «trước mỗi lần sàn mẫu vắng, số đếm chụp ngay sau lần ấy, gỡ trước lần kế»; AC-3 chiều 2 nạp từ sàn mẫu vừa gỡ sạch, bộ bọc tự đếm 58; E1, E3 ghi vế vắng và vế đếm |
| P2 | design | Phép so chỉ đo đường và phương thức PUT, không đo thân — lời hứa là byte gói mẫu tới Storage | Bộ nạp gửi thân rỗng hay byte thumb vào đường original: đủ 58 PUT đúng đường, ca xanh | Tập bội (độ dài, sha256) thân PUT theo biến thể so với byte của lần nạp Postgres | fixed: AC-2 và E2 so tập bội (biến thể, sha256) của 58 thân PUT với 58 dòng unit_photo_files, chiều đỏ đổi một byte thumb thì lệch nêu biến thể và số thân |
| P2 | evals | Tập mong dựng từ unit_photos đọc lại — không có vế số đếm độc lập với cơ sở dữ liệu | Bộ nạp bỏ qua ảnh ở nhánh kho s3: tập mong rỗng bằng tập PUT rỗng, ca xanh | Số ảnh sàn mẫu bằng số ảnh mong đếm từ gói mẫu, số PUT bằng 58, assert giá trị cụ thể | fixed: AC-1 và E1 thêm vế số đếm từ gói mẫu GOI (29) và 58 PUT, assert giá trị cụ thể |
| P2 | evals | E5 so với origin/main di động và chỉ liệt ba tệp | Main gộp thay đổi ở kho.ts thì E5 đỏ oan; thợ sửa helper khác ngoài ba tệp thì E5 vẫn xanh | So theo điểm rẽ nhánh, danh sách cho phép đóng, chiều đỏ gọi tên tệp lạ | fixed: E5 thành _acceptance/va-nap-mau-co-anh/thu/ranh-gioi.mjs theo lệ kho — điểm cắt merge-base, dưới packages/ và apps/ chỉ đúng tệp bài kiểm, đối chứng đỏ kho.ts giả trong cùng lệnh |
| P2 | contract | AC-4 hứa gỡ sàn mẫu mà không eval nào đo | Ca ném giữa chừng hay quên gỡ: sàn mẫu và 58 dòng byte nằm lại, ca sau đọc dữ liệu cũ, bộ kiểm vẫn exit 0 | Gỡ ở mọi lối ra; cuối ca 0 sàn mẫu, 0 dòng ảnh và byte của các mã sàn mẫu | fixed: AC-4 đòi gỡ ở mọi lối ra kể cả khi ném; E1 thêm vế cuối ca timSanMau rỗng và 0 dòng unit_photos, unit_photo_files của mọi mã sàn mẫu ca đã dựng; bộ kiểm còn tự chặn ở before() khi Postgres dãy có sàn mẫu |
