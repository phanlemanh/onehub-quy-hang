---
schema_version: 1
slug: bang-hang-theo-loai-hinh
feature: Đầu chủ mở bảng hàng có cả căn hộ, nhà phố và đất, lọc và nhóm theo loại hình, và thấy cột, hồ sơ căn đúng trường của từng loại — không cột tầng, trục cho đất
owner: phanlemanh@gmail.com
stage: decided                # discovery | decided | archived
decision: build # build | iterate | park | kill — người ký Cổng 0 điền
decided_by: Manh Phan
decided_at: 2026-11-05T12:56:24Z    # ISO UTC
prototype:
  base_commit:     # điểm cắt nhánh proto khỏi nhánh chính — guard diffBase khi keep
  disposition:     # keep | archive
lo_trinh_ma: 79
lo_trinh_tep: docs/plan/lo-trinh.json
---

## Vấn đề & ai gặp

Mở từ hàng 79 của «Lộ trình onehub-quy-hang» (`docs/plan/lo-trinh.json`).
Nguồn: `wiki/dot/moi-loai-hinh-3110.md#ccc48fc8fec00f5ce684d6e9f4d9a9c953db1b21` — chưa có trang: trang nền, mã LH9

Đầu chủ mở bảng hàng có cả căn hộ, nhà phố và đất, lọc và nhóm theo loại hình, và thấy cột, hồ sơ căn đúng trường của từng loại — không cột tầng, trục cho đất

Vì sao: Ghi chép 28/10: loại hình quyết định bộ trường; ADR-0016 quyết định 2

## Ngưỡng chết / ngưỡng UAT

- Câu hỏi phép đo trả lời: [đề xuất] đã đạt «Đầu chủ mở Bảng hàng có cả căn hộ, nhà phố và đất, lọc và nhóm theo loại hình, và mỗi loại hiện đúng bộ cột và bộ trường hồ sơ của nó — đất không có cột tầng hay trục; dựng trên bố cục danh sách – chi tiết của hàng 105; trang thử nhanh-tuc-thi hết ngoại lệ có hạn» chưa?
- Kết quả nào là SỐNG: [đề xuất] Đầu chủ mở Bảng hàng có cả căn hộ, nhà phố và đất, lọc và nhóm theo loại hình, và mỗi loại hiện đúng bộ cột và bộ trường hồ sơ của nó — đất không có cột tầng hay trục; dựng trên bố cục danh sách – chi tiết của hàng 105; trang thử nhanh-tuc-thi hết ngoại lệ có hạn
- Kết quả nào là CHẾT: [đề xuất] chưa đạt «Đầu chủ mở Bảng hàng có cả căn hộ, nhà phố và đất, lọc và nhóm theo loại hình, và mỗi loại hiện đúng bộ cột và bộ trường hồ sơ của nó — đất không có cột tầng hay trục; dựng trên bố cục danh sách – chi tiết của hàng 105; trang thử nhanh-tuc-thi hết ngoại lệ có hạn» khi hết timebox
- Timebox: …
