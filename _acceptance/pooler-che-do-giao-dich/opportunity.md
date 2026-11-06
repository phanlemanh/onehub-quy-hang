---
schema_version: 1
slug: pooler-che-do-giao-dich
feature: "Quỹ hàng nối cơ sở dữ liệu qua pooler chế độ giao dịch, nên lượng người dùng đồng thời không còn bị trần 15 kết nối của chế độ phiên: bể danh tính bỏ tham số khởi động search_path (đặt lược đồ trong từng truy vấn hoặc giao dịch), cách ly theo dòng giữ nguyên (set local trong giao dịch), thử trên bản xem trước với chuỗi kết nối chế độ giao dịch trước khi đổi bản thật."
owner: phanlemanh@gmail.com
stage: decided              # discovery | decided | archived
decision: build        # build | iterate | park | kill — người ký Cổng 0 điền
decided_by: Giám sát đợt dau-khach-nhap (chủ kho giao quyết việc kỹ thuật)
decided_at: 2026-11-06T05:58:14Z     # ISO UTC — trả lời yêu cầu V-2
prototype:
  base_commit:     # điểm cắt nhánh proto khỏi nhánh chính — guard diffBase khi keep
  disposition:     # keep | archive
lo_trinh_ma: pooler-che-do-giao-dich
lo_trinh_tep: docs/plan/lo-trinh.json
---

## Vấn đề & ai gặp

Mở từ hàng pooler-che-do-giao-dich của «Lộ trình onehub-quy-hang» (`docs/plan/lo-trinh.json`).

Quỹ hàng nối cơ sở dữ liệu qua pooler chế độ giao dịch, nên lượng người dùng đồng thời không còn bị trần 15 kết nối của chế độ phiên: bể danh tính bỏ tham số khởi động search_path (đặt lược đồ trong từng truy vấn hoặc giao dịch), cách ly theo dòng giữ nguyên (set local trong giao dịch), thử trên bản xem trước với chuỗi kết nối chế độ giao dịch trước khi đổi bản thật.

Vì sao: Gốc lâu dài của sự cố 06/11 (PR #155 chỉ thu nhỏ bể; known-limits: hàm serverless tự nhân bản khi tải tăng vẫn cạn được 15 kết nối chế độ phiên). Phiên SC đề xuất; giám sát xếp thành hàng vì là việc kỹ thuật. Đổi DATABASE_URL bản thật là bước vận hành chủ kho duyệt ở Cổng Bằng chứng.

## Ngưỡng chết / ngưỡng UAT

- Câu hỏi phép đo trả lời: [đề xuất] đã đạt «Trên bản xem trước dùng pooler chế độ giao dịch: đăng nhập, Hôm nay, Bảng hàng chạy; bộ kiểm cách ly xanh; tải đồng thời 40 trang không còn EMAXCONNSESSION» chưa?
- Kết quả nào là SỐNG: [đề xuất] Trên bản xem trước dùng pooler chế độ giao dịch: đăng nhập, Hôm nay, Bảng hàng chạy; bộ kiểm cách ly xanh; tải đồng thời 40 trang không còn EMAXCONNSESSION
- Kết quả nào là CHẾT: [đề xuất] chưa đạt «Trên bản xem trước dùng pooler chế độ giao dịch: đăng nhập, Hôm nay, Bảng hàng chạy; bộ kiểm cách ly xanh; tải đồng thời 40 trang không còn EMAXCONNSESSION» khi hết timebox
- Timebox: …
