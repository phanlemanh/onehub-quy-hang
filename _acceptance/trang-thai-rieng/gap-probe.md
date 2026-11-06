---
slug: trang-thai-rieng
at: 2026-11-05T21:15:31Z
verdict: findings
p0: 1
p1: 4
p2: 0
---

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P0 | contract | Dòng sổ d-20261105T210846Z-4 (chặn chữ nhãn trùng nhãn mặc định hay nhãn riêng khác) ghi nguồn mục tiêu, nhưng câu trích chỉ liên quan: nó tả hại phía khách của tên giá trị phí hàng 45, còn nhãn trạng thái là company_internal không ra ngoài (Hỏi-2). Cùng dạng [ho-so-dien-thoai-product-detail-5#F2]. | Chủ kho ký vì tưởng luật chặn trùng đã có gốc, không cân lối khác (chỉ cảnh báo, chỉ chặn trùng giữa nhãn riêng); luật khoá cả màn lẫn API. | Dòng sổ mới thay d-4: trích đúng quyết định của chủ kho, hoặc chuyển thành câu chỉ-người. | fixed: dòng sổ mới mang supersedes d-20261105T210846Z-4, nguồn chi-nguoi (khuyên chặn, lối khác chỉ cảnh báo); thêm Hỏi-7 vào design doc — trình ở Cổng Phạm vi |
| P1 | evals | Design hứa đổi nhãn tại chỗ không đổi kết quả của các chỗ đọc payload to, không eval nào đo; sự kiện hàng loạt khi gỡ nhãn có thay cũng không. | Một chỗ đọc lấy sự kiện cuối (mốc «Đang bán N ngày») coi căn như vừa lên Đang bán sau lần đổi nhãn; gỡ nhãn 30 căn làm Hôm nay đặt lại số ngày. | Bài quét liệt mọi chỗ đọc, mỗi chỗ một assert; chuỗi Active t1 → đổi nhãn t2 cho t1; ca replace của AC-8. | fixed: thêm E6c (bảng viết trước mọi chỗ đọc payload to, đếm bằng grep, chuỗi t1/t2, ca replace); design §1 tách «lần đổi gần nhất» (gồm đổi nhãn) với «lúc vào trạng thái hiện tại» (bỏ đổi nhãn); AC-7 ghi mốc không đặt lại; AC-8 ghi các căn hiện ở «Mới đổi» |
| P1 | evals | Đường từ cột status_label xuống máy người khác không được đo; E12 chỉ thấy áp lạc quan trên máy người đổi. | Bản kéo đồng bộ không mang status_label: người đổi thấy «Giữ chỗ», người khác thấy «Đang giao dịch»; mọi eval vẫn xanh. | Bước người thứ hai ở E12, hay eval chạy đường đồng bộ thật sau một lần ghi thật. | fixed: thêm E3d (đường kéo đồng bộ thật trả statusLabel giu_cho) và bước 5 của E12 (ngữ cảnh trình duyệt mới, người khác thấy «Giữ chỗ») |
| P1 | evals | Hôm nay không có eval đầu tới cuối: E7 dùng bộ nhãn viết tay đúng khuôn hàm đọc, E7b chỉ đo API; không eval đo GET /company/labels trả statuses. | Trang Hôm nay không nạp bộ nhãn hay đọc sai khuôn (code ↔ ma): dòng thật hiện «Đang bán → Đang giao dịch» mà E7, E7b xanh. | Ca API labels trả statuses deepEqual statuses; ui-check trên Hôm nay. | fixed: thêm E7c (labels.statuses deepEqual statuses, qua nhanTuBang của lõi); E7 dựng bộ nhãn bằng nhanTuBang từ thân API, không viết tay; thêm E15 ui-check — trưởng nhóm đổi căn, đầu chủ thấy dòng ở «Mới đổi»; AC-7 viết lại đúng chỗ hiện (Hôm nay của đầu chủ, nhóm «Mới đổi») |
| P1 | evals | AC-2 nêu email nhưng bảng E2 không có dòng email; ngưỡng 40 ký tự chỉ có chiều đỏ, không đối chứng dương, không ca khoảng trắng hai đầu. | Bộ kiểm chỉ dò số điện thoại nên nhãn có email được lưu; hay đếm cả khoảng trắng nên nhãn hợp lệ 40 ký tự bị từ chối. | Ba dòng thêm: email lỗi, 40 ký tự ok, 40 ký tự kèm khoảng trắng hai đầu ok; E2c thêm ô email. | fixed: E2 thành mười hai dòng gồm ba dòng ấy; E2c thêm ô email → lỗi và coTheLuu false; AC-2 ghi «sau khi bỏ khoảng trắng hai đầu» |
