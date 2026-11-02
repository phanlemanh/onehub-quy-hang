---
slug: he-bo-cuc
at: 2026-11-02T03:00:00Z
verdict: findings
p0: 0
p1: 4
p2: 1
---
## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P1 | evals | E4 quét «không nút tạo trùng» chỉ ở `app/**`; chiều đỏ khai ở DesktopHeader (`components/shell/`) nên không bao giờ đỏ; AC-4 hứa quan hệ «một chỗ» mà eval chỉ dò chuỗi | Nút «+ Lead» rời còn trên thanh trên hay trong một thành phần dưới `components/` mà E4 vẫn xanh | Quét `app/**` + `components/**` trừ `menu-tao.tsx`; chiều đỏ thật trên app-shell.tsx; E4u đếm liên kết tạo trên màn = 1 mỗi địa chỉ | fixed: E4 quét cả components/** (trừ menu-tao, ui, reui, mau), chiều đỏ ghim components/shell/app-shell.tsx; E4u thêm bước đếm a[href] mỗi địa chỉ tạo đúng một |
| P1 | contract | Ngoại lệ có hạn không có ma trận viết trước; hồ sơ căn không có mã hàng; E9 thiếu ca hạn lạ | Cài đặt sàn gắn ngoại lệ thay vì chuyển mà E9b vẫn xanh (n ≥ 1); hạn trỏ mã không có thành nợ vĩnh viễn; fixture lộ trình viết tay | Bảng ngoại lệ viết trước; E9b so trọn tập; E9 thêm hạn lạ và hạn = 91; lộ trình lấy từ lo-trinh.json thật | fixed: design §«Chuyển màn trong hàng» có bảng 11 tệp → hàng 79 · 33 · 42 · 51 (tra lo-trinh.json 02/11); E9b so trọn tập và cấm settings/trang tạm; E9 thêm «hạn lạ» (mã không có, mã 91) và đọc lộ trình bằng bộ đọc của bài quét trên bản sao tệp thật |
| P1 | evals | Không eval đo nhánh bản chính thức của trang mẫu (Hỏi-1) | Cờ bản chính thức đọc sai → giao diện vỏ lộ ra không đăng nhập, mọi eval vẫn xanh | Ca VERCEL_ENV=production: proxy không mở, trang notFound; đối chứng preview | fixed: E7 thêm ca «bản chính thức đóng trang mẫu» kèm đối chứng VERCEL_ENV=preview, ghim tên biến; proxy.ts nay không mở /mau/he-bo-cuc khi VERCEL_ENV=production |
| P1 | evals | E8 đo ảnh có mặt, không đo quan hệ với trang mẫu | Ảnh giữ chỗ hay ba khổ cùng một ảnh vẫn qua | Tệp kê 21 dòng (địa chỉ, khổ, commit) khớp tệp; bề rộng PNG khớp khổ trong tên | fixed: bước chụp ghi design/anh-chuan/ke.json; E8 assert 21 dòng kê khớp 21 tệp và bề rộng IHDR bằng khổ trong tên. Không thêm so điểm ảnh — deferred: ngưỡng sai khác điểm ảnh chưa có chuẩn nào trong kho để khai |
| P2 | evals | E4u, E6 ghi sẵn khuyến nghị của Hỏi-2, Hỏi-5 làm kỳ vọng | Người chọn lối khác → bản đúng ý người bị chấm FAIL hay máy dựng theo khuyến nghị để qua | Kỳ vọng theo dòng sổ người chọn | fixed: E4u, E6, E7 viết kỳ vọng «theo lối người chọn ở dòng sổ Hỏi-n (gate1)» kèm hình của từng lối |
