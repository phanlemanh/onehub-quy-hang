---
slug: va-dien-ma-can-cho-hang
at: 2026-11-02T10:05:00Z
verdict: findings
p0: 2
p1: 3
p2: 0
---
## Findings
| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P0 | design | Dòng sổ -4 ghi máy quyết lời báo và cách hiện nó, nhưng câu báo là chữ người dùng đọc và còn lối để moTaLoi chuyển câu của lõi [va-san-sang-ban#F1] | Chủ kho ký AC-3 tưởng chỉ có một cách; lời báo do máy tự đặt chưa ai chọn; lệnh đã xếp trước bản vá vẫn hiện câu chung | Dòng sổ Hỏi mới (chỉ người, thay -4): câu chữ và chỗ kiểm | human-gate1: ghi Hỏi-1 (thay -4), máy khuyên câu hiện tại, web kiểm trước, giữ moTaLoi |
| P0 | design | Dòng sổ -2 trích câu chú thích của migration 007, không trích thân hàm app.unit_key nên không quyết tập ký tự | Thân hàm khác (unaccent, chữ Unicode) thì lõi và cơ sở dữ liệu lệch mà eval vẫn xanh | Trích dòng biểu thức của thân hàm | fixed: dòng sổ mới (thay -2) trích nguyên dòng thân hàm `[^0-9A-Za-z]`; E2 thêm ca so hai chiều lõi với app.unit_key thật |
| P1 | evals | Ma trận E1 thiếu ca chặn luật viết bằng \w hay lớp chữ rộng hơn | Luật /\w/ nhận «_» mà app.unit_key ra NULL; 14 ca vẫn xanh | Thêm «_», «__», «Đ-Ê»; ca so hai chiều trên Postgres | fixed: E1 thành 2 × 10 ca; E2 thêm ca «luật lõi khớp app.unit_key» trên bảng 10 mã |
| P1 | contract | AC-2, E2 chỉ đo đường gắn mã ở máy chủ, không đo tạo hàng; chưa kiểm khuôn connect | Tạo hàng «---» trả 201, hàng mang mã rác — đúng Ngoài-4 | Ca POST /listings «---» → 400, đối chứng 201; kiểm connect | fixed: AC-2 và E2 thêm tạo hàng; dòng sổ fix ghi khuôn connect là căn danh mục, không tạo hàng — createListing là lối duy nhất |
| P1 | evals | E3u chỉ chụp 1440 trong khi dòng sổ bỏ design-pass lấy E3u làm lưới cho 375 [dien-ma-can-cho-hang#F1] | Câu báo tràn hay vỡ dòng trên điện thoại mà Cổng 2 không thấy | Thêm bước 375 và chụp | fixed: E3u thêm bước 375x812, ảnh E3u-2-375.png, đo scrollWidth |
