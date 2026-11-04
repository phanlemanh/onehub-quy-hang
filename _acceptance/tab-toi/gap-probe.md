---
slug: tab-toi
at: 2026-11-03T16:05:00Z
verdict: findings
p0: 1
p1: 4
p2: 0
claims_input: ok
---

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P0 | design | Dòng sổ «không làm xoá trên máy không chạm máy chủ» coi lối đẩy lệnh xoá là chết bằng lập luận vòng tròn (chính máy quyết gỡ đăng ký thông báo); lối gửi tin «xoá máy» trước khi gỡ còn sống, hợp Hỏi-1, chạm xoá dữ liệu mà ghi kho_dao false | Máy mất có mạng, không ai mở Quỹ hàng, kho đọc được bằng công cụ trình duyệt tới khi hệ điều hành dọn; chủ kho ký mục Never tưởng không còn lối | Một dòng Hỏi mới nguồn chỉ-người thay dòng cũ; chọn lối đẩy thì thêm AC và eval service worker xoá kho, chiều đỏ gỡ trước khi đẩy | human-gate1: thành Hỏi-3 (kho_dao true, supersedes dòng cũ); hợp đồng viết theo khuyến nghị — AC-10, E11, E11b; mục Never và design §4 viết lại |
| P1 | design | Hỏi-2 gói sẵn lựa chọn phụ «xoá mọi kho trên trình duyệt» trong khi AC-4 giữ kho người khác | Đầu chủ báo mất điện thoại; máy tính văn phòng dùng chung mở trang, xoá cả kho và thay đổi chưa gửi của đồng nghiệp | Hỏi riêng nêu hai phạm vi xoá; AC-7 và E7b theo lựa chọn | fixed: tách thành Hỏi-4 (khuyến nghị chỉ xoá kho người bị báo); AC-7 và E7b viết theo khuyến nghị, chiều đỏ hai phía |
| P1 | evals | Không eval nào đo đường thật: trình duyệt mang cookie phiên đã thu điều hướng tới trang của vỏ; AC-7 thiếu thẻ cross-layer | Trang máy chủ chuyển về /login không tham số, kho còn, mọi eval xanh từng nửa | Eval cross-layer: báo mất từ A, B điều hướng /today, đích /login?bi-bao-mat=1, IndexedDB không còn kho; đối chứng hết hạn thường | fixed: AC-7 mang (cross-layer); thêm E7c (ui-check, layer backend-effect) kèm đối chứng hết hạn thường |
| P1 | evals | Mặt người của dòng máy và luồng báo mất không có eval; bộ mẫu E5 không có phiên hết hạn | Nút «Báo mất máy» hiện khi k = 1, liệt phiên hết hạn, hay bấm không có hộp hỏi mà vẫn xanh | E5 thêm phiên hết hạn và lần dùng gần nhất; ma trận k = 1, k = 3, hộp hỏi, lời sau báo mất, có ảnh | fixed: E5 thêm phiên hết hạn và updatedAt; thêm E5b (ma trận 5 trạng thái + loaiMay 6 chuỗi); E1b chụp k = 1, hộp hỏi, kết quả |
| P1 | design | Hạn dấu «30 ngày» không chứng khớp cấu hình phiên thật | Hạn phiên nâng lên; máy bị báo mở lại ngày 40, dấu đã hết, kho được giữ, không ca nào đỏ | Dòng sổ trích hạn phiên thật; E9 assert hạn dấu không nhỏ hơn hạn phiên đọc từ cấu hình, chiều đỏ | fixed: dòng sổ mục tiêu trích SESSION_EXPIRES_SEC; AC-9 và E9 đo hạn dấu từ chính hằng, chiều đỏ «dấu hết trước phiên» |
