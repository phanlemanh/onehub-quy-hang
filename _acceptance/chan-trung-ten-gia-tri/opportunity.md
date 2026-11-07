---
schema_version: 1
slug: chan-trung-ten-gia-tri
feature: "Cách gọi riêng: khi lưu tên riêng của một giá trị, chặn chữ trùng với tên đang hiện (tên riêng hoặc tên mặc định) của giá trị khác trong cùng tập đóng; quản trị thấy lý do ngay ở ô đang sửa, không có hai lựa chọn khác nghĩa mà cùng một chữ trên bảng hàng, ô lọc hay trang khách."
owner: phanlemanh@gmail.com
stage: decided                # discovery | decided | archived
decision: build # build | iterate | park | kill — người ký Cổng 0 điền
decided_by: Manh Phan
decided_at: 2026-11-07T01:14:58Z    # ISO UTC
prototype:
  base_commit:     # điểm cắt nhánh proto khỏi nhánh chính — guard diffBase khi keep
  disposition:     # keep | archive
lo_trinh_ma: chan-trung-ten-gia-tri
lo_trinh_tep: docs/plan/lo-trinh.json
---

## Vấn đề & ai gặp

Mở từ hàng chan-trung-ten-gia-tri của «Lộ trình onehub-quy-hang» (`docs/plan/lo-trinh.json`).

Cách gọi riêng: khi lưu tên riêng của một giá trị, chặn chữ trùng với tên đang hiện (tên riêng hoặc tên mặc định) của giá trị khác trong cùng tập đóng; quản trị thấy lý do ngay ở ô đang sửa, không có hai lựa chọn khác nghĩa mà cùng một chữ trên bảng hàng, ô lọc hay trang khách.

Vì sao: Ngoài-1 và Ngoài-3 của hàng 45 cach-goi-rieng (_acceptance/cach-goi-rieng/review-findings.md): kiểm trùng bỏ sót tên mặc định của giá trị anh em chưa đổi. Chủ kho chọn «mở hợp đồng mới» ở Cổng Bằng chứng 06/11 (dãy B, yêu cầu B-16). Hàng không mã: đã quyết.

## Ngưỡng chết / ngưỡng UAT

- Câu hỏi phép đo trả lời: [đề xuất] đã đạt «Lưu tên riêng trùng tên đang hiện của giá trị khác cùng tập (riêng hay mặc định) bị từ chối ở API và báo ngay ở ô sửa; tên không trùng lưu như cũ; bài kiểm phủ cả hai đường trùng» chưa?
- Kết quả nào là SỐNG: [đề xuất] Lưu tên riêng trùng tên đang hiện của giá trị khác cùng tập (riêng hay mặc định) bị từ chối ở API và báo ngay ở ô sửa; tên không trùng lưu như cũ; bài kiểm phủ cả hai đường trùng
- Kết quả nào là CHẾT: [đề xuất] chưa đạt «Lưu tên riêng trùng tên đang hiện của giá trị khác cùng tập (riêng hay mặc định) bị từ chối ở API và báo ngay ở ô sửa; tên không trùng lưu như cũ; bài kiểm phủ cả hai đường trùng» khi hết timebox
- Timebox: …
