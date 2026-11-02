---
schema_version: 1
slug: so-diem-bien-thien
feature: Mọi điểm sàn chỉnh được khai ở một sổ của lõi — khoá, kiểu, mặc định, khoảng cho phép, ai đổi, áp cho mới hay tính lại, lớp dữ liệu — và luật của lõi nhận cấu hình làm tham số thay vì đọc hằng số
owner: phanlemanh@gmail.com
stage: discovery              # discovery | decided | archived
decision:         # build | iterate | park | kill — người ký Cổng 0 điền
decided_by: 
decided_at:     # ISO UTC
prototype:
  base_commit:     # điểm cắt nhánh proto khỏi nhánh chính — guard diffBase khi keep
  disposition:     # keep | archive
lo_trinh_ma: 81
lo_trinh_tep: docs/plan/lo-trinh.json
---

## Vấn đề & ai gặp

Mở từ hàng 81 của «Lộ trình onehub-quy-hang» (`docs/plan/lo-trinh.json`).
Nguồn: `wiki/dot/cau-hinh-theo-san-0111.md#1c5cf2675135487835527ef0631137a34455d447` — chưa có trang: trang nền, mã CH1, mã CH2

Mọi điểm sàn chỉnh được khai ở một sổ của lõi — khoá, kiểu, mặc định, khoảng cho phép, ai đổi, áp cho mới hay tính lại, lớp dữ liệu — và luật của lõi nhận cấu hình làm tham số thay vì đọc hằng số

Vì sao: ADR-0018 quyết định 1, 2: hằng số của sàn đang rải ở từng hàng (luật 7, 18, 20); Cài đặt sàn 45–50 cần một chỗ khai trước khi có màn
Số đo hai tuần thử gần nhất (Tham chiếu §11): không đo trực tiếp — bản đầu chạy bằng mặc định; hàng này giữ mặc định đúng như cũ — ngưỡng số đặt trước khi thử.

## Ngưỡng chết / ngưỡng UAT

- Câu hỏi phép đo trả lời: [đề xuất] đã đạt «Bộ kiểm của lõi: mọi khoá ở sổ tài liệu có ở sổ mã và ngược lại; không khoá nào lớp nguồn; gọi lại 14 ngày, hỏi lại 20%, hạn lead 15/30 cho cùng kết quả cũ ở mặc định, đổi đúng ở một giá trị khác trong khoảng và ở hai biên; giá trị ngoài khoảng bị từ chối nêu đúng khoá» chưa?
- Kết quả nào là SỐNG: [đề xuất] Bộ kiểm của lõi: mọi khoá ở sổ tài liệu có ở sổ mã và ngược lại; không khoá nào lớp nguồn; gọi lại 14 ngày, hỏi lại 20%, hạn lead 15/30 cho cùng kết quả cũ ở mặc định, đổi đúng ở một giá trị khác trong khoảng và ở hai biên; giá trị ngoài khoảng bị từ chối nêu đúng khoá
- Kết quả nào là CHẾT: [đề xuất] chưa đạt «Bộ kiểm của lõi: mọi khoá ở sổ tài liệu có ở sổ mã và ngược lại; không khoá nào lớp nguồn; gọi lại 14 ngày, hỏi lại 20%, hạn lead 15/30 cho cùng kết quả cũ ở mặc định, đổi đúng ở một giá trị khác trong khoảng và ở hai biên; giá trị ngoài khoảng bị từ chối nêu đúng khoá» khi hết timebox
- Timebox: …
