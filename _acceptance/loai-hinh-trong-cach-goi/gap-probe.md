---
slug: loai-hinh-trong-cach-goi
at: 2026-11-08T23:33:51Z
verdict: findings
p0: 2
p1: 3
p2: 0
---

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P0 | evals | Vế máy chủ từ chối và giá trị có dấu cách của AC-3 không eval nào tới máy chủ; AC-3, AC-7 thiếu tag xuyên lớp; thiếu cặp riêng–riêng; AC-2 chưa đo căn không đổi | Check migration hay tuyến PUT từ chối khoá có dấu cách, hoặc lưu được tên trùng qua API; mọi eval vẫn xanh | Gắn tag; PUT Single Family Residence trên Postgres; năm dòng từ chối có ghim lý do; căn bằng nhau trước và sau | fixed: AC-3, AC-7 tag cross-layer; thêm E3c, mở rộng E2, E3 |
| P0 | design | Bốn dòng sổ S1 ghi căn cứ sai: tên trường, không migration, không ra ngoài, bỏ design-pass | Chủ kho duyệt phần máy tự mở rộng; chặn ra ngoài bị dán nhãn bất biến | Viết dòng sổ mới, đổi căn cứ | fixed: bốn dòng sổ mới mang supersedes, trích câu thật sự quyết; design nói rõ là phạm vi hàng, không phải bất biến |
| P1 | evals | AC-6 chỉ quét JSX; Hôm nay và bảng thẻ không nhìn màn; E6 không chốt số lời gọi; E9 không đổi phiên đầu chủ; Given AC-9 thiếu căn hộ; E5 không ghim khuôn thật | Đầu chủ đọc từ vựng hỏng, hoặc hồ sơ ở Hôm nay ngoài cây provider, mọi eval xanh | E9 thêm đầu chủ và Hôm nay; E6 đếm lời gọi; E5 dựng qua khuôn thật | fixed: E9 chạy phiên đầu chủ, thêm buoc Hôm nay; Given AC-9 có căn hộ; E6 chốt bảng bốn mục; E5 dựng qua chiMuc thật. Bảng thẻ dùng cùng trang và cùng provider với cạnh bảng nên không nhìn màn riêng |
| P1 | contract | Vế sắp và «Chưa rõ» không AC đo; Coverage không trỏ AC | Sắp sai thứ tự mắt thấy; hàng thiếu loại hình hiện rỗng | AC-4 thêm vế; E4 đo; Coverage trỏ AC | fixed: AC-4, E4 thêm sắp và «Chưa rõ»; Coverage ghi AC từng ô |
| P1 | design | Chưa khai mức sàn được chạm; không dòng sổ điểm biến thiên; Hỏi-1 không nêu lý do giữ cứng; đối chiếu nhiều tên chỉ có RESO | Chủ kho chốt Hỏi-1 không biết lý do, hàng sau không có mốc | Khai mức chạm; Hỏi-1 nêu lý do hoặc nói không có; ghi chưa kiểm | fixed: design khai mức chạm, K11 và #19 đã có ở sổ, S3 sửa dòng #37; Hỏi-1 nói rõ không thuộc bốn lý do và ghi chưa kiểm. rejected: eval script dò dòng sổ — sổ là tài liệu, người duyệt soi trong diff |
