---
slug: chup-anh-dien-thoai
at: 2026-11-05T17:11:56Z
verdict: findings
p0: 1
p1: 4
p2: 0
---

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P0 | decisions | Dòng d-20261105T170645Z-5 ghi máy quyết (một lối) «mặc định Gửi được mỗi lần mở ngăn» trong khi «không mặc định», «mặc định Nội bộ», «nhớ ngăn lần trước» vẫn sống — đánh đổi an toàn/tiện là của người | Đầu chủ quên chọn ngăn, ảnh sổ đỏ tự tải ở nền vào Gửi được, gửi khách được | Câu chỉ-người có đủ lối, giá, khuyến nghị; bài đo ghim mặc định | fixed: dòng mới Hỏi-2 (chi-nguoi, supersedes d-20261105T170645Z-5) nêu bốn lối kèm giá, máy khuyên «không mặc định»; AC-2 ghi «theo Hỏi-2»; design §2, §4, §6 sửa theo; E2 thêm ô «mở ngăn lần đầu · lần hai» và chiều đỏ «nhớ ngăn lần trước» |
| P1 | evals | AC-3 hứa tải ở nền khi đóng ngăn hay rời hồ sơ; E3 chỉ thử hàng chờ thuần, E12 đóng ngăn sau khi đã tải | Hàng chờ nằm trong state của thành phần, rời hồ sơ là mất ảnh mà mọi bài vẫn xanh | Đếm dòng máy chủ khi trang đã ở màn khác | fixed: thêm E18 (ui-check, backend-effect): chặn mạng, nạp 2 ảnh, đóng ngăn, sang Hôm nay, mở mạng, đếm unit_photos +2 không mở lại hồ sơ; đối chứng bản sao giữ hàng chờ trong thành phần đếm +0 |
| P1 | contract | Design ghi «hết phiên → ảnh giữ chờ tới khi đăng nhập lại» nhưng không AC, Coverage hay eval; AC-6 xoá khi đăng xuất; E3 không có 401 | Bản dựng coi 401 là lỗi hay xoá kho khi hết phiên → mất ảnh chụp ở hầm khi phiên hết | Ô 401 giữ kho và ô đăng nhập lại ra đủ dòng | fixed: AC-4 thêm «401 hay hết phiên → giữ Chờ, tải tiếp khi chính người ấy đăng nhập lại; chỉ đăng xuất chủ động hay máy bị báo mất mới xoá»; Coverage thêm trục «Phiên»; E4 thêm hai ô (401 → kho giữ 3 ảnh; đăng nhập lại → 3 dòng) và chiều đỏ «401 coi là loi»; E7 ghim 401 không xoá kho |
| P1 | evals | E4/E7 chạy trên kho giả, không bài nào chạm IndexedDB thật và nút đăng xuất thật; E7 đo «tên kho có mã người» (chuỗi có mặt) thay quan hệ | Kho thật không giữ qua tải lại hay không bị xoá khi đăng xuất; người B trên cùng máy thấy ảnh sổ của A | Quan sát IndexedDB thật và màn của người B | fixed: E12 ghim «tải lại khi chặn mạng → còn 3 dòng Chờ mạng; mở mạng → unit_photos +3»; thêm E19 (ui-check, backend-effect): đăng xuất bằng nút thật → indexedDB.databases() không còn kho ảnh chờ, người B không thấy ảnh chờ của A, đối chứng dương A đăng nhập lại trước khi đăng xuất vẫn thấy; E7 đo quan hệ (kho của A mở bằng mã B rỗng) và thêm chỗ đăng xuất vào paths |
| P1 | contract | Đường đo trỏ sai bài (E11 là lint, E12 chỉ ảnh chụp); E16 không tự tạo link gửi nên «trang khách» không có đối chứng | Cổng Giá trị đọc số từ bài không đo thước ấy; trang khách rỗng cũng «không chứa» mã Nội bộ | Mỗi thước trỏ bài đo đúng; bộ dò trang khách có đối chứng dương | fixed: Đường đo sửa — đúng ngăn → E2, E14; không mất → E4, E15, E18; không trùng → E5, E15; sổ không ra ngoài → E6, E16, E17; không phải chờ → E3; E16 thêm bước dau-chu-1 tạo link gửi căn mẫu và đối chứng dương /s/<mã> chứa mã ảnh Gửi được, không chứa mã ảnh Nội bộ |
