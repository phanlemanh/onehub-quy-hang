---
schema_version: 1
slug: go-ma-lo
feature: Đầu chủ gõ mã lô thấp tầng kiểu nào cũng được và thấy thuộc tính lô tự điền — khu, dãy, loại hình, diện tích đất, số tầng, mặt tiền — như gõ mã căn hộ; mã đọc được mà danh mục chưa có thì báo rõ
owner: phanlemanh@gmail.com
stage: discovery              # discovery | decided | archived
decision:         # build | iterate | park | kill — người ký Cổng 0 điền
decided_by: 
decided_at:     # ISO UTC
prototype:
  base_commit:     # điểm cắt nhánh proto khỏi nhánh chính — guard diffBase khi keep
  disposition:     # keep | archive
lo_trinh_ma: 74
lo_trinh_tep: docs/plan/lo-trinh.json
---

## Vấn đề & ai gặp

Mở từ hàng 74 của «Lộ trình onehub-quy-hang» (`docs/plan/lo-trinh.json`).
Nguồn: `wiki/dot/moi-loai-hinh-3110.md#ccc48fc8fec00f5ce684d6e9f4d9a9c953db1b21` — chưa có trang: trang nền, mã LH3

Đầu chủ gõ mã lô thấp tầng kiểu nào cũng được và thấy thuộc tính lô tự điền — khu, dãy, loại hình, diện tích đất, số tầng, mặt tiền — như gõ mã căn hộ; mã đọc được mà danh mục chưa có thì báo rõ

Vì sao: Ghi chép 28/10: thấp tầng mã theo khu · dãy · lô; ADR-0016 quyết định 3

## Ngưỡng chết / ngưỡng UAT

- Câu hỏi phép đo trả lời: [đề xuất] đã đạt «Trên bộ mã lô thử có đáp án của hàng 73, đầu chủ gõ mã lô kiểu nào cũng được thì ra đúng lô và tự điền khu, dãy, loại hình, diện tích đất, số tầng, mặt tiền như mã căn hộ; mã đọc được mà danh mục chưa có thì báo rõ, không đoán; hai lô khác nhau không bao giờ ra cùng một lô» chưa?
- Kết quả nào là SỐNG: [đề xuất] Trên bộ mã lô thử có đáp án của hàng 73, đầu chủ gõ mã lô kiểu nào cũng được thì ra đúng lô và tự điền khu, dãy, loại hình, diện tích đất, số tầng, mặt tiền như mã căn hộ; mã đọc được mà danh mục chưa có thì báo rõ, không đoán; hai lô khác nhau không bao giờ ra cùng một lô
- Kết quả nào là CHẾT: [đề xuất] chưa đạt «Trên bộ mã lô thử có đáp án của hàng 73, đầu chủ gõ mã lô kiểu nào cũng được thì ra đúng lô và tự điền khu, dãy, loại hình, diện tích đất, số tầng, mặt tiền như mã căn hộ; mã đọc được mà danh mục chưa có thì báo rõ, không đoán; hai lô khác nhau không bao giờ ra cùng một lô» khi hết timebox
- Timebox: …
