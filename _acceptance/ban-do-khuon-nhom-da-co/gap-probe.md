---
slug: ban-do-khuon-nhom-da-co
at: 2026-10-31T09:15:00Z
verdict: findings
p0: 2
p1: 3
p2: 0
---

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P0 | contract (sổ d-3) | Căn cứ «mục tiêu» của dòng chỗ đặt khuôn trích dòng «Trống · lỗi · báo» của vo-va-ia, câu ấy không quyết chỗ đặt tệp và còn trỏ khối đích empty-state-* khác với cách ghép Empty + Alert của thiết kế | Chủ kho tin cách dựng trạng thái đã được vo-va-ia chốt; thang dùng lại (khối đã chọn trước) bị bỏ qua; tới Cổng Bằng chứng mới lộ màn trống lệch khối đích | Thay d-3 bằng dòng mới có supersedes, tách vế chỗ đặt và vế ghép thay khối đích | fixed: hai dòng mới thay d-3 — chỗ đặt (một lối: dời khuôn đã có ra ngoài vùng đã khai của hàng); ghép Empty + Alert (một lối: empty-state-* là khối Pro, kho chưa có khoá ReUI theo ADR-0006 mục 7; khối đích giữ ở vo-va-ia, chuyển thể vào TrangThai khi có khoá) |
| P0 | contract (sổ d-6) | Bỏ design-pass bằng lý do «không có màn mới» trong khi khối báo và khung Cài đặt sàn có bề ngoài mới; E6, E7 không chụp trước/sau; ma trận khổ và giao diện của AC-7 hở; DỰNG D không nói hai-san@ | Chủ kho duyệt khối báo bằng chữ; màn đăng nhập ở 375 tối đổi mà E7 vẫn đạt vì chữ khớp; tới Cổng Bằng chứng mới chê bề ngoài | Thay d-6; E7 ma trận 4 màn × 2 khổ × 2 giao diện viết trước; dựng hai-san@ | fixed: dòng mới thay d-6 nói thẳng khối báo lần đầu thấy ở ảnh E6 và đổi là một tệp TrangThai (chủ kho chỉ quyết ở cổng); E7 nay ma trận 16 ô viết trước, mỗi ô một ảnh, ghi tràn ngang và độ đọc được; DỰNG D nêu hai-san@ quản trị duy nhất ở Sàn mẫu B. rejected một vế: cặp ảnh nhánh chính — Khung, trang chọn sàn và trang đăng nhập không đổi tệp; chữ ghim nguyên văn thay cho cặp ảnh, dựng bản nhánh chính (worktree + cài) đắt hơn giá trị |
| P1 | evals (E3, E4) | Ca đỏ tự dựng vừa bộ quét, không rút dạng lệch thật; nhan_dien của trang-thai không có danh sách viết trước; ngưỡng ≥ 5 lỏng | nhan_dien thu hẹp làm «0 lệch» đạt dễ; bộ quét mù đúng dạng lệch hàng này sinh ra để sửa | Ca đỏ bằng đúng dạng cũ của Người dùng; danh sách tệp viết trước, deepEqual; số chỗ bằng đúng 5; nói giới hạn chữ trần không role | fixed: E3 thêm ca gốc `<main min-h-svh>` như trước hàng này và bảng tên tệp từng nhóm (deepEqual); E4 đặt lại đúng dòng cũ `<p role="alert" className="text-sm text-destructive">`, danh sách nhan_dien viết trước, số chỗ TrangThai đúng 5; AC-4 và Notes khai giới hạn chữ trần không role |
| P1 | evals (E6) | AC-6 qua API mà không gắn cross-layer, không eval backend-effect; thao tác bị từ chối không xác định («hoặc»); chữ lỗi không ghim; chỉ đo một thao tác | Sàn mẫu A có nhiều quản trị nên API cho bỏ quan-tri@, dữ liệu thử gãy; khối báo đỏ chưa từng hiện qua đường API | Gắn cross-layer; chọn thao tác chắc bị từ chối; ghi mã phản hồi; ghim chữ lỗi; thêm bước đổi vai | fixed: AC-6 gắn (cross-layer); E6 dùng hai-san@ ở Sàn mẫu B (quản trị duy nhất): gỡ vai Quản trị và Rời sàn, mỗi lần ghi phản hồi 409 và chữ «Sàn cần ít nhất một quản trị.»; thêm E6b lớp backend-effect chạy hai ca last-admin có sẵn của members.test.ts cùng đối chứng dương |
| P1 | contract | Ngưỡng ô cơ hội không có mục «## Đường đo»; timebox «…» | Cổng Phạm vi duyệt hồ sơ mà ngưỡng không nối AC hay eval | Thêm «## Đường đo»; điền timebox | fixed: thêm «## Đường đo» nối từng vế ngưỡng với AC-1 đến AC-5; deferred: timebox ở ô cơ hội đã ký không sửa — Notes của hợp đồng ghi hàng chạy trong hạn đợt nen-2 |
