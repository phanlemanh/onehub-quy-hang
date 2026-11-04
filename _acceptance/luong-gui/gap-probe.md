---
slug: luong-gui
at: 2026-11-03T15:40:00Z
verdict: findings
p0: 0
p1: 4
p2: 1
---
## Findings
| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P1 | evals | Thân lời gọi Khách mới và Gửi viết tay ở fetch giả, không round-trip với khuôn thật của API hàng 86; AC-3 đi qua backend mà thiếu tag cross-layer | API đặt tên trường khác hay .strict() từ chối — E3, E7, E7b xanh mà máy thật ra 400, không Lần gửi nào được tạo | Ca test-db gửi thân do hàm thật dựng vào app Hono thật, đòi 201; đối chứng âm đổi khoá → đỏ | fixed: thân do lõi dựng (thanKhachMoi, thanLanGui ở packages/core/src/sharing/tin.ts); AC-3 gắn cross-layer; thêm E3b backend-effect đưa thân thật vào API thật kèm đối chứng âm |
| P1 | contract | Ba trạng thái UX «Chưa chọn người nhận», «Đang tạo link», «Tạo link lỗi» không có AC hay eval | Bấm Gửi khi chưa chọn khách; bấm hai lần ra hai Lần gửi; 500 xoá lựa chọn hay báo tiếng Anh — eval vẫn xanh | Bảng viết trước ba dòng trong gui.test.ts, đếm fetch, ghim thông điệp lỗi | fixed: AC-7 thêm «bấm lần nữa không tạo Lần gửi thứ hai», AC-9 thêm chưa người nhận và lỗi tạo link; E9 thêm bảng nút Gửi mở/tắt, ca bấm hai lần và 500 với thông điệp ghim |
| P1 | design | Dòng «ta cứng — họ cấu hình» Người nhận và số ảnh mỗi căn máy tự giữ cứng, không có Hỏi | Chủ kho ký mà tưởng tập người nhận và cách chọn ảnh đã có căn cứ | Mọi dòng «Có» ở bảng đối chiếu có một dòng sổ chi-nguoi | fixed: thêm Hỏi-4 (người nhận) và gộp số ảnh mỗi căn vào Hỏi-3; bảng đối chiếu trỏ Hỏi |
| P1 | design | Bỏ /s/ sang hàng 35 có hệ quả chạm người dùng thật mà sổ ghi một-lối, kho_dao false | 34 gộp và phát hành trước 35 — khách thật mở link ra trang không có | Dòng sổ chi-nguoi kho_dao true: cờ hay phát hành cùng 35 | human-gate1: thêm Hỏi-5 (kho_dao true), khuyến nghị không cờ — chưa có sàn thật trước hai tuần thử; chủ kho chọn ở Cổng Phạm vi |
| P2 | evals | Nhiều mặt người nhìn (Khách mới, tin sửa được, Chép tin, nhắc 14 ngày, lý do loại) chưa có ui-check; ý Tham chiếu của AC-10 không có thước | Unit xanh mà trên 375 nhãn bị cắt, Chép tin không hiện; Tham chiếu vẫn ghi chưa có | E11 mở rộng các bước; E10 grep ghim Tham chiếu | fixed: E11 thêm Khách mới, sửa tin, nhắc, lý do loại, Chép tin ở 1280; E10 grep dòng Tham chiếu «Đã dựng (hàng 34)» |
