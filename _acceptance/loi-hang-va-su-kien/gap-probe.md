---
slug: loi-hang-va-su-kien
at: 2026-10-30T23:04:48Z
verdict: findings
p0: 2
p1: 3
p2: 0
---
## Findings
| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P0 | design | AC-4 và E4 đo theo «bảng viết trước» mà design, contract không có bảng 36 cặp; chọn cặp là luật sản phẩm, sổ không ghi | Người viết code tự đặt ma trận rồi tự đo; chủ kho ký mà chưa thấy luật; khách bỏ cọc không về được Đang bán | Bảng 6×6 vào contract dưới AC-4; một dòng sổ chỉ-người; E4 so đúng bảng đã ký | fixed: bảng 12 cặp nhận vào AC-4; dòng sổ Hỏi-3 chỉ-người, lên thẻ Cổng Phạm vi |
| P0 | design | d-6 trích tám phần của lần rao mà máy chọn năm — câu trích không quyết tập con; d-3 trích lưới cuộn ảo, không quyết việc lưu bản tính | Chủ kho tin năm phần đã chốt nên không duyệt; màn cuộc gọi thiếu mục | Đổi d-6 thành câu chỉ-người; d-3 sang một-lối có lối chết nêu được | fixed: dòng mới thay d-6 thành Hỏi-4 chỉ-người; dòng mới thay d-3 bằng một-lối (tính lúc đọc phải gấp mọi sự kiện mỗi lần đọc) |
| P1 | evals | E9 không có ca đồng thời trên đường «thắng ngay», không có ca thắng ngay vẫn xét bảng chuyển; AC-9 thiếu nhãn xuyên lớp | Đã bán và Đã cọc cùng lúc trùng seq; Withdrawn bị Closed vượt nấc cuối mà E9 xanh | Ca đồng thời hai lệnh thắng ngay; ca Withdrawn → Closed bị từ chối; ràng buộc duy nhất seq; nhãn xuyên lớp | fixed: thêm hai ca và ràng buộc duy nhất vào E9, layer backend-effect; AC-9 gắn (cross-layer) |
| P1 | evals | E10 liệt tay ba khoá source, chỉ cấp đầu, thiếu ảnh sổ, payload không khuôn chặt; E8 lấy cột từ đầu ra hàm gấp; AC-10 thiếu nhãn | Khoá source đặt tên khác hay lồng lọt vào bảng sự kiện; cột thêm mặc định now() lọt qua E8 | Khuôn chặt từng loại sự kiện, thử khoá lạ cấp đầu và lồng; E8 lấy cột từ information_schema | fixed: AC-10 đòi khuôn chặt mọi cấp, E10 thử khoá lạ và bốn khoá source ở cấp đầu và lồng; E8 lấy cột từ information_schema; AC-10 gắn (cross-layer) |
| P1 | evals | E3 quét chuỗi, bỏ sót bộ dựng câu, migrations và hàm, trigger trong cơ sở dữ liệu | Migration sau thêm hàm ghi thẳng vào bảng hàng mà E3 xanh | Mở quét sang migrations và connect, bắt bộ dựng câu; ca liệt hàm ghi vào hai bảng | fixed: E3 quét thêm migrations, connect, bộ dựng câu với hai đối chứng dương; thêm E3b liệt hàm trong cơ sở dữ liệu với đối chứng dương; AC-3 phủ cả hàm, trigger |
