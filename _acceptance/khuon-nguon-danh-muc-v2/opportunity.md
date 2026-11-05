---
schema_version: 1
slug: khuon-nguon-danh-muc-v2
feature: Gói «nguồn danh mục và thị trường» phiên bản 2 — danh mục kèm độ chắc từng giá trị, số thị trường theo toà và loại căn có mốc đo, tin rao công khai đã khớp căn — được nhận vào vùng dùng chung khi thoả thuận đang bật; gói v1 vẫn nhận trong thời gian chuyển
owner: phanlemanh@gmail.com
stage: decided                # discovery | decided | archived
decision: build # build | iterate | park | kill — người ký Cổng 0 điền
decided_by: Manh Phan
decided_at: 2026-11-05T12:56:24Z    # ISO UTC
prototype:
  base_commit:     # điểm cắt nhánh proto khỏi nhánh chính — guard diffBase khi keep
  disposition:     # keep | archive
lo_trinh_ma: 94
lo_trinh_tep: docs/plan/lo-trinh.json
---

## Vấn đề & ai gặp

Mở từ hàng 94 của «Lộ trình onehub-quy-hang» (`docs/plan/lo-trinh.json`).
Nguồn: `wiki/dot/xac-nhan-danh-muc-0311.md#fb1540377172027dcbc7535b3c822e1c65f72e8b` — chưa có trang: trang nền, mã XN1

Gói «nguồn danh mục và thị trường» phiên bản 2 — danh mục kèm độ chắc từng giá trị, số thị trường theo toà và loại căn có mốc đo, tin rao công khai đã khớp căn — được nhận vào vùng dùng chung khi thoả thuận đang bật; gói v1 vẫn nhận trong thời gian chuyển

Vì sao: Issue #94 việc 1; ADR-0017 §5 của Invest (loại kết nối «nguồn danh mục và thị trường»). Khuôn v1 (hàng 10) chỉ chở danh mục; DN5 của Invest đợi khuôn này. Độ chắc là điều kiện để hàng 100 không điền sẵn giá trị chưa chắc

## Ngưỡng chết / ngưỡng UAT

- Câu hỏi phép đo trả lời: [đề xuất] đã đạt «Gói v2 mẫu sinh từ khuôn nạp được, chạy lại không nhân đôi; gói v1 cũ vẫn nạp; khoá lạ, đường dẫn bài gốc, tên miền, ảnh tin bị từ chối cả gói; gói số thị trường sau thay gói trước của cùng khu; tắt thoả thuận thì dừng nhận; bộ kiểm cách ly xanh» chưa?
- Kết quả nào là SỐNG: [đề xuất] Gói v2 mẫu sinh từ khuôn nạp được, chạy lại không nhân đôi; gói v1 cũ vẫn nạp; khoá lạ, đường dẫn bài gốc, tên miền, ảnh tin bị từ chối cả gói; gói số thị trường sau thay gói trước của cùng khu; tắt thoả thuận thì dừng nhận; bộ kiểm cách ly xanh
- Kết quả nào là CHẾT: [đề xuất] chưa đạt «Gói v2 mẫu sinh từ khuôn nạp được, chạy lại không nhân đôi; gói v1 cũ vẫn nạp; khoá lạ, đường dẫn bài gốc, tên miền, ảnh tin bị từ chối cả gói; gói số thị trường sau thay gói trước của cùng khu; tắt thoả thuận thì dừng nhận; bộ kiểm cách ly xanh» khi hết timebox
- Timebox: …
