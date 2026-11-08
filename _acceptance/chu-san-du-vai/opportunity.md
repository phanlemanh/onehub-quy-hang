---
schema_version: 1
slug: chu-san-du-vai
feature: "Người được trao Quản trị sàn — từ công cụ mở sàn hay ở màn Người dùng — mang luôn đủ bốn vai làm việc (Telesales, Đầu chủ, Đầu khách, Trưởng nhóm): đăng nhập lần đầu đã thấy mọi nhà, mọi nút tạo và chủ nhà cả sàn; gỡ bớt vai vẫn được cho người chỉ cấu hình"
owner: phanlemanh@gmail.com
stage: decided                # discovery | decided | archived
decision: build   # build | iterate | park | kill — người ký Cổng 0 điền
decided_by: Manh Phan
decided_at: 2026-11-08T16:25:35Z     # ISO UTC — chủ kho gõ ở phiên Q: «Cổng Đáng chu-san-du-vai: build»
prototype:
  base_commit:     # điểm cắt nhánh proto khỏi nhánh chính — guard diffBase khi keep
  disposition:     # keep | archive
lo_trinh_ma: chu-san-du-vai
lo_trinh_tep: docs/plan/lo-trinh.json
---

## Vấn đề & ai gặp

Mở từ hàng chu-san-du-vai của «Lộ trình onehub-quy-hang» (`docs/plan/lo-trinh.json`).

Người được trao Quản trị sàn — từ công cụ mở sàn hay ở màn Người dùng — mang luôn đủ bốn vai làm việc (Telesales, Đầu chủ, Đầu khách, Trưởng nhóm): đăng nhập lần đầu đã thấy mọi nhà, mọi nút tạo và chủ nhà cả sàn; gỡ bớt vai vẫn được cho người chỉ cấu hình

Vì sao: Chủ kho 06/11: quản trị sàn là quyền lớn nhất, trao cho chủ sàn, nên thấy tất cả và giữ luôn các vai khác. Audit sàn mới ngày 0 mục 3b, 9. Sửa Tham chiếu §2, §6 («quản trị sàn không tự thấy chủ nhà»), ghi chú ADR-0010, ADR-0011. Chủ kho chốt cách B 06/11 (Tham chiếu §12): gán gói vai, không đổi luật theo dòng

Chủ kho 08/11 (H-33, gõ ở phiên H): mở rộng cách B thành luật chung «vai kéo theo vai» — Quản trị sàn kéo theo bốn vai làm việc, Trưởng nhóm kéo theo vai của thành viên; trao vai trên là trao kèm vai dưới, gỡ bớt được, không đổi luật theo dòng. Ba câu cho Cổng Phạm vi: Trưởng nhóm kéo theo những vai nào; có vào danh sách chia lead không; có tự giữ căn không.

## Ngưỡng chết / ngưỡng UAT

- Câu hỏi phép đo trả lời: đã đạt «Mở sàn mới thì người đầu tiên mang năm vai; tích Quản trị sàn cho một người ở màn Người dùng thì bốn vai kia tích sẵn; gỡ bớt được và lưu đúng; người mang đủ vai thấy Bảng hàng, Nhập Excel, chủ nhà cả sàn, mỗi lần mở số vẫn một vết; sàn đang chạy không đổi vai ai» chưa?
- Kết quả nào là SỐNG: Mở sàn mới thì người đầu tiên mang năm vai; tích Quản trị sàn cho một người ở màn Người dùng thì bốn vai kia tích sẵn; gỡ bớt được và lưu đúng; người mang đủ vai thấy Bảng hàng, Nhập Excel, chủ nhà cả sàn, mỗi lần mở số vẫn một vết; sàn đang chạy không đổi vai ai
- Kết quả nào là CHẾT: chưa đạt «Mở sàn mới thì người đầu tiên mang năm vai; tích Quản trị sàn cho một người ở màn Người dùng thì bốn vai kia tích sẵn; gỡ bớt được và lưu đúng; người mang đủ vai thấy Bảng hàng, Nhập Excel, chủ nhà cả sàn, mỗi lần mở số vẫn một vết; sàn đang chạy không đổi vai ai» khi hết timebox
- Timebox: 1 ngày sau khi lên bản thật.
