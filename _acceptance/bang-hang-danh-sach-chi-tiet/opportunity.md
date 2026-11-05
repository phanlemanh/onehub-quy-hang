---
schema_version: 1
slug: bang-hang-danh-sach-chi-tiet
feature: Đầu chủ mở hồ sơ căn từ Bảng hàng thì hồ sơ là một cột đứng cạnh bảng, ngoài khung bảng, cao từ đỉnh vùng làm việc tới đáy màn, đẩy bảng sang trái và kéo chia 28–50%; thanh trên của vỏ giữ nguyên, nhóm nút Nhóm · Lọc · Cột · Xuất và +Lead không bị che; điện thoại không đổi
owner: phanlemanh@gmail.com
stage: discovery              # discovery | decided | archived
decision:         # build | iterate | park | kill — người ký Cổng 0 điền
decided_by: 
decided_at:     # ISO UTC
prototype:
  base_commit:     # điểm cắt nhánh proto khỏi nhánh chính — guard diffBase khi keep
  disposition:     # keep | archive
lo_trinh_ma: 105
lo_trinh_tep: docs/plan/lo-trinh.json
---

## Vấn đề & ai gặp

Mở từ hàng 105 của «Lộ trình onehub-quy-hang» (`docs/plan/lo-trinh.json`).

Đầu chủ mở hồ sơ căn từ Bảng hàng thì hồ sơ là một cột đứng cạnh bảng, ngoài khung bảng, cao từ đỉnh vùng làm việc tới đáy màn, đẩy bảng sang trái và kéo chia 28–50%; thanh trên của vỏ giữ nguyên, nhóm nút Nhóm · Lọc · Cột · Xuất và +Lead không bị che; điện thoại không đổi

Vì sao: Chủ kho chọn lối C ở phiên đánh giá ngăn hồ sơ căn (nguyên văn «Chọn C», 05/11; docs/design/danh-gia-ngan-chi-tiet-can.md): đầu chủ làm việc lâu trong ngăn, ngăn nổi đè bảng che nhóm nút và gần hết bảng ở màn 1280. Luật đợt 60: tách khỏi hàng 79, chạy trước 79; mọi màn Danh sách – chi tiết (103, 79, 99, 100, 102) dựng trên bố cục này

## Ngưỡng chết / ngưỡng UAT

- Câu hỏi phép đo trả lời: [đề xuất] đã đạt «Bảng hàng có hồ sơ cạnh bên dùng cột kéo chia của bộ bố cục (BoCuc nhánh danh-sach-chi-tiet: khối nguồn app-shell-11 cột kéo chia, ruột solution-crm-4; NganNoi giữ cho ngăn báo, lọc điện thoại, luồng nhiều bước); khung Bảng hàng không cao quá khung nhìn; ADR-0024 «Sửa đổi 05/11» và Tham chiếu §12 dòng 05/11; vo-va-ia, ho-so-can.md và ngoại lệ có hạn ở bang-hang.md hết lệch nhau; không chạm inventory/bulk» chưa?
- Kết quả nào là SỐNG: [đề xuất] Bảng hàng có hồ sơ cạnh bên dùng cột kéo chia của bộ bố cục (BoCuc nhánh danh-sach-chi-tiet: khối nguồn app-shell-11 cột kéo chia, ruột solution-crm-4; NganNoi giữ cho ngăn báo, lọc điện thoại, luồng nhiều bước); khung Bảng hàng không cao quá khung nhìn; ADR-0024 «Sửa đổi 05/11» và Tham chiếu §12 dòng 05/11; vo-va-ia, ho-so-can.md và ngoại lệ có hạn ở bang-hang.md hết lệch nhau; không chạm inventory/bulk
- Kết quả nào là CHẾT: [đề xuất] chưa đạt «Bảng hàng có hồ sơ cạnh bên dùng cột kéo chia của bộ bố cục (BoCuc nhánh danh-sach-chi-tiet: khối nguồn app-shell-11 cột kéo chia, ruột solution-crm-4; NganNoi giữ cho ngăn báo, lọc điện thoại, luồng nhiều bước); khung Bảng hàng không cao quá khung nhìn; ADR-0024 «Sửa đổi 05/11» và Tham chiếu §12 dòng 05/11; vo-va-ia, ho-so-can.md và ngoại lệ có hạn ở bang-hang.md hết lệch nhau; không chạm inventory/bulk» khi hết timebox
- Timebox: …

## Đề xuất thêm vào phạm vi (chờ Cổng Phạm vi)

- Cột «Đầu chủ» trên Bảng hàng — nguồn «AC-4 hàng 89»: chủ kho chọn «Thu AC-4, cột sau» ở hàng 89 (sổ quyết định
  `d-20261105T035554Z-21`); giám sát đợt khuyên làm trong hàng 105 vì hàng này đang sửa đúng phần bảng. Thành một tiêu chí
  ở Cổng Phạm vi để chủ kho duyệt.
