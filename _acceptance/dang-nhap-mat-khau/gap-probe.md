---
slug: dang-nhap-mat-khau
at: 2026-11-04T16:40:00Z
verdict: findings
p0: 3
p1: 2
p2: 0
---

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P0 | design | Luật 5 chỉ được kiểm lúc cấp. Không luật nào xử lý mật khẩu do quản trị A cấp (hay mật khẩu đặt từ mật khẩu tạm ấy) khi người đó sau này vào thêm sàn B. | Quản trị A cấp mật khẩu tạm cho m (chỉ ở A), tự đăng nhập bằng mật khẩu tạm trước m và đặt mật khẩu mình biết; m quay sang mã 6 số; về sau m vào sàn B; quản trị A đăng nhập thành m ở sàn B và đọc số chủ nhà — ngưỡng chết và bất biến 1, 2. | AC và ca cách ly: mật khẩu gốc sàn cấp bị vô hiệu khi chèn company_members ở sàn khác; đối chứng dương: mật khẩu tự đổi ở Cá nhân vẫn đăng nhập được. | fixed: thiết kế §2 luật 5, §3.1 cột origin và trigger vô hiệu; AC-2 thêm vế vào sàn khác; E2 thêm ca ba hình (hai vô hiệu, một đối chứng dương); trục A Coverage thêm ô; sổ dòng mot-loi mới. |
| P0 | decisions | Dòng sổ -6 ghi mot-loi nhưng hệ quả «tải lại là mất lối vào, phải xin quản trị cấp lại» là lựa chọn chỉ người có, còn lối sống khác (dùng lại tới khi đặt xong, sessionStorage). | Người mới chuyển app rồi quay lại, trang tải lại, «đăng nhập lại» dẫn tới «mật khẩu tạm đã dùng» — ngõ cụt; Cổng Phạm vi không thấy lựa chọn. | Dòng sổ chỉ-người supersedes -6; chữ ST-dat-mat-khau-het-phien khớp việc làm tiếp được; E10 assert đăng nhập lại về /dat-mat-khau. | fixed: Hỏi-5 (khuyến nghị dùng lại tới khi đặt xong hay hết 72 giờ) supersedes -6, dòng mot-loi «không tạo phiên» viết lại; thiết kế §2 luật 2, §3.2 bước 4; AC-3 và E3 theo khuyến nghị; ST-dat-mat-khau-het-phien «đăng nhập lại bằng mật khẩu tạm»; E10 ô (8) đo việc tiếp theo. |
| P0 | decisions | Dòng sổ -10 trích luật sáu nhóm, câu ấy không quyết dòng «Mật khẩu» ở nhóm nào. | Cổng Phạm vi duyệt với chỗ đặt dòng đã ghim sẵn; người tìm cạnh «Báo mất máy» không thấy; E10, E20 ghim cứng. | Dòng sổ chỉ-người supersedes -10; eval theo kết quả Hỏi. | fixed: Hỏi-6 (khuyến nghị «Hồ sơ», lối khác «Máy đang đăng nhập») supersedes -10; AC-9, E20, E22 đọc kết quả Hỏi-6. |
| P1 | contract | Ngưỡng chết «mật khẩu ở nhật ký, sự kiện, trang» chỉ trỏ E1 (lúc cấp); không eval quét nhật ký đăng nhập, đặt lần đầu, đổi; không eval kiểm địa chỉ, lịch sử. | Đường đặt lần đầu in thân yêu cầu khi từ chối 400, mật khẩu vào nhật ký Vercel; hay changeToken vào query — E1, E10 vẫn xanh. | Ca quét nhật ký cho mọi đường mang mật khẩu và mã đổi, phá-thử; E10 ghi URL và history. | fixed: AC-1 thêm vế nhật ký mọi đường; E21 mới (chín lời gọi viết trước, đối chứng dương, phá-thử có vật); E10 ô (6) assert URL và lịch sử; Đường đo trỏ E1, E21, E10. |
| P1 | evals | AC-9 hứa «mỗi trạng thái ở 375 và 1280» nhưng E10 không theo ma trận viết trước: thiếu chờ, khoá, mặc định; Cá nhân thiếu hai biến thể và hộp; mỗi màn một khổ. | Hộp đổi thiếu ô mật khẩu hiện tại, hay lỗi «Thử lại sau ít phút» nằm sai chỗ, hay hộp tràn ở 375 — E10 vẫn PASS. | Bảng ST × 2 khổ viết trước, số ảnh = số ô; mở hộp Cá nhân ở hai biến thể; dựng trạng thái bằng kết nối chủ. | fixed: E10 ma trận tám ST × hai khổ (16 ảnh) cộng ô suôn sẻ; E22 mới cho Người dùng và Cá nhân (16 ảnh, hộp doi và dat); bàn dựng trạng thái thu/dung-trang-thai.mjs dựng ở S3; AC-9 nói rõ «mọi trạng thái × hai khổ». |
