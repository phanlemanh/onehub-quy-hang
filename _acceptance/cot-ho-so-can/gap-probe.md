---
slug: cot-ho-so-can
at: 2026-11-01T01:08:54Z
verdict: findings
p0: 2
p1: 2
p2: 1
---
## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P0 | design | Dòng sổ bỏ tên người sửa khác mình (chỉ tên vai) ghi là máy quyết một-lối, trong khi lối «API sự kiện trả kèm tên hiển thị» vẫn sống và việc giao vai thay người là quyết định sản phẩm. Cùng mẫu [o-nhan-lead#F2] | Sàn có ba đầu chủ; lịch sử ghi «Đầu chủ: 3,40 tỷ → 3,25 tỷ», không ai biết đồng nghiệp nào hạ giá; chủ kho ký tưởng «ai sửa» đã giao đủ, AC-4 và E4 vẫn xanh | Ghi lại thành Hỏi-n nguồn chi-nguoi; Out of scope nói rõ giao vai không giao người; E4 thêm ca hai người cùng vai ra cùng nhãn | fixed: thành Hỏi-3 (dòng sổ mới supersedes d-20261101T010658Z-5), Out of scope ghi «giao vai, không giao người», E4 thêm ca chủ ý hai đầu chủ cùng nhãn |
| P0 | design | Dòng sổ «kèm toa chỉ khi mã trùng» trích Tham chiếu §routes làm căn cứ mục tiêu, nhưng câu trích chỉ khai ?unit=<mã>, không quyết cách kèm toà. Cùng mẫu [bang-hang-kieu-sheet#F1] | Link ?unit=M chép khi M chỉ ở một toà; danh mục thêm toà thứ hai cùng mã; link cũ ra «Nhiều căn» thay vì căn đã gửi | Tách dòng sổ: ?unit= là mục tiêu, cách kèm toà là một-lối có lối chết nêu được hoặc Hỏi-n; AC-1 nói rõ dạng URL; thiết kế ghi việc sửa Tham chiếu | fixed: bấm dòng luôn đặt unit+toa+lan, dòng sổ mới một-lối supersedes d-20261101T010658Z-6, AC-1 và E1 đổi theo, thiết kế ghi thêm dòng Tham chiếu §12 trong cùng PR |
| P1 | design | Thiếu ca căn không còn lần rao đang mở và ca bấm dòng của lần rao đã ngừng; URL không mang lần rao nên không chọn được lần rao đã bấm | Bấm dòng Withdrawn 3,1 tỷ mà cột hiện 3,25 tỷ của lần Active và lịch sử lần khác; căn chỉ có lần ngừng thì cột không được đặc tả | Thêm ô trục C; AC-3 thêm vế; E3 thêm hai ca ghim thông điệp; bảng trạng thái thêm dòng | fixed: URL thêm lan; AC-3 thêm vế lần rao đã ngừng và căn không còn lần mở; trục C thêm hai ô; E3 thêm 4 assert chọn lần rao kèm chiều đỏ; thiết kế thêm ST-hoso-lan-da-ngung |
| P1 | evals | AC-5 chỉ đo bằng hàm thuần với đầu vào viết tay; không eval nào ngắt mạng thật để thấy lịch sử giữ trên máy | Hook đọc lịch sử chỉ giữ trong bộ nhớ hoặc gộp mất mạng vào lỗi chung; mở lại cột khi mất mạng ra khung trống, E5 vẫn xanh | E9 thêm bước ngắt mạng, tải lại, ghi chữ và số dòng lịch sử; mở căn chưa tải ghi «Lịch sử cần mạng…» | fixed: E9 thêm bước giả lập offline, tải lại cột A, mở căn C chưa tải, kèm expected |
| P2 | evals | AC-6 chia sẻ và chép chỉ đo với navigator giả; E9 không bấm nút chia sẻ trên trình duyệt thật | Gọi chia sẻ sau bước bất đồng bộ mất quyền do người bấm, ném NotAllowedError, người bấm không thấy gì; E6 vẫn xanh | E9 bấm «Chép và mở bảng chia sẻ», ghi chữ báo hay bảng chia sẻ, lỗi console, đọc bộ nhớ tạm so với bảy mảnh | fixed: E9 thêm bước bấm chia sẻ, ghi lỗi console và nội dung bộ nhớ tạm; expected đòi không NotAllowedError |
