---
slug: che-vung-anh
at: 2026-11-01T15:29:39Z
verdict: findings
p0: 1
p1: 3
p2: 1
---
## Findings
| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P0 | design, contract | «Che vùng…» trên mọi ảnh, không cấm che ảnh ngăn Nội bộ; bản che là dòng mới ở Gửi được | Che một góc ảnh sổ ở Nội bộ rồi lưu: phần còn lại của ảnh sổ (trần never_leaves_company) ra ngăn Gửi được, lách bất biến 2 | AC-1 giới hạn ngăn Gửi được; eval menu ảnh Nội bộ không có mục; hàm lưu từ chối nguồn Nội bộ | fixed: AC-1 chỉ ảnh Gửi được + hàm lưu từ chối nguồn Nội bộ (d-…-11); E6 thêm bước menu ảnh Nội bộ; E5 thêm ca (d) |
| P1 | design, contract, evals | Không tính hướng xoay EXIF của ảnh dọc chụp điện thoại | Khung vẽ trên ảnh đã xoay bị đổi theo điểm ảnh thô, tô lệch, bản che lộ số nhà; E1–E3 xanh vì ảnh không xoay | Ô ảnh hướng 6 ở E1; E8 dùng JPEG dọc hướng 6 có mốc và kiểm mốc bị tô | fixed: AC-2 thêm ca ảnh dọc theo EXIF; E1 thêm ô hướng 6; E8 tải JPEG dọc có mốc đỏ, kiểm mốc bị tô (d-…-12) |
| P1 | evals | AC-6 không có đối chứng dương: E4 dùng bộ mã hoá giả, E8 có thể dùng ảnh không EXIF | Bản thật giữ siêu dữ liệu, GPS ra ngoài; E4, E8 vẫn xanh | E8 bắt buộc ảnh gốc có EXIF trước khi che; bỏ nhánh bộ mã hoá giả ở E4 | fixed: E8 đòi coExif(G)=true làm điều kiện bài; E4 bỏ nhánh bộ mã hoá giả |
| P1 | contract, evals | Vế lịch sử sự kiện và «giữ nguyên byte» của AC-5 không có eval đo đúng | Lưu qua đường không ghi sự kiện, hay ghi đè byte cùng cỡ, mọi eval vẫn xanh | E8 đọc lịch sử trước/sau, đòi hai sự kiện đúng thứ tự, so băm byte | fixed: AC-5 nêu băm byte và hai sự kiện theo thứ tự; E8 so sha256 và đọc lịch sử ảnh |
| P2 | design | Bảng đối chiếu: dòng «Bản gốc giữ lại» 0 sản phẩm; kiểu che là chỗ ta cứng chưa thành Hỏi | Cổng duyệt Hỏi-1 không có căn cứ ngành; kiểu che lọt cổng không lý do | Thêm sản phẩm hoặc «chưa kiểm»; dòng kiểu che thành Hỏi | fixed: thêm dòng «Kiểu che» → Hỏi-3 (d-…-13); dòng «Bản gốc giữ lại» ghi hai sản phẩm «chưa kiểm» |
