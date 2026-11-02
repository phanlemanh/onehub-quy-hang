---
schema_version: 1
slug: va-duong-loi-hoan-tac
feature: "Đầu chủ hoàn tác một lần sửa hay một lô mà máy không ghi được: thông báo nói đúng căn nào chưa trả về và vì sao, lần hoàn tác chưa xong vẫn bấm lại được, lỗi bất ngờ sau khi ô sửa đã đóng hiện thông báo thay vì im lặng"
owner: phanlemanh@gmail.com
stage: decided              # discovery | decided | archived
decision: build   # build | iterate | park | kill — người ký Cổng 0 điền
decided_by: Manh Phan
decided_at: 2026-11-02T09:55:25Z   # ISO UTC
prototype:
  base_commit:     # điểm cắt nhánh proto khỏi nhánh chính — guard diffBase khi keep
  disposition:     # keep | archive
lo_trinh_ma: 88
lo_trinh_tep: docs/plan/lo-trinh.json
---

## Vấn đề & ai gặp

Mở từ hàng 88 của «Lộ trình onehub-quy-hang» (`docs/plan/lo-trinh.json`).

Đầu chủ hoàn tác một lần sửa hay một lô mà máy không ghi được: thông báo nói đúng căn nào chưa trả về và vì sao, lần hoàn tác chưa xong vẫn bấm lại được, lỗi bất ngờ sau khi ô sửa đã đóng hiện thông báo thay vì im lặng

Vì sao: Chủ kho chọn «mở hợp đồng mới» ở Cổng Bằng chứng hàng 16 (Ngoài-3: hoàn tác lô báo thành công dù vài căn chưa ghi); gộp cùng giới hạn đã ghi ở va-sua-tren-o (Ngoài-1: hoàn tác hỏng vẫn đánh dấu đã hoàn tác; Ngoài-3: lỗi bất ngờ sau khi ô sửa đóng thì im lặng) vì cùng đường lỗi

## Ngưỡng chết / ngưỡng UAT

- Câu hỏi phép đo trả lời: [đề xuất] đã đạt «Tiêm lỗi ghi ở kho trên máy cho 2 trong 5 căn của một lô rồi hoàn tác: thông báo kể đúng 2 căn chưa trả về, bấm lại hoàn tác được 2 căn ấy; lỗi bất ngờ sau khi ô sửa đóng hiện thông báo; hoàn tác thành công không đổi hành vi» chưa?
- Kết quả nào là SỐNG: [đề xuất] Tiêm lỗi ghi ở kho trên máy cho 2 trong 5 căn của một lô rồi hoàn tác: thông báo kể đúng 2 căn chưa trả về, bấm lại hoàn tác được 2 căn ấy; lỗi bất ngờ sau khi ô sửa đóng hiện thông báo; hoàn tác thành công không đổi hành vi
- Kết quả nào là CHẾT: [đề xuất] chưa đạt «Tiêm lỗi ghi ở kho trên máy cho 2 trong 5 căn của một lô rồi hoàn tác: thông báo kể đúng 2 căn chưa trả về, bấm lại hoàn tác được 2 căn ấy; lỗi bất ngờ sau khi ô sửa đóng hiện thông báo; hoàn tác thành công không đổi hành vi» khi hết timebox
- Timebox: …
