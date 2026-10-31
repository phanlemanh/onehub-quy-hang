---
schema_version: 1
slug: khu-va-loai-hinh
feature: Lõi, API và tài liệu gọi khu chứa căn là SubdivisionName, mỗi căn mang loại hình PropertyType và PropertySubType theo RESO, và trường dùng được của từng loại hình đọc từ một bảng dữ liệu của lõi
owner: phanlemanh@gmail.com
stage: decided                # discovery | decided | archived
decision: build   # build | iterate | park | kill — người ký Cổng 0 điền
decided_by: Manh Phan
decided_at: 2026-10-31T15:07:54Z   # ISO UTC
prototype:
  base_commit:     # điểm cắt nhánh proto khỏi nhánh chính — guard diffBase khi keep
  disposition:     # keep | archive
lo_trinh_ma: 72
lo_trinh_tep: docs/plan/lo-trinh.json
---

## Vấn đề & ai gặp

Mở từ hàng 72 của «Lộ trình onehub-quy-hang» (`docs/plan/lo-trinh.json`).
Nguồn: `wiki/dot/moi-loai-hinh-3110.md#ccc48fc8fec00f5ce684d6e9f4d9a9c953db1b21` — chưa có trang: trang nền, mã LH1, mã LH2

Lõi, API và tài liệu gọi khu chứa căn là SubdivisionName, mỗi căn mang loại hình PropertyType và PropertySubType theo RESO, và trường dùng được của từng loại hình đọc từ một bảng dữ liệu của lõi

Vì sao: Chủ kho 31/10: bỏ chữ «dự án», gọi theo RESO DD 2.1; ADR-0016 quyết định 1, 2, 8. Đi trước hàng 10 và 24 để không dựng thêm mã trên tên cũ

## Ngưỡng chết / ngưỡng UAT

- Câu hỏi phép đo trả lời: [đề xuất] đã đạt «Không còn projectKey, projectName ở lõi, API, dữ liệu mẫu, Tham chiếu, CONTEXT; tra mã căn theo ?subdivision= ra đúng như hàng 9 và 63, ?project= bị từ chối; mọi căn mẫu mang Residential / Condominium; bảng trường theo loại hình có bốn loại và lõi từ chối trường không thuộc loại hình của căn» chưa?
- Kết quả nào là SỐNG: [đề xuất] Không còn projectKey, projectName ở lõi, API, dữ liệu mẫu, Tham chiếu, CONTEXT; tra mã căn theo ?subdivision= ra đúng như hàng 9 và 63, ?project= bị từ chối; mọi căn mẫu mang Residential / Condominium; bảng trường theo loại hình có bốn loại và lõi từ chối trường không thuộc loại hình của căn
- Kết quả nào là CHẾT: [đề xuất] chưa đạt «Không còn projectKey, projectName ở lõi, API, dữ liệu mẫu, Tham chiếu, CONTEXT; tra mã căn theo ?subdivision= ra đúng như hàng 9 và 63, ?project= bị từ chối; mọi căn mẫu mang Residential / Condominium; bảng trường theo loại hình có bốn loại và lõi từ chối trường không thuộc loại hình của căn» khi hết timebox
- Timebox: …

## Ghi chú

Cổng Đáng 31/10, chủ kho qua giám sát đợt dau-chu-dong-vao, nguyên văn: «Duyệt theo khuyến nghị» cho dòng trình
«gộp lượt cắt mọi loại hình: đồng ý · Hỏi-4: không, hai tuần thử giữ khu căn hộ · hàng 72: build, dãy D trước hàng 10».
Hỏi-1..3 của ADR-0016 chờ Cổng Phạm vi hàng này.
