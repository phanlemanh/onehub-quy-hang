---
schema_version: 1
slug: danh-muc-xa-day-du
feature: "Danh mục đơn vị hành chính cấp xã đầy đủ cho lõi địa chỉ: 3.321 xã theo Phụ lục II Quyết định 19/2025/QĐ-TTg, bảng phường cũ → mới cả nước theo các nghị quyết sắp xếp cấp xã, tên tỉnh cũ → mới; đối chiếu lại mã 34 tỉnh và 4 phường TP.HCM của hàng 75 trước khi hàng 76 lưu khoá. Chủ kho chọn nguồn và cho phép tải (Hỏi-1 hàng 75, duyệt 05/11)."
owner: phanlemanh@gmail.com
stage: decided                # discovery | decided | archived
decision: build # build | iterate | park | kill — người ký Cổng 0 điền
decided_by: Manh Phan
decided_at: 2026-11-05T12:10:05Z    # ISO UTC
prototype:
  base_commit:     # điểm cắt nhánh proto khỏi nhánh chính — guard diffBase khi keep
  disposition:     # keep | archive
lo_trinh_ma: danh-muc-xa-day-du
lo_trinh_tep: docs/plan/lo-trinh.json
---

## Vấn đề & ai gặp

Mở từ hàng danh-muc-xa-day-du của «Lộ trình onehub-quy-hang» (`docs/plan/lo-trinh.json`).

Danh mục đơn vị hành chính cấp xã đầy đủ cho lõi địa chỉ: 3.321 xã theo Phụ lục II Quyết định 19/2025/QĐ-TTg, bảng phường cũ → mới cả nước theo các nghị quyết sắp xếp cấp xã, tên tỉnh cũ → mới; đối chiếu lại mã 34 tỉnh và 4 phường TP.HCM của hàng 75 trước khi hàng 76 lưu khoá. Chủ kho chọn nguồn và cho phép tải (Hỏi-1 hàng 75, duyệt 05/11).

Vì sao: Chủ kho duyệt Cổng Phạm vi hàng 75 (05/11), Hỏi-1 theo khuyến nghị: hàng 75 giao bộ đọc, 34 tỉnh và phần trích TP.HCM; danh mục cấp xã đầy đủ thành hàng dữ liệu riêng, chủ kho chọn nguồn và cho phép tải ở Cổng Phạm vi của hàng này. Hàng không mã: đã quyết.

## Ngưỡng chết / ngưỡng UAT

- Câu hỏi phép đo trả lời: [đề xuất] lõi địa chỉ đã nhận đúng mọi xã, phường của 34 tỉnh (tên mới, tên cũ trước sắp xếp) và mã của hàng 75 đã khớp danh mục chính thống chưa?
- Kết quả nào là SỐNG: [đề xuất] đủ 3.321 đơn vị cấp xã theo nguồn chủ kho chọn; địa chỉ ghi phường cũ hay tỉnh cũ ra đúng phường, tỉnh mới; mã 34 tỉnh và 4 phường TP.HCM của hàng 75 khớp nguồn (hoặc lệch được gọi tên và sửa trước hàng 76)
- Kết quả nào là CHẾT: [đề xuất] thiếu xã so với nguồn, một tên cũ trỏ sai phường mới, hoặc mã hàng 75 lệch nguồn mà không ai biết
- Timebox: [đề xuất] một vòng, xong trước khi hàng 76 lưu khoá

Cổng Đáng: hàng lộ trình không mã — chủ kho đã quyết ở Cổng Phạm vi hàng 75 (Hỏi-1, `_acceptance/dia-chi-chuan/decisions.jsonl` d-20261105T115755Z-6, duyệt 05/11); giám sát đợt xác nhận (trả lời X-9, 06/11).
