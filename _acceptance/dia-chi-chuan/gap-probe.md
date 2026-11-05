---
slug: dia-chi-chuan
at: 2026-11-05T12:20:00Z
verdict: findings
p0: 2
p1: 2
p2: 1
---

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
| --- | --- | --- | --- | --- | --- |
| P0 | design | Máy tự chọn nguồn mã đơn vị hành chính (thuviennhadat.vn cho 34 tỉnh, Wikipedia cho bốn phường) mà sổ không ghi; eval đo mã vòng tròn từ cùng nguồn | Một mã xã sai, bộ đọc và bộ kiểm cùng mang mã sai nên eval vẫn xanh; hàng 76 lưu khoá trên mã sai rồi phải dựng lại | Dòng sổ chi-nguoi về nguồn mã, trình ở Cổng Phạm vi; đối chiếu mã với nguồn thứ hai do người chỉ | human-gate1: thành Hỏi-2 (sổ dòng 10), design §Danh mục và Notes của contract ghi «chưa đối chiếu Phụ lục II» |
| P0 | design | Dòng sổ «thiếu tỉnh không suy tỉnh» ghi nguồn mục-tiêu mà câu trích ADR chỉ liên quan; lý do thật là danh mục chép một phần [du-lieu-mau-thap-tang#F1] | Cổng ký vì tin ADR đã quyết; khi danh mục đủ, luật vẫn bắt chọn thêm một chạm mà không ai biết lúc nào xét lại | Dòng sổ mới nguồn một-lối với điều kiện mở lại | fixed: dòng sổ 9 thay dòng 5 (supersedes), nguồn một-lối, revisit khi danh mục cấp xã đủ; design luật 5 ghi điều kiện xét lại |
| P1 | contract | Không ma trận viết trước cho tên gọi khác của tỉnh, «Sài Gòn» không phải tỉnh, và xã chỉ tìm trong tỉnh đã đọc | Bản cài tìm xã trên toàn danh mục: «Phường Tân Định, Tỉnh Bắc Ninh» ra khoá của Tân Định TP.HCM; eval vẫn xanh | Ma trận tỉnh viết trước trong AC-6, đếm in ra, phá thử bỏ lọc theo tỉnh → «xã đọc ngoài tỉnh» | fixed: AC-6 thêm câu đọc tỉnh và lọc xã theo tỉnh; E6 thêm ma trận tỉnh, ca Bắc Ninh, ca «Sài Gòn» cuối chuỗi, phá thử ghim thông điệp |
| P1 | design | Khuôn ứng viên không có tỉnh, tenCu bắt buộc dù ca thiếu tỉnh không có tên cũ, chưa có luật ưu tiên trạng thái | Hai bản cài khác trạng thái và khác khuôn ứng viên đều qua E6; hàng 76–78 rẽ nhánh theo trạng thái rồi vỡ | Ứng viên mang maTinh, tenCu tuỳ chọn, luật «thiếu» thắng; E6 so đúng tập; E3 so trạng thái | fixed: design §Kết quả đọc (ungVien có maTinh, tenTinh; tenCu tuỳ chọn; trangThai thieu thắng); E6 dùng thieu = tập đúng và ghim maTinh; E3 so trangThai suy từ đáp án |
| P2 | evals | Lớp đo không mạng chưa kín: tập tệp không ghim, thiếu import() và require(, mẫu trần http đỏ oan vì URL nguồn, vá chạy thiếu http.get, tls | Lời gọi qua import("node:https") hay http.get lọt cả quét lẫn chạy; hoặc danh-muc.ts đỏ oan vì URL nguồn | Ghim tập tệp, quét theo tên module, đối chứng dương URL nguồn, bốn phá thử | fixed: E9 viết lại theo đúng các mục ấy |
