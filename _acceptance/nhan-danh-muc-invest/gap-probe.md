---
slug: nhan-danh-muc-invest
at: 2026-10-31T23:01:45Z
verdict: findings
p0: 2
p1: 2
p2: 1
---

# Phản biện context sạch — lượt 2 (sau gộp hàng 72)

Lượt 1 chạy trên bản nháp trước hàng 72; năm điểm của nó (mayFlow không xét loại, ma trận E6/E8, cờ luật theo dòng,
mã lỗi 42501, tập cột) đã sửa vào hồ sơ trước lượt này.

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P0 | design | Dòng sổ chọn kiểm loại thoả thuận ở cửa nhận ghi «một lối» mà không nói lối sửa lõi thoả thuận chết vì sao; điều kiện loại viết lại ngoài lõi, trái luật «mọi kết nối là một thoả thuận». | Hàng kết nối sau (nguồn lead, API công ty) hỏi mayFlow trơn và lọt lỗ khác loại; lõi và hàm cơ sở dữ liệu lệch nhau về điều kiện loại. | Đổi thành câu hỏi cho chủ kho có khuyến nghị, hoặc ghi lối chết chứng được. | human-gate1: thành Hỏi-4 (d-…-17), máy khuyên sửa lõi để mayFlow nhận loại mong đợi; thiết kế sửa câu «Không sửa agreements.ts». |
| P0 | design | Hai dòng quyết hình khuôn v1 và chỗ đặt luật loại hình ghi kho_dao false, thiếu câu trích và lối chết, trong khi khuôn là cam kết ra ngoài kho. | Invest kiểm gói bằng khuôn thì xanh mà cửa nhận vẫn trả 422 vì cặp loại hình sai; sửa phải lên v2. | Câu hỏi cho chủ kho, kho_dao true; ADR-0015 ghi luật nhận nào nằm ngoài khuôn. | human-gate1: thành Hỏi-5 (d-…-18, kho_dao true), máy khuyên hình theo lõi và luật loại hình nằm trong khuôn; thiết kế và AC-1 viết theo khuyến nghị. |
| P1 | evals | E4 không nói rõ so những trường nào, gói E1 thiếu accessRoadWidth, không ca nào đổi dữ liệu mẫu của lõi sang khuôn rồi đọc lại, E5 không đo số căn cập nhật và tên trường thân trả về. | Một trường nhà thấp tầng không được ghi hoặc ghi nhầm cột mà E1, E4 vẫn xanh; khuôn lệch tên khoá so với lõi lọt. | E4 so mọi cột của danh sách E11 cho căn hộ và nhà phố đủ bốn trường; ca đổi dữ liệu mẫu sang khuôn rồi đọc lại; E5 ghim khoá thân trả về và created/updated. | fixed: E1 thêm đủ bốn trường, ca dữ liệu mẫu đọc lại và ca luật loại hình; E4 so mọi cột; E5 ghim { subdivisions, buildings, units, created, updated }; AC-1, AC-5 viết theo. |
| P1 | evals | E6, E7 chỉ đếm bảng căn; không ca nào thử cơ sở dữ liệu từ chối giữa giao dịch sau khi cửa nhận đã cho qua. | Hàm cơ sở dữ liệu và cửa nhận xét hiệu lực theo hai đồng hồ, sát mốc thì khu đã ghi còn căn bị từ chối — khu mồ côi, E6, E7 vẫn xanh. | Đếm cả hai bảng; thêm phần tử từ chối giữa giao dịch, trả lỗi ổn định không 500. | fixed: E6, E7 đếm hai bảng; E6 thêm phần tử đổi trạng thái giữa lúc kiểm và lúc ghi → 403, hai bảng 0 dòng; thiết kế lấy mốc now() của cơ sở dữ liệu trong cùng giao dịch và đổi 42501 thành 403; AC-6 viết theo. |
| P2 | evals | Ma trận E8 thiếu «đã kết thúc» và «trỏ thoả thuận của công ty khác»; cách cơ sở dữ liệu xử câu sửa chưa ghim. | Hàm kiểm bỏ điều kiện chủ thoả thuận mà E8 vẫn xanh; đặt điều kiện ở bộ lọc dòng thì câu sửa ra 0 dòng, ca đỏ giả. | E8 chín phần tử; thiết kế ghi luật sửa dòng. | fixed: E8 chín phần tử, số lần so bằng 9; thiết kế: câu sửa using (true), điều kiện chỉ ở with check → 42501; AC-8 viết theo. |
