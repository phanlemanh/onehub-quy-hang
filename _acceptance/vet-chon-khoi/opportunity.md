---
schema_version: 1
slug: vet-chon-khoi
feature: "Mọi lựa chọn khối của kho có một dòng máy đọc: khối đã chuyển thể ở danh mục giao diện kèm archetype, nhóm đang dùng, ảnh chuẩn, phiên bản ReUI, ngày và người duyệt; chỗ ghép hay tự viết ở «Chỗ hở» kèm điều đã tra trên ReUI, lý do và hạn xem lại — thiếu một ô thì npm run lint đỏ gọi đúng dòng"
owner: phanlemanh@gmail.com
stage: decided              # discovery | decided | archived
decision: build   # build | iterate | park | kill — người ký Cổng 0 điền
decided_by: Manh Phan
decided_at: 2026-10-31T23:58:34Z   # ISO UTC
prototype:
  base_commit:     # điểm cắt nhánh proto khỏi nhánh chính — guard diffBase khi keep
  disposition:     # keep | archive
lo_trinh_ma: 83
lo_trinh_tep: docs/plan/lo-trinh.json
---

## Vấn đề & ai gặp

Mở từ hàng 83 của «Lộ trình onehub-quy-hang» (`docs/plan/lo-trinh.json`).
Nguồn: `wiki/dot/cong-chon-khoi-0111.md#63e17c9393ef1f732823d3037cceab940ff9d2e2` — chưa có trang: trang nền, mã CK2, mã CK3

Mọi lựa chọn khối của kho có một dòng máy đọc: khối đã chuyển thể ở danh mục giao diện kèm archetype, nhóm đang dùng, ảnh chuẩn, phiên bản ReUI, ngày và người duyệt; chỗ ghép hay tự viết ở «Chỗ hở» kèm điều đã tra trên ReUI, lý do và hạn xem lại — thiếu một ô thì npm run lint đỏ gọi đúng dòng

Vì sao: ADR-0019 quyết định 3, 4: hàng 24 rơi xuống ghép không để vết, bốn chỗ tạm chờ khoá Pro khi khoá đã có; «trong kho» chưa tra được theo khối (catalog.md một dòng trên main)

## Ngưỡng chết / ngưỡng UAT

- Câu hỏi phép đo trả lời: [đề xuất] đã đạt «Tiêm một khối đã chuyển thể thiếu dòng danh mục → đỏ gọi tên khối; tiêm một dòng «Chỗ hở» thiếu hạn xem lại → đỏ gọi tên dòng; hai khối đã có và 13 dòng «Chỗ hở» điền ngược xanh; dòng có hạn đã tới in cảnh báo có tên, không đỏ; chỉ sửa docs ngoài hai bảng ấy → im» chưa?
- Kết quả nào là SỐNG: [đề xuất] Tiêm một khối đã chuyển thể thiếu dòng danh mục → đỏ gọi tên khối; tiêm một dòng «Chỗ hở» thiếu hạn xem lại → đỏ gọi tên dòng; hai khối đã có và 13 dòng «Chỗ hở» điền ngược xanh; dòng có hạn đã tới in cảnh báo có tên, không đỏ; chỉ sửa docs ngoài hai bảng ấy → im
- Kết quả nào là CHẾT: [đề xuất] chưa đạt «Tiêm một khối đã chuyển thể thiếu dòng danh mục → đỏ gọi tên khối; tiêm một dòng «Chỗ hở» thiếu hạn xem lại → đỏ gọi tên dòng; hai khối đã có và 13 dòng «Chỗ hở» điền ngược xanh; dòng có hạn đã tới in cảnh báo có tên, không đỏ; chỉ sửa docs ngoài hai bảng ấy → im» khi hết timebox
- Timebox: …
