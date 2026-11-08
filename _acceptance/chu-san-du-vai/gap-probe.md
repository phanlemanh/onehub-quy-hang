---
slug: chu-san-du-vai
at: 2026-11-08T16:34:08Z
verdict: findings
p0: 3
p1: 2
p2: 0
---

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P0 | evals | Vế «được lưu đúng» của AC-3 không eval nào đo tới cơ sở dữ liệu; E3b gắn nhãn backend-effect nhưng không có Postgres; ca Sửa không bấm Lưu | Nút Lưu nối sai, hoặc hộp Sửa không gọi hàm kéo theo; E3b và E4 vẫn xanh, người ký tưởng đã đo tới nơi | Đọc lại vai trên Postgres sau Mời và sau Sửa; bỏ nhãn backend-effect ở E3b | fixed: E3 thêm Lưu ở ca Sửa và đọc lại vai bằng doc-vai.mjs trên Postgres dãy Q; E3b bỏ nhãn backend-effect; AC-3 ghi lại vế đọc lại |
| P0 | contract | Dòng bỏ coverage-scan ghi nguồn một-lối sai; lưới Coverage không ô nào trỏ AC, có ô không AC nào phủ: API × tắt, màn Sửa × gỡ bớt [va-xem-them-noi-lap-dong#F1] | PATCH gộp mảng thay vì thay thế, người năm vai gỡ còn Quản trị vẫn giữ năm vai; E4 vẫn xanh | Bảng Coverage trỏ AC; AC-4, E4 thêm PATCH từ năm vai xuống một vai; đối chứng đỏ gộp mảng | fixed: Coverage thành hai bảng trỏ AC; AC-3, AC-4, E4 thêm ca; human-gate1: dòng sổ mới thành câu hỏi (d-…-11) |
| P0 | contract | Dòng bỏ design-pass ghi nguồn một-lối sai: khuôn sẵn chỉ làm bản bấm được ít giá trị hơn, không làm nó chết [bang-hang-theo-loai-hinh#F1] | Chủ kho thấy bốn ô tự tích và dòng chữ lần đầu ở E3, thấy chưa rõ phải mở lại phạm vi sau khi dựng | Đổi sang chỉ-người, thêm một câu Hỏi | human-gate1: dòng sổ mới thành câu hỏi (d-…-10), giữ khuyến nghị bỏ design-pass |
| P1 | evals | «Đăng nhập lần đầu thấy đủ nhà và nút» đo bằng hai nửa rời, không có ui-check cho AC-5; Đường đo không ghi ai chạy, đăng nhập ra sao, sàn thử xử thế nào | Bảng nhà đúng nhưng trang có điều kiện riêng; E2, E5 xanh, người mở sàn vẫn ngõ cụt; hết timebox không có kết quả | ui-check AC-5; Đường đo ghi rõ người chạy và sàn thử | fixed: thêm E5b ui-observed trên Postgres dãy Q; AC-5 gắn cross-layer; Đường đo ghi người chạy, cách đăng nhập, sàn thử giữ nhãn «[Thử]» |
| P1 | evals | Vế phủ định của AC-6 không ghim mã từ chối, không chứng phiên người thử hợp lệ | Phiên hỏng trả 401 hay 500, ca vẫn xanh; luật chặn thật hỏng mà bộ đo không thấy | Ghim mã từ chối; cùng phiên đọc được đường được phép; đối chứng đỏ | fixed: E6 ghim 404 not-found đọc từ mã thật lúc viết ca, đối chứng dương GET /company/members 200 cùng phiên, đối chứng đỏ bản giả cho xem nguồn; AC-6 ghi lại |
