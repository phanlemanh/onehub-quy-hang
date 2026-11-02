---
schema_version: 1
slug: lam-lai-hom-nay-dau-chu
feature: "Đầu chủ mở Hôm nay và đọc mỗi việc trên một dòng: tên căn, cột «Vì sao hôm nay» hai tầng — lý do chữ đậm, hạn đỏ khi quá, vàng khi còn dưới 15 phút — và giá; làm việc đầu của nhóm bằng đúng một nút, một chạm; việc còn lại nằm trong ⋯; hàng đợi, luật mỗi căn một hàng đợi và ghi kết quả của hàng 22 giữ nguyên"
owner: phanlemanh@gmail.com
stage: decided                # discovery | decided | archived
decision: build   # build | iterate | park | kill — người ký Cổng 0 điền
decided_by: Manh Phan
decided_at: 2026-11-02T16:09:49Z   # ISO UTC
prototype:
  base_commit:     # điểm cắt nhánh proto khỏi nhánh chính — guard diffBase khi keep
  disposition:     # keep | archive
lo_trinh_ma: 92
lo_trinh_tep: docs/plan/lo-trinh.json
---

## Vấn đề & ai gặp

Mở từ hàng 92 của «Lộ trình onehub-quy-hang» (`docs/plan/lo-trinh.json`).

Đầu chủ mở Hôm nay và đọc mỗi việc trên một dòng: tên căn, cột «Vì sao hôm nay» hai tầng — lý do chữ đậm, hạn đỏ khi quá, vàng khi còn dưới 15 phút — và giá; làm việc đầu của nhóm bằng đúng một nút, một chạm; việc còn lại nằm trong ⋯; hàng đợi, luật mỗi căn một hàng đợi và ghi kết quả của hàng 22 giữ nguyên

Vì sao: Quyết định 14A của chủ kho 02/11 (PR #88, vo-va-ia §2): bản hàng 22 rối nút và lý do khó đọc; khối đích đổi từ data-grid-grouping-1 sang solution-agents-2 cộng ô hạn của data-grid-base-5. Hàng 39 dựng bản điện thoại trên khuôn mới nên đứng sau

## Ngưỡng chết / ngưỡng UAT

- Câu hỏi phép đo trả lời: [đề xuất] đã đạt «Mỗi dòng đúng một nút viền cùng bề rộng, nhãn là việc đầu của nhóm (Nhận · Đã gọi · Còn · giữ giá); Trả lại có hỏi lại, Đổi giá, trạng thái, Mở hồ sơ nằm trong ⋯; cột Lý do và Hạn gộp thành một ô hai tầng; mười tiêu chí đã ký của hàng 22 vẫn đạt; khuôn KhungHomNay và bảng «Khối đã chuyển thể» của danh mục ghi khối mới» chưa?
- Kết quả nào là SỐNG: [đề xuất] Mỗi dòng đúng một nút viền cùng bề rộng, nhãn là việc đầu của nhóm (Nhận · Đã gọi · Còn · giữ giá); Trả lại có hỏi lại, Đổi giá, trạng thái, Mở hồ sơ nằm trong ⋯; cột Lý do và Hạn gộp thành một ô hai tầng; mười tiêu chí đã ký của hàng 22 vẫn đạt; khuôn KhungHomNay và bảng «Khối đã chuyển thể» của danh mục ghi khối mới
- Kết quả nào là CHẾT: [đề xuất] chưa đạt «Mỗi dòng đúng một nút viền cùng bề rộng, nhãn là việc đầu của nhóm (Nhận · Đã gọi · Còn · giữ giá); Trả lại có hỏi lại, Đổi giá, trạng thái, Mở hồ sơ nằm trong ⋯; cột Lý do và Hạn gộp thành một ô hai tầng; mười tiêu chí đã ký của hàng 22 vẫn đạt; khuôn KhungHomNay và bảng «Khối đã chuyển thể» của danh mục ghi khối mới» khi hết timebox
- Timebox: …
