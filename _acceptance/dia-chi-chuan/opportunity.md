---
schema_version: 1
slug: dia-chi-chuan
feature: Lõi đọc một địa chỉ Việt Nam gõ kiểu nào cũng được ra địa chỉ chuẩn và khoá địa chỉ, đổi tên phường cũ ra phường mới, và nói thiếu phần nào khi không đọc chắc — không gọi dịch vụ ngoài
owner: phanlemanh@gmail.com
stage: discovery              # discovery | decided | archived
decision:         # build | iterate | park | kill — người ký Cổng 0 điền
decided_by: 
decided_at:     # ISO UTC
prototype:
  base_commit:     # điểm cắt nhánh proto khỏi nhánh chính — guard diffBase khi keep
  disposition:     # keep | archive
lo_trinh_ma: 75
lo_trinh_tep: docs/plan/lo-trinh.json
---

## Vấn đề & ai gặp

Mở từ hàng 75 của «Lộ trình onehub-quy-hang» (`docs/plan/lo-trinh.json`).
Nguồn: `wiki/dot/moi-loai-hinh-3110.md#ccc48fc8fec00f5ce684d6e9f4d9a9c953db1b21` — chưa có trang: trang nền, mã LH4

Lõi đọc một địa chỉ Việt Nam gõ kiểu nào cũng được ra địa chỉ chuẩn và khoá địa chỉ, đổi tên phường cũ ra phường mới, và nói thiếu phần nào khi không đọc chắc — không gọi dịch vụ ngoài

Vì sao: ADR-0016 quyết định 5: nhà ngoài khu định danh bằng địa chỉ; địa giới hai cấp từ 1/7/2025 nên bảng hàng cũ còn tên phường cũ

## Ngưỡng chết / ngưỡng UAT

- Câu hỏi phép đo trả lời: [đề xuất] đã đạt «Trên bộ địa chỉ thử có đáp án của hàng 73: mọi cách viết của cùng một nhà ra cùng một khoá; hai nhà khác nhau không bao giờ ra cùng khoá; tên phường cũ tách vào nhiều phường mới thì trả «cần người chọn», không đoán; danh mục đơn vị hành chính trong kho ghi nguồn và ngày; không lời gọi mạng nào» chưa?
- Kết quả nào là SỐNG: [đề xuất] Trên bộ địa chỉ thử có đáp án của hàng 73: mọi cách viết của cùng một nhà ra cùng một khoá; hai nhà khác nhau không bao giờ ra cùng khoá; tên phường cũ tách vào nhiều phường mới thì trả «cần người chọn», không đoán; danh mục đơn vị hành chính trong kho ghi nguồn và ngày; không lời gọi mạng nào
- Kết quả nào là CHẾT: [đề xuất] chưa đạt «Trên bộ địa chỉ thử có đáp án của hàng 73: mọi cách viết của cùng một nhà ra cùng một khoá; hai nhà khác nhau không bao giờ ra cùng khoá; tên phường cũ tách vào nhiều phường mới thì trả «cần người chọn», không đoán; danh mục đơn vị hành chính trong kho ghi nguồn và ngày; không lời gọi mạng nào» khi hết timebox
- Timebox: …
