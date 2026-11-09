---
schema_version: 1
slug: va-khuon-xac-nhan-bao-sai-quet-ro-ri
feature: Sự kiện báo sai của Xác nhận danh mục chỉ dựng được khi mã căn đúng dạng UPI như khuôn; phép quét rò rỉ của sự kiện đỏ được khi hàm dựng làm rò (đối chứng dương trên chính đường dựng); và phép quét cả lớp chuỗi đo được khuôn có chặn chữ tự do và dãy số dáng điện thoại, không chỉ «có khuôn».
owner: phanlemanh@gmail.com
stage: decided                # discovery | decided | archived
decision: build   # build | iterate | park | kill — người ký Cổng 0 điền
decided_by: Manh Phan
decided_at: 2026-11-08T11:31:41Z   # ISO UTC — lúc ghi lệnh signoff hàng 95, chủ kho gõ ở phiên dãy G
prototype:
  base_commit:     # điểm cắt nhánh proto khỏi nhánh chính — guard diffBase khi keep
  disposition:     # keep | archive
lo_trinh_ma: va-khuon-xac-nhan-bao-sai-quet-ro-ri
lo_trinh_tep: docs/plan/lo-trinh.json
---

## Vấn đề & ai gặp

Mở từ hàng va-khuon-xac-nhan-bao-sai-quet-ro-ri của «Lộ trình onehub-quy-hang» (`docs/plan/lo-trinh.json`).

Sự kiện báo sai của Xác nhận danh mục chỉ dựng được khi mã căn đúng dạng UPI như khuôn; phép quét rò rỉ của sự kiện đỏ được khi hàm dựng làm rò (đối chứng dương trên chính đường dựng); và phép quét cả lớp chuỗi đo được khuôn có chặn chữ tự do và dãy số dáng điện thoại, không chỉ «có khuôn».

Vì sao: Ngoài-5, Ngoài-7, Ngoài-8 của khuon-xac-nhan-danh-muc (#206): chủ kho chọn «mở hợp đồng mới» ở Cổng Bằng chứng 08/11 (sổ d-20261108T113141Z-37, -39, -40); làm trước hoặc trong hàng 97, khi chưa có đường chảy thật. Hàng không mã — đã quyết. Dãy G.

Căn cứ Cổng Đáng: chủ kho gõ tại phiên dãy G, lệnh signoff hàng 95 ngày 08/11, nguyên văn «Ngoài-5: mở hợp đồng mới», «Ngoài-7: mở hợp đồng mới», «Ngoài-8: mở hợp đồng mới» (sổ `_acceptance/khuon-xac-nhan-danh-muc/decisions.jsonl` d-20261108T113141Z-37, -39, -40); giám sát dẫn căn cứ ở yêu cầu G-34, không quyết mới. Máy đọc «mở hợp đồng mới» là `build` cho hàng gom ba mục này; chủ kho vẫn ký Cổng Phạm vi và Cổng Bằng chứng (T3).

## Ngưỡng chết / ngưỡng UAT

- Câu hỏi phép đo trả lời: [đề xuất] đã đạt «Căn mã lạ thì báo sai bị từ chối ngay ở sàn; cấy một trường rò vào hàm dựng thì phép quét rò rỉ đỏ; chuỗi có chữ tự do hay dãy số dáng điện thoại bị phép quét cả lớp bắt» chưa?
- Kết quả nào là SỐNG: [đề xuất] Căn mã lạ thì báo sai bị từ chối ngay ở sàn; cấy một trường rò vào hàm dựng thì phép quét rò rỉ đỏ; chuỗi có chữ tự do hay dãy số dáng điện thoại bị phép quét cả lớp bắt
- Kết quả nào là CHẾT: [đề xuất] chưa đạt «Căn mã lạ thì báo sai bị từ chối ngay ở sàn; cấy một trường rò vào hàm dựng thì phép quét rò rỉ đỏ; chuỗi có chữ tự do hay dãy số dáng điện thoại bị phép quét cả lớp bắt» khi hết timebox
- Timebox: …
