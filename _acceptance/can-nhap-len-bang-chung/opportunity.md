---
schema_version: 1
slug: can-nhap-len-bang-chung
feature: Đầu chủ nhập bảng hàng cũ từ Sheet và căn mà file ghi «còn hàng» lên ngay bảng hàng chung dù file thiếu pháp lý hay tình trạng sử dụng; mục thiếu hiện ở mức đủ và thành việc ở Hôm nay
owner: phanlemanh@gmail.com
stage: decided              # discovery | decided | archived
decision: build        # build | iterate | park | kill — người ký Cổng 0 điền
decided_by: Manh Phan
decided_at: 2026-11-07T23:25:18Z     # ISO UTC
prototype:
  base_commit:     # điểm cắt nhánh proto khỏi nhánh chính — guard diffBase khi keep
  disposition:     # keep | archive
lo_trinh_ma: can-nhap-len-bang-chung
lo_trinh_tep: docs/plan/lo-trinh.json
---

## Vấn đề & ai gặp

Mở từ hàng can-nhap-len-bang-chung của «Lộ trình onehub-quy-hang» (`docs/plan/lo-trinh.json`).

Đầu chủ nhập bảng hàng cũ từ Sheet và căn mà file ghi «còn hàng» lên ngay bảng hàng chung dù file thiếu pháp lý hay tình trạng sử dụng; mục thiếu hiện ở mức đủ và thành việc ở Hôm nay

Vì sao: Audit sàn mới ngày 0 §9: sau khi gỡ cổng ảnh (anh-khong-chan-ban), cửa nhập vẫn đòi pháp lý và tình trạng sử dụng — hai cột Sheet hay thiếu. Mở rộng cùng lý lẽ «không thất bại ở bước chuyển nhà» cho riêng cửa nhập — chủ kho quyết ở Cổng Phạm vi

## Ngưỡng chết / ngưỡng UAT

- Câu hỏi phép đo trả lời: [đề xuất] đã đạt «Nhập 50 căn «còn hàng» thiếu pháp lý thì 50 căn ở bảng chung, đầu khách thấy; hàng tạo tay và từ lead giữ điều kiện pháp lý, tình trạng sử dụng; mỗi căn thiếu có việc ở Hôm nay của đầu chủ giữ căn» chưa?
- Kết quả nào là SỐNG: [đề xuất] Nhập 50 căn «còn hàng» thiếu pháp lý thì 50 căn ở bảng chung, đầu khách thấy; hàng tạo tay và từ lead giữ điều kiện pháp lý, tình trạng sử dụng; mỗi căn thiếu có việc ở Hôm nay của đầu chủ giữ căn
- Kết quả nào là CHẾT: [đề xuất] chưa đạt «Nhập 50 căn «còn hàng» thiếu pháp lý thì 50 căn ở bảng chung, đầu khách thấy; hàng tạo tay và từ lead giữ điều kiện pháp lý, tình trạng sử dụng; mỗi căn thiếu có việc ở Hôm nay của đầu chủ giữ căn» khi hết timebox
- Timebox: …
