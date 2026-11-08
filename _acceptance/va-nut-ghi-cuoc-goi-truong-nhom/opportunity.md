---
schema_version: 1
slug: va-nut-ghi-cuoc-goi-truong-nhom
feature: "Nút chính «Ghi cuộc gọi» của hồ sơ căn điện thoại chỉ hiện cho người vào được màn ghi cuộc gọi: trưởng nhóm không có vai đầu chủ không thấy nút dẫn tới trang không có."
owner: phanlemanh@gmail.com
stage: decided                # discovery | decided | archived
decision: build # build | iterate | park | kill — người ký Cổng 0 điền
decided_by: Manh Phan
decided_at: 2026-11-05T16:04:28Z    # ISO UTC
prototype:
  base_commit:     # điểm cắt nhánh proto khỏi nhánh chính — guard diffBase khi keep
  disposition:     # keep | archive
lo_trinh_ma: va-nut-ghi-cuoc-goi-truong-nhom
lo_trinh_tep: docs/plan/lo-trinh.json
---

## Vấn đề & ai gặp

Mở từ hàng va-nut-ghi-cuoc-goi-truong-nhom của «Lộ trình onehub-quy-hang» (`docs/plan/lo-trinh.json`).

Nút chính «Ghi cuộc gọi» của hồ sơ căn điện thoại chỉ hiện cho người vào được màn ghi cuộc gọi: trưởng nhóm không có vai đầu chủ không thấy nút dẫn tới trang không có.

Vì sao: Ngoài-1/2 hàng ho-so-dien-thoai-product-detail-5: chủ kho chọn «mở hợp đồng mới» ở Cổng Bằng chứng 05/11 (mo-hinh.ts nutChinh suy từ hoiDauChu, units/call/page.tsx chặn người không có listing_agent). Hàng vá, không mã: đã quyết.

## Ngưỡng chết / ngưỡng UAT

- Câu hỏi phép đo trả lời: người không vào được màn ghi cuộc gọi có còn thấy nút «Ghi cuộc gọi» trên hồ sơ căn điện thoại không.
- Kết quả nào là SỐNG: 0 vai thấy nút mà bấm vào bị chặn; mọi vai vào được màn vẫn thấy nút.
- Kết quả nào là CHẾT: còn một vai thấy nút dẫn tới trang không có.
- Timebox: một vòng vá (hàng vá, không phiên nghiệm thu).

Quyết định build: chủ kho chọn «mở hợp đồng mới» cho Ngoài-1/2 ở Cổng Bằng chứng hàng ho-so-dien-thoai-product-detail-5
(05/11, sổ `_acceptance/ho-so-dien-thoai-product-detail-5/decisions.jsonl` d-20261105T160428Z-20, -21); giám sát áp tiền
lệ luật 64 (lựa chọn «mở hợp đồng mới» là quyết định build). Chủ kho kéo lại được.
